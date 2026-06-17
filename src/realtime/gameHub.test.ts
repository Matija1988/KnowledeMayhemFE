import { describe, expect, it, vi } from "vitest";
import { getGameHubUrl, joinGameSessionHubGroup, registerGameHubHandlers } from "./gameHub";
import { gameActionResultFixture, gameSessionFixture } from "../tests/fixtures/gameFixtures";
import { conquestResultFixture, gameplayQuestionFixture } from "../tests/fixtures/conquestFixtures";

describe("gameHub", () => {
  it("derives the game hub URL from the API base URL", () => {
    expect(getGameHubUrl("https://localhost:5001/")).toBe("https://localhost:5001/hubs/game");
  });

  it("registers game event and reconnect handlers", () => {
    const callbacks = new Map<string, (...args: unknown[]) => void>();
    const connection = {
      on: vi.fn((name: string, callback: (...args: unknown[]) => void) => callbacks.set(name, callback)),
      onreconnecting: vi.fn(),
      onreconnected: vi.fn(),
      onclose: vi.fn(),
    };
    const handlers = {
      onSession: vi.fn(),
      onActionResult: vi.fn(),
      onMoveExecuted: vi.fn(),
      onTileOwnershipChanged: vi.fn(),
      onTurnAdvanced: vi.fn(),
      onGameplayQuestion: vi.fn(),
      onQuestionAttempt: vi.fn(),
      onConquestResult: vi.fn(),
      onPatchNeedsRefresh: vi.fn(),
      onConnectionStatus: vi.fn(),
    };

    registerGameHubHandlers(connection, handlers);
    callbacks.get("GameStartedEvent")?.({ session: gameSessionFixture() });
    callbacks.get("GameMoveExecutedEvent")?.(gameActionResultFixture());
    callbacks.get("GameTurnAdvancedEvent")?.({
      gameSessionId: "session-1",
      currentTurnPlayerId: "player-2",
      turnNumber: 2,
      reason: "Move",
    });
    callbacks.get("QuestionIssued")?.(gameplayQuestionFixture());
    callbacks.get("ConquestSucceeded")?.(conquestResultFixture());

    expect(handlers.onSession).toHaveBeenCalledWith(expect.objectContaining({ id: "session-1" }));
    expect(handlers.onActionResult).toHaveBeenCalledWith(expect.objectContaining({ turn: expect.objectContaining({ turnNumber: 2 }) }));
    expect(handlers.onTurnAdvanced).toHaveBeenCalledWith(expect.objectContaining({ currentTurnPlayerId: "player-2" }));
    expect(handlers.onGameplayQuestion).toHaveBeenCalledWith(expect.objectContaining({ questionAttemptId: "attempt-1" }));
    expect(handlers.onConquestResult).toHaveBeenCalledWith(expect.objectContaining({ resultStatus: "Succeeded" }));
    expect(connection.onreconnecting).toHaveBeenCalled();
  });

  it("subscribes to a game session update group", async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);

    await joinGameSessionHubGroup({ invoke }, "session-1");

    expect(invoke).toHaveBeenCalledWith("SubscribeToGameSession", { gameSessionId: "session-1" });
  });
});
