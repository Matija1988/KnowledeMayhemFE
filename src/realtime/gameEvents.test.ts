import { describe, expect, it } from "vitest";
import { gameActionResultFixture, gameSessionFixture } from "../tests/fixtures/gameFixtures";
import {
  gameEventNames,
  isGameMoveExecutedEvent,
  isGameTileOwnershipChangedEvent,
  isGameTurnAdvancedEvent,
  toGameActionResultEvent,
  toGameSessionEvent,
} from "./gameEvents";

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
});
