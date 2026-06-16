import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { useGameStore } from "../../stores/gameStore";
import { useLoadingStore } from "../../stores/loadingStore";
import { useGameSession } from "./useGameSession";

describe("useGameSession", () => {
  it("loads the authoritative game session for the route id", async () => {
    useAuthStore.getState().login(createJwt("user-1"));

    renderHook(() => useGameSession("session-1"));

    await waitFor(() => expect(useGameStore.getState().session?.id).toBe("session-1"));
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });

  it("turns malformed snapshots into blocking errors", async () => {
    useAuthStore.getState().login(createJwt("user-1"));

    renderHook(() => useGameSession("malformed"));

    await waitFor(() => expect(useGameStore.getState().blockingError?.reason).toBe("malformedSnapshot"));
  });

  it("sets completed and cancelled sessions as blocking states", async () => {
    useAuthStore.getState().login(createJwt("user-1"));

    const completed = renderHook(() => useGameSession("completed"));
    await waitFor(() => expect(useGameStore.getState().blockingError?.reason).toBe("completed"));
    completed.unmount();

    const cancelled = renderHook(() => useGameSession("cancelled"));
    await waitFor(() => expect(useGameStore.getState().blockingError?.reason).toBe("cancelled"));
  });

  it("does not load without auth", async () => {
    renderHook(() => useGameSession("session-1"));

    expect(useGameStore.getState().session).toBeNull();
  });

  it("selects own pieces, submits moves, and reconciles authoritative success", async () => {
    useAuthStore.getState().login(createJwt("user-1"));
    const { result } = renderHook(() => useGameSession("session-1"));

    await waitFor(() => expect(useGameStore.getState().session?.id).toBe("session-1"));

    act(() => result.current.selectPiece("piece-1"));
    expect(useGameStore.getState().candidateTargets).toContainEqual({ x: 1, y: 0 });
    await waitFor(() => expect(result.current.selectedPieceId).toBe("piece-1"));

    await act(async () => {
      await result.current.moveSelectedPiece({ x: 1, y: 0 });
    });

    expect(useGameStore.getState().session?.turnNumber).toBe(2);
    expect(useGameStore.getState().selectedPieceId).toBeNull();
  });

  it("blocks invalid selections and rejected moves without changing durable board state", async () => {
    useAuthStore.getState().login(createJwt("user-1"));
    const { result } = renderHook(() => useGameSession("session-1"));

    await waitFor(() => expect(useGameStore.getState().session?.id).toBe("session-1"));
    const originalTurn = useGameStore.getState().session?.turnNumber;

    act(() => result.current.selectPiece("piece-2"));
    expect(useGameStore.getState().selectedPieceId).toBeNull();

    act(() => result.current.selectPiece("piece-1"));
    await waitFor(() => expect(result.current.selectedPieceId).toBe("piece-1"));

    await act(async () => {
      await result.current.moveSelectedPiece({ x: 2, y: 0 });
    });

    expect(useGameStore.getState().session?.turnNumber).toBe(originalTurn);
  });
});

function createJwt(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" })).replace(/=/g, "");
  const payload = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 })).replace(/=/g, "");
  return `${header}.${payload}.`;
}
