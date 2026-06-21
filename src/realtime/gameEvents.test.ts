import { describe, expect, it } from "vitest";
import { gameActionResultFixture, gameSessionFixture } from "../tests/fixtures/gameFixtures";
import {
  gameEventNames,
  isGameMoveExecutedEvent,
  isGameTileOwnershipChangedEvent,
  isGameTurnAdvancedEvent,
  isConquestResultEvent,
  isGameplayQuestionEvent,
  toConquestResultEvent,
  toGameplayQuestionEvent,
  toGameActionResultEvent,
  toGameSessionEvent,
} from "./gameEvents";
import { conquestResultFixture, gameplayQuestionFixture } from "../tests/fixtures/conquestFixtures";

describe("gameEvents", () => {
  it("maps session and action result events", () => {
    expect(toGameSessionEvent(gameSessionFixture()).id).toBe("session-1");
    expect(toGameActionResultEvent(gameActionResultFixture()).turn.turnNumber).toBe(2);
  });

  it("guards patch event payloads", () => {
    expect(gameEventNames.moveExecuted).toBe("GameMoveExecutedEvent");
    expect(
      isGameMoveExecutedEvent({
        gameSessionId: "session-1",
        actingPlayerId: "player-1",
        pieceId: "piece-1",
        fromTileId: "tile-0-0",
        toTileId: "tile-1-0",
        turnNumber: 2,
      }),
    ).toBe(true);
    expect(isGameTileOwnershipChangedEvent({ gameSessionId: "session-1", tileId: "tile-1-0", ownerPlayerId: null })).toBe(true);
    expect(isGameTurnAdvancedEvent({ gameSessionId: "session-1", currentTurnPlayerId: "player-2", turnNumber: 2 })).toBe(true);
  });

  it("maps and guards conquest realtime payloads", () => {
    expect(gameEventNames.questionIssued).toBe("GameQuestionIssuedEvent");
    expect(isGameplayQuestionEvent(gameplayQuestionFixture())).toBe(true);
    expect(isConquestResultEvent(conquestResultFixture())).toBe(true);
    expect(
      isConquestResultEvent({
        gameSessionId: "session-1",
        questionAttemptId: "attempt-1",
        playerId: "player-1",
        pieceId: "piece-1",
        fromTileId: "tile-0-0",
        toTileId: "tile-1-0",
        ownerPlayerId: "player-1",
        turnNumber: 2,
      }),
    ).toBe(true);
    expect(toGameplayQuestionEvent(gameplayQuestionFixture()).answerOptions).toHaveLength(4);
    expect(toConquestResultEvent(conquestResultFixture()).turnNumber).toBe(2);
  });
});
