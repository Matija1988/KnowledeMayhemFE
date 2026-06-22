import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import type { GameSession } from "../../domain/game/gameTypes";
import { useBattleStore } from "../../stores/battleStore";
import { useErrorStore } from "../../stores/errorStore";
import { useGameStore } from "../../stores/gameStore";
import { battleQuestionFixture, battleResultFixture } from "../../tests/fixtures/battleFixtures";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { server } from "../../tests/setup";
import { useBattleActions } from "./useBattleActions";

describe("useBattleActions", () => {
  it("starts a valid enemy battle and does not optimistically move pieces", async () => {
    const session = battleReadySession();
    useGameStore.getState().setSession(session);
    const { result } = renderHook(() =>
      useBattleActions({ session, accessToken: "token", currentPlayerId: "player-1", selectedPieceId: "piece-1" }),
    );

    await act(async () => {
      await result.current.startBattle(session.tiles.find((tile) => tile.id === "tile-1-0")!);
    });

    expect(useBattleStore.getState().question?.attemptKind).toBe("Battle");
    expect(useBattleStore.getState().question?.questionAttemptId).toBe("battle-question-1");
    expect(useGameStore.getState().piecesById["piece-1"].currentTileId).toBe("tile-0-0");
  });

  it("rejects wrong player, captured attacker, pending lock, and invalid target locally", async () => {
    const session = battleReadySession();
    const { result, rerender } = renderHook(
      ({ selectedPieceId, currentPlayerId }: { selectedPieceId: string; currentPlayerId: string }) =>
        useBattleActions({ session, accessToken: "token", currentPlayerId, selectedPieceId }),
      { initialProps: { selectedPieceId: "piece-1", currentPlayerId: "player-2" } },
    );

    await act(async () => {
      await result.current.startBattle(session.tiles.find((tile) => tile.id === "tile-1-0")!);
    });
    expect(useErrorStore.getState().toast?.message).toMatch(/not your turn/i);

    useErrorStore.getState().clearAll();
    rerender({ selectedPieceId: "piece-3", currentPlayerId: "player-1" });
    await act(async () => {
      await result.current.startBattle(session.tiles.find((tile) => tile.id === "tile-1-0")!);
    });
    expect(useErrorStore.getState().toast?.message).toMatch(/not available/i);

    useErrorStore.getState().clearAll();
    useBattleStore.getState().beginAttempt();
    rerender({ selectedPieceId: "piece-1", currentPlayerId: "player-1" });
    await act(async () => {
      await result.current.startBattle(session.tiles.find((tile) => tile.id === "tile-1-0")!);
    });
    expect(useErrorStore.getState().toast?.message).toMatch(/resolve the current attempt/i);
  });

  it("handles backend battle rejection without board mutation", async () => {
    const session = battleReadySession();
    server.use(
      http.post("**/api/game-sessions/:gameSessionId/battle-attempts", () =>
        HttpResponse.json(
          { title: "ExpectedFailure", detail: "Battle target is stale.", status: 400 },
          { status: 400 },
        ),
      ),
    );
    useGameStore.getState().setSession(session);
    const { result } = renderHook(() =>
      useBattleActions({ session, accessToken: "token", currentPlayerId: "player-1", selectedPieceId: "piece-1" }),
    );

    await act(async () => {
      await result.current.startBattle(session.tiles.find((tile) => tile.id === "tile-1-0")!);
    });

    expect(useBattleStore.getState().blockingError).toMatch(/battle target is stale/i);
    expect(useGameStore.getState().piecesById["piece-1"].currentTileId).toBe("tile-0-0");
  });

  it("submits battle answers and applies the authoritative result", async () => {
    const session = battleReadySession();
    useGameStore.getState().setSession(session);
    const { result } = renderHook(() =>
      useBattleActions({ session, accessToken: "token", currentPlayerId: "player-1", selectedPieceId: "piece-1" }),
    );

    act(() => {
      result.current.receiveQuestion(battleQuestionFixture());
      result.current.selectAnswer("answer-1");
    });
    await waitFor(() => expect(useBattleStore.getState().selectedAnswerId).toBe("answer-1"));

    await act(async () => {
      await result.current.submitAnswer();
    });

    expect(useBattleStore.getState().lastResult?.status).toBe("Succeeded");
    expect(useGameStore.getState().piecesById["piece-2"].isCaptured).toBe(true);
  });
});

function battleReadySession(): GameSession {
  const base = gameSessionFixture();
  return {
    ...base,
    pieces: [
      base.pieces[0],
      { ...base.pieces[1], currentTileId: "tile-1-0" },
      {
        id: "piece-3",
        gameSessionId: "session-1",
        ownerPlayerId: "player-1",
        currentTileId: null,
        level: 1,
        isCaptured: true,
        createdAtUtc: "2026-06-16T10:00:00.000Z",
      },
    ],
    tiles: base.tiles.map((tile) =>
      tile.id === "tile-1-0"
        ? { ...tile, occupyingPieceId: "piece-2", ownerPlayerId: "player-2", tileType: "Normal" }
        : tile.id === "tile-2-1"
          ? { ...tile, occupyingPieceId: null }
          : tile,
    ),
  };
}
