import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { selectHasPendingConquest, useConquestStore } from "../../stores/conquestStore";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { gameplayQuestionFixture } from "../../tests/fixtures/conquestFixtures";
import { useConquestActions } from "./useConquestActions";

describe("useConquestActions", () => {
  it("refreshes authoritative state and closes an expired frozen question", async () => {
    const session = gameSessionFixture();
    const reload = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useConquestActions({
        session,
        accessToken: "token",
        currentPlayerId: "player-1",
        currentUserId: "user-1",
        selectedPieceId: "piece-1",
        reload,
      }),
    );

    act(() => {
      result.current.receiveQuestion(gameplayQuestionFixture());
      useConquestStore.getState().beginAnswer();
    });

    await act(async () => result.current.expirePending());

    expect(reload).toHaveBeenCalledOnce();
    expect(useConquestStore.getState().question).toBeNull();
    expect(useConquestStore.getState().pendingAnswer).toBe(false);
    expect(selectHasPendingConquest(useConquestStore.getState())).toBe(false);
  });
});
