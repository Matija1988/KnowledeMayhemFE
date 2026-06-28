import { describe, expect, it, vi } from "vitest";
import { getGameHubUrl, joinGameSessionHubGroup, registerGameHubHandlers } from "./gameHub";
import { gameActionResultFixture, gameSessionFixture } from "../tests/fixtures/gameFixtures";
import { conquestResultFixture, gameplayQuestionFixture } from "../tests/fixtures/conquestFixtures";
import { battleQuestionFixture, battleResultFixture, specialFieldQuestionFixture } from "../tests/fixtures/battleFixtures";

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
      onBattleQuestion: vi.fn(),
      onBattleResult: vi.fn(),
      onPieceCaptured: vi.fn(),
      onPieceLeveledUp: vi.fn(),
      onSnapshotRequired: vi.fn(),
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
    callbacks.get("GameQuestionIssuedEvent")?.(gameplayQuestionFixture());
    callbacks.get("GameConquestSucceededEvent")?.({
      gameSessionId: "session-1",
      questionAttemptId: "attempt-1",
      playerId: "player-1",
      pieceId: "piece-1",
      fromTileId: "tile-0-0",
      toTileId: "tile-1-0",
      ownerPlayerId: "player-1",
      turnNumber: 2,
    });
    callbacks.get("BattleQuestionIssuedEvent")?.({ ...battleQuestionFixture(), battleAttemptId: "battle-1" });
    callbacks.get("SpecialFieldQuestionIssuedEvent")?.({ ...specialFieldQuestionFixture(), specialFieldAttemptId: "special-1" });
    callbacks.get("SpecialFieldProgressUpdatedEvent")?.({
      gameSessionId: "session-1",
      specialFieldAttemptId: "special-1",
      correctAnswers: 3,
      requiredCorrectAnswers: 3,
      status: "Succeeded",
    });
    callbacks.get("BattleSucceededEvent")?.({ ...battleResultFixture({ session: null }), battleAttemptId: "battle-1" });
    callbacks.get("SpecialFieldFailedEvent")?.({
      gameSessionId: "session-1",
      specialFieldAttemptId: "special-1",
      actingPlayerId: "player-1",
      pieceId: "piece-1",
      sourceTileId: "tile-0-0",
      targetTileId: "tile-1-0",
      reason: "Expired",
      nextTurnPlayerId: "player-2",
      turnNumber: 2,
    });
    callbacks.get("PieceCapturedEvent")?.({ gameSessionId: "session-1", pieceId: "piece-2", removedFromTileId: "tile-2-1" });
    callbacks.get("PieceLeveledUpEvent")?.({ gameSessionId: "session-1", pieceId: "piece-1", newLevel: 2 });
    callbacks.get("GameSnapshotRequiredEvent")?.({ gameSessionId: "session-1", reason: "missed-event" });

    expect(handlers.onSession).toHaveBeenCalledWith(expect.objectContaining({ id: "session-1" }));
    expect(handlers.onActionResult).toHaveBeenCalledWith(expect.objectContaining({ turn: expect.objectContaining({ turnNumber: 2 }) }));
    expect(handlers.onTurnAdvanced).toHaveBeenCalledWith(expect.objectContaining({ currentTurnPlayerId: "player-2" }));
    expect(handlers.onGameplayQuestion).toHaveBeenCalledWith(expect.objectContaining({ questionAttemptId: "attempt-1" }));
    expect(handlers.onConquestResult).toHaveBeenCalledWith(expect.objectContaining({ resultStatus: "Succeeded" }));
    expect(handlers.onBattleQuestion).toHaveBeenCalledWith(expect.objectContaining({ attemptKind: "Battle" }));
    expect(handlers.onBattleQuestion).toHaveBeenCalledWith(expect.objectContaining({ attemptKind: "SpecialField" }));
    expect(handlers.onBattleResult).toHaveBeenCalledWith(expect.objectContaining({ status: "Succeeded" }));
    expect(handlers.onBattleResult).toHaveBeenCalledWith(expect.objectContaining({ attemptKind: "SpecialField", status: "Expired" }));
    expect(handlers.onBattleResult).toHaveBeenCalledTimes(2);
    expect(handlers.onPieceCaptured).toHaveBeenCalledWith(expect.objectContaining({ pieceId: "piece-2" }));
    expect(handlers.onPieceLeveledUp).toHaveBeenCalledWith(expect.objectContaining({ newLevel: 2 }));
    expect(handlers.onSnapshotRequired).toHaveBeenCalledWith(expect.objectContaining({ reason: "missed-event" }));
    expect(handlers.onPatchNeedsRefresh).not.toHaveBeenCalled();
    expect(connection.onreconnecting).toHaveBeenCalled();
  });

  it("keeps legacy conquest event aliases wired while supporting backend event names", () => {
    const callbacks = new Map<string, (...args: unknown[]) => void>();
    const connection = {
      on: vi.fn((name: string, callback: (...args: unknown[]) => void) => callbacks.set(name, callback)),
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
      onBattleQuestion: vi.fn(),
      onBattleResult: vi.fn(),
      onPieceCaptured: vi.fn(),
      onPieceLeveledUp: vi.fn(),
      onSnapshotRequired: vi.fn(),
      onPatchNeedsRefresh: vi.fn(),
      onConnectionStatus: vi.fn(),
    };

    registerGameHubHandlers(connection, handlers);

    expect(callbacks.has("GameConquestSucceededEvent")).toBe(true);
    expect(callbacks.has("ConquestSucceeded")).toBe(true);
  });

  it("subscribes to a game session update group", async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);

    await joinGameSessionHubGroup({ invoke }, "session-1");

    expect(invoke).toHaveBeenCalledWith("SubscribeToGameSession", { gameSessionId: "session-1" });
  });
});
