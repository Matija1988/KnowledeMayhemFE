import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { useGameStore } from "../../stores/gameStore";
import { useLoadingStore } from "../../stores/loadingStore";
import { useConquestStore } from "../../stores/conquestStore";
import { gameplayQuestionFixture } from "../../tests/fixtures/conquestFixtures";
import { server } from "../../tests/setup";
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

  it("selects own pieces and starts a conquest question without moving immediately", async () => {
    useAuthStore.getState().login(createJwt("user-1"));
    const { result } = renderHook(() => useGameSession("session-1"));

    await waitFor(() => expect(useGameStore.getState().session?.id).toBe("session-1"));

    act(() => result.current.selectPiece("piece-1"));
    expect(useGameStore.getState().candidateTargets).toContainEqual({ x: 1, y: 0 });
    await waitFor(() => expect(result.current.selectedPieceId).toBe("piece-1"));

    await act(async () => {
      await result.current.moveSelectedPiece({ x: 1, y: 0 });
    });

    expect(useConquestStore.getState().question?.questionAttemptId).toBe("attempt-1");
    expect(useGameStore.getState().session?.turnNumber).toBe(1);
    expect(useGameStore.getState().piecesById["piece-1"].currentTileId).toBe("tile-0-0");
    expect(useGameStore.getState().selectedPieceId).toBeNull();
  });

  it("suppresses duplicate conquest attempts from rapid repeated target activation", async () => {
    let attemptRequests = 0;
    server.use(
      http.post("**/api/game-sessions/:gameSessionId/conquest-attempts", async ({ params, request }) => {
        attemptRequests += 1;
        const body = (await request.json()) as { pieceId?: string; targetX?: number; targetY?: number };
        return HttpResponse.json(
          gameplayQuestionFixture({
            gameSessionId: String(params.gameSessionId),
            pieceId: body.pieceId ?? "piece-1",
            targetTileId: `tile-${body.targetX ?? 1}-${body.targetY ?? 0}`,
          }),
        );
      }),
    );
    useAuthStore.getState().login(createJwt("user-1"));
    const { result } = renderHook(() => useGameSession("session-1"));

    await waitFor(() => expect(useGameStore.getState().session?.id).toBe("session-1"));
    act(() => result.current.selectPiece("piece-1"));
    await waitFor(() => expect(result.current.selectedPieceId).toBe("piece-1"));

    await act(async () => {
      await Promise.all([result.current.moveSelectedPiece({ x: 1, y: 0 }), result.current.moveSelectedPiece({ x: 1, y: 0 })]);
    });

    expect(attemptRequests).toBe(1);
    expect(useConquestStore.getState().question?.targetTileId).toBe("tile-1-0");
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
