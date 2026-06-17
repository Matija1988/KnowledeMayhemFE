import type { ConquestResult, GameplayQuestion } from "../../domain/conquest/conquestTypes";
import { gameSessionFixture } from "./gameFixtures";

export function gameplayQuestionFixture(overrides: Partial<GameplayQuestion> = {}): GameplayQuestion {
  return {
    questionAttemptId: "attempt-1",
    questionId: "question-1",
    gameSessionId: "session-1",
    playerId: "player-1",
    pieceId: "piece-1",
    sourceTileId: "tile-0-0",
    targetTileId: "tile-1-0",
    categoryId: "cat-0",
    categoryName: "History",
    questionText: "Which answer conquers this tile?",
    answerOptions: [
      { id: "answer-1", text: "Alpha" },
      { id: "answer-2", text: "Beta" },
      { id: "answer-3", text: "Gamma" },
      { id: "answer-4", text: "Delta" },
    ],
    expiresAtUtc: null,
    ...overrides,
  };
}

export function conquestResultFixture(overrides: Partial<ConquestResult> = {}): ConquestResult {
  const session = gameSessionFixture({
    currentTurnPlayerId: "player-2",
    turnNumber: 2,
  });
  return {
    questionAttemptId: "attempt-1",
    gameSessionId: "session-1",
    resultStatus: "Succeeded",
    isCorrect: true,
    pieceId: "piece-1",
    sourceTileId: "tile-0-0",
    targetTileId: "tile-1-0",
    currentTileId: "tile-1-0",
    ownerPlayerId: "player-1",
    nextTurnPlayerId: "player-2",
    turnNumber: 2,
    session: {
      ...session,
      pieces: session.pieces.map((piece) => (piece.id === "piece-1" ? { ...piece, currentTileId: "tile-1-0" } : piece)),
      tiles: session.tiles.map((tile) => ({
        ...tile,
        occupyingPieceId: tile.id === "tile-0-0" ? null : tile.id === "tile-1-0" ? "piece-1" : tile.occupyingPieceId,
        ownerPlayerId: tile.id === "tile-1-0" ? "player-1" : tile.ownerPlayerId,
      })),
    },
    ...overrides,
  };
}

