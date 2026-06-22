import { act, renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { GameSession } from "../../domain/game/gameTypes";
import { useBattleStore } from "../../stores/battleStore";
import { useErrorStore } from "../../stores/errorStore";
import { useGameStore } from "../../stores/gameStore";
import { specialFieldQuestionFixture } from "../../tests/fixtures/battleFixtures";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { server } from "../../tests/setup";
import { useSpecialFieldActions } from "./useSpecialFieldActions";

describe("useSpecialFieldActions", () => {
  it("starts a valid unoccupied special field attempt", async () => {
    const session = specialReadySession();
    const { result } = renderHook(() =>
      useSpecialFieldActions({ session, accessToken: "token", currentPlayerId: "player-1", selectedPieceId: "piece-1" }),
    );

    await act(async () => {
      await result.current.startSpecialField(session.tiles.find((tile) => tile.id === "tile-1-0")!);
    });

    expect(useBattleStore.getState().question?.attemptKind).toBe("SpecialField");
    expect(useBattleStore.getState().question?.progress.requiredCorrectAnswers).toBe(3);
  });

  it("rejects occupied special target, wrong turn, and backend problem details without board mutation", async () => {
    const session = specialReadySession();
    const occupiedTile = { ...session.tiles.find((tile) => tile.id === "tile-1-0")!, occupyingPieceId: "piece-2" };
    const { result, rerender } = renderHook(
      ({ currentPlayerId }: { currentPlayerId: string }) =>
        useSpecialFieldActions({ session, accessToken: "token", currentPlayerId, selectedPieceId: "piece-1" }),
      { initialProps: { currentPlayerId: "player-1" } },
    );

    await act(async () => {
      await result.current.startSpecialField(occupiedTile);
    });
    expect(useErrorStore.getState().toast?.message).toMatch(/not available|occupied/i);

    useErrorStore.getState().clearAll();
    rerender({ currentPlayerId: "player-2" });
    await act(async () => {
      await result.current.startSpecialField(session.tiles.find((tile) => tile.id === "tile-1-0")!);
    });
    expect(useErrorStore.getState().toast?.message).toMatch(/not your turn/i);

    useErrorStore.getState().clearAll();
    server.use(
      http.post("**/api/game-sessions/:gameSessionId/special-field-attempts", () =>
        HttpResponse.json({ title: "ExpectedFailure", detail: "Special field expired.", status: 400 }, { status: 400 }),
      ),
    );
    useGameStore.getState().setSession(session);
    rerender({ currentPlayerId: "player-1" });
    await act(async () => {
      await result.current.startSpecialField(session.tiles.find((tile) => tile.id === "tile-1-0")!);
    });

    expect(useBattleStore.getState().blockingError).toMatch(/special field expired/i);
    expect(useGameStore.getState().piecesById["piece-1"].currentTileId).toBe("tile-0-0");
  });

  it("submits special answers, handles next questions, and marks expiration as snapshot refresh", async () => {
    const session = specialReadySession();
    useGameStore.getState().setSession(session);
    server.use(
      http.post("**/api/game-sessions/:gameSessionId/special-field-attempts/:specialFieldAttemptId/answers", () =>
        HttpResponse.json({
          specialFieldAttemptId: "special-1",
          ...specialFieldQuestionFixture({ questionAttemptId: "special-question-2", progress: { requiredCorrectAnswers: 3, correctAnswers: 1, status: "Pending" } }),
          answerOptions: specialFieldQuestionFixture().answerOptions.map((option) => ({ answerId: option.id, text: option.text })),
        }),
      ),
    );
    const { result } = renderHook(() =>
      useSpecialFieldActions({ session, accessToken: "token", currentPlayerId: "player-1", selectedPieceId: "piece-1" }),
    );

    act(() => {
      result.current.receiveQuestion(specialFieldQuestionFixture());
      result.current.selectAnswer("answer-1");
    });

    await act(async () => {
      await result.current.submitAnswer();
    });
    expect(useBattleStore.getState().question?.questionAttemptId).toBe("special-question-2");

    act(() => result.current.expirePending());
    expect(useBattleStore.getState().expiredPending).toBe(true);
    expect(useGameStore.getState().pendingOperation).toBe("reconnectGame");
  });
});

function specialReadySession(): GameSession {
  const base = gameSessionFixture();
  return {
    ...base,
    tiles: base.tiles.map((tile) =>
      tile.id === "tile-1-0" ? { ...tile, tileType: "Special", occupyingPieceId: null, ownerPlayerId: null } : tile,
    ),
  };
}
