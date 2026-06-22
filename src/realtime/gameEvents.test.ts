import { describe, expect, it } from "vitest";
import { gameActionResultFixture, gameSessionFixture } from "../tests/fixtures/gameFixtures";
import {
  gameEventNames,
  isBattleQuestionEvent,
  isBattleResultEvent,
  isGameMoveExecutedEvent,
  isGameSnapshotRequiredEvent,
  isGameTileOwnershipChangedEvent,
  isGameTurnAdvancedEvent,
  isPieceCapturedEvent,
  isPieceLeveledUpEvent,
  isSpecialFieldQuestionEvent,
  isSpecialFieldResultEvent,
  isConquestResultEvent,
  isGameplayQuestionEvent,
  toBattleQuestionEvent,
  toBattleResultEvent,
  toConquestResultEvent,
  toGameplayQuestionEvent,
  toGameActionResultEvent,
  toGameSessionEvent,
  toSpecialFieldQuestionEvent,
  toSpecialFieldResultEvent,
} from "./gameEvents";
import { conquestResultFixture, gameplayQuestionFixture } from "../tests/fixtures/conquestFixtures";
import { battleQuestionFixture, battleResultFixture, specialFieldQuestionFixture } from "../tests/fixtures/battleFixtures";
import type { BattleResultDto } from "../domain/battle/battleMappers";

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

  it("maps and guards battle and special field realtime payloads without classifying questions as results", () => {
    const battleQuestion = { ...battleQuestionFixture(), battleAttemptId: "battle-1" };
    const specialQuestion = { ...specialFieldQuestionFixture(), specialFieldAttemptId: "special-1" };
    const battleResult: BattleResultDto = {
      battleAttemptId: "battle-1",
      gameSessionId: "session-1",
      resultStatus: "Succeeded",
      movedPieceId: "piece-1",
      capturedPieceId: "piece-2",
      leveledPieceId: "piece-1",
      newLevel: 2,
      sourceTileId: "tile-0-0",
      targetTileId: "tile-1-0",
      targetOwnerPlayerId: "player-1",
      nextTurnPlayerId: "player-2",
      turnNumber: 2,
      sequence: 2,
    };
    const specialResult: BattleResultDto = {
      specialFieldAttemptId: "special-1",
      gameSessionId: "session-1",
      status: "Failed",
      movedPieceId: "piece-1",
      sourceTileId: "tile-0-0",
      targetTileId: "tile-1-0",
      turnNumber: 2,
    };

    expect(gameEventNames.battleQuestionIssued).toBe("BattleQuestionIssuedEvent");
    expect(isBattleQuestionEvent(battleQuestion)).toBe(true);
    expect(isBattleResultEvent(battleQuestion)).toBe(false);
    expect(isSpecialFieldQuestionEvent(specialQuestion)).toBe(true);
    expect(isSpecialFieldResultEvent(specialQuestion)).toBe(false);
    expect(isBattleResultEvent(battleResult)).toBe(true);
    expect(isSpecialFieldResultEvent(specialResult)).toBe(true);
    expect(toBattleQuestionEvent(battleQuestion).attemptKind).toBe("Battle");
    expect(toSpecialFieldQuestionEvent(specialQuestion).progress.requiredCorrectAnswers).toBe(3);
    expect(toBattleResultEvent(battleResult).status).toBe("Succeeded");
    expect(toSpecialFieldResultEvent(specialResult).attemptKind).toBe("SpecialField");
  });

  it("guards capture, level, and snapshot-required events without swallowing turn events", () => {
    expect(isPieceCapturedEvent({ gameSessionId: "session-1", pieceId: "piece-2", removedFromTileId: "tile-2-1" })).toBe(true);
    expect(isPieceLeveledUpEvent({ gameSessionId: "session-1", pieceId: "piece-1", newLevel: 2 })).toBe(true);
    expect(isGameSnapshotRequiredEvent({ gameSessionId: "session-1", reason: "stale-sequence" })).toBe(true);
    expect(isGameSnapshotRequiredEvent({ gameSessionId: "session-1", currentTurnPlayerId: "player-2", turnNumber: 2 })).toBe(false);
  });
});
