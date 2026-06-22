import type { BattleQuestion, BattleResult } from "../../domain/battle/battleTypes";
import { gameSessionFixture } from "./gameFixtures";

export type BattleAuditExpectation = {
  event: string;
  requiredFields: string[];
  forbiddenFrontendFields: string[];
};

export const battleAuditExpectations: BattleAuditExpectation[] = [
  {
    event: "battle-start",
    requiredFields: ["gameSessionId", "actingPlayerId", "attackingPieceId", "defendingPieceId", "requiredCorrectAnswers"],
    forbiddenFrontendFields: ["correctAnswerId", "isCorrect"],
  },
  {
    event: "answer-submission",
    requiredFields: ["questionAttemptId", "answerId", "submittedByPlayerId"],
    forbiddenFrontendFields: ["correctAnswerId", "isCorrect"],
  },
  {
    event: "battle-result",
    requiredFields: ["battleAttemptId", "status", "reason", "turnNumber"],
    forbiddenFrontendFields: ["correctAnswerId", "correctAnswerText"],
  },
  {
    event: "special-field-result",
    requiredFields: ["specialFieldAttemptId", "status", "reason", "turnNumber"],
    forbiddenFrontendFields: ["correctAnswerId", "correctAnswerText"],
  },
  {
    event: "piece-capture",
    requiredFields: ["gameSessionId", "capturedPieceId", "capturedByPieceId", "removedFromTileId"],
    forbiddenFrontendFields: ["correctAnswerId", "isCorrect"],
  },
  {
    event: "piece-level-up",
    requiredFields: ["gameSessionId", "pieceId", "newLevel"],
    forbiddenFrontendFields: ["correctAnswerId", "isCorrect"],
  },
  {
    event: "turn-advanced",
    requiredFields: ["gameSessionId", "currentTurnPlayerId", "turnNumber"],
    forbiddenFrontendFields: ["correctAnswerId", "isCorrect"],
  },
];

export function battleQuestionFixture(overrides: Partial<BattleQuestion> = {}): BattleQuestion {
  return {
    attemptKind: "Battle",
    attemptId: "battle-1",
    questionAttemptId: "battle-question-1",
    questionId: "question-1",
    gameSessionId: "session-1",
    actingPlayerId: "player-1",
    pieceId: "piece-1",
    sourceTileId: "tile-0-0",
    targetTileId: "tile-1-0",
    categoryId: "cat-0",
    categoryName: "History",
    questionText: "Which answer wins the battle?",
    answerOptions: [
      { id: "answer-1", text: "Alpha" },
      { id: "answer-2", text: "Beta" },
      { id: "answer-3", text: "Gamma" },
      { id: "answer-4", text: "Delta" },
    ],
    expiresAtUtc: null,
    progress: { requiredCorrectAnswers: 2, correctAnswers: 0, status: "Pending" },
    ...overrides,
  };
}

export function specialFieldQuestionFixture(overrides: Partial<BattleQuestion> = {}): BattleQuestion {
  return battleQuestionFixture({
    attemptKind: "SpecialField",
    attemptId: "special-1",
    questionAttemptId: "special-question-1",
    progress: { requiredCorrectAnswers: 3, correctAnswers: 0, status: "Pending" },
    ...overrides,
  });
}

export function battleResultFixture(overrides: Partial<BattleResult> = {}): BattleResult {
  const session = gameSessionFixture({ currentTurnPlayerId: "player-2", turnNumber: 2 });
  return {
    attemptKind: "Battle",
    attemptId: "battle-1",
    gameSessionId: "session-1",
    status: "Succeeded",
    reason: "completed",
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
    session: {
      ...session,
      pieces: session.pieces.map((piece) =>
        piece.id === "piece-1"
          ? { ...piece, currentTileId: "tile-1-0", level: 2 }
          : piece.id === "piece-2"
            ? { ...piece, currentTileId: null, isCaptured: true }
            : piece,
      ),
      tiles: session.tiles.map((tile) => ({
        ...tile,
        occupyingPieceId: tile.id === "tile-0-0" ? null : tile.id === "tile-1-0" ? "piece-1" : tile.occupyingPieceId,
        ownerPlayerId: tile.id === "tile-1-0" ? "player-1" : tile.ownerPlayerId,
      })),
    },
    ...overrides,
  };
}
