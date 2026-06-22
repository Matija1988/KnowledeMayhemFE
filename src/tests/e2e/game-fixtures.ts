import type { Page } from "@playwright/test";
import { hostToken } from "./lobby-fixtures";

const now = "2026-06-16T10:00:00.000Z";

export const gameSession = {
  id: "session-1",
  lobbyId: "lobby-1",
  status: "InProgress",
  boardSeed: "seed-1",
  boardWidth: 3,
  boardHeight: 2,
  currentTurnPlayerId: "player-1",
  turnNumber: 1,
  startedAtUtc: now,
  endedAtUtc: null,
  winnerPlayerId: null,
  createdAtUtc: now,
  players: [
    {
      id: "player-1",
      gameSessionId: "session-1",
      userId: "user-1",
      playerOrder: 1,
      displayName: "Alice",
      isEliminated: false,
      createdAtUtc: now,
    },
    {
      id: "player-2",
      gameSessionId: "session-1",
      userId: "user-2",
      playerOrder: 2,
      displayName: "Bob",
      isEliminated: false,
      createdAtUtc: now,
    },
  ],
  tiles: [
    tile(0, 0, "piece-1"),
    tile(1, 0),
    tile(2, 0),
    tile(0, 1),
    tile(1, 1, null, "Blocked"),
    tile(2, 1, "piece-2"),
  ],
  pieces: [
    piece("piece-1", "player-1", "tile-0-0"),
    piece("piece-2", "player-2", "tile-2-1"),
  ],
};

export const movedGameSession = {
  ...gameSession,
  currentTurnPlayerId: "player-2",
  turnNumber: 2,
  tiles: gameSession.tiles.map((candidate) => {
    if (candidate.id === "tile-0-0") {
      return { ...candidate, occupyingPieceId: null };
    }
    if (candidate.id === "tile-1-0") {
      return { ...candidate, occupyingPieceId: "piece-1", ownerPlayerId: "player-1" };
    }
    return candidate;
  }),
  pieces: gameSession.pieces.map((candidate) =>
    candidate.id === "piece-1" ? { ...candidate, currentTileId: "tile-1-0" } : candidate,
  ),
};

export const battleReadyGameSession = {
  ...gameSession,
  tiles: gameSession.tiles.map((candidate) => {
    if (candidate.id === "tile-1-0") {
      return { ...candidate, occupyingPieceId: "piece-2", ownerPlayerId: "player-2" };
    }
    if (candidate.id === "tile-2-1") {
      return { ...candidate, occupyingPieceId: null };
    }
    return candidate;
  }),
  pieces: gameSession.pieces.map((candidate) =>
    candidate.id === "piece-2" ? { ...candidate, currentTileId: "tile-1-0", level: 2 } : candidate,
  ),
};

export const battleResolvedGameSession = {
  ...battleReadyGameSession,
  currentTurnPlayerId: "player-2",
  turnNumber: 2,
  tiles: battleReadyGameSession.tiles.map((candidate) => {
    if (candidate.id === "tile-0-0") {
      return { ...candidate, occupyingPieceId: null };
    }
    if (candidate.id === "tile-1-0") {
      return { ...candidate, occupyingPieceId: "piece-1", ownerPlayerId: "player-1" };
    }
    return candidate;
  }),
  pieces: battleReadyGameSession.pieces.map((candidate) =>
    candidate.id === "piece-1"
      ? { ...candidate, currentTileId: "tile-1-0", level: 2 }
      : candidate.id === "piece-2"
        ? { ...candidate, currentTileId: null, isCaptured: true, capturedAtUtc: now }
        : candidate,
  ),
};

export const specialReadyGameSession = {
  ...gameSession,
  tiles: gameSession.tiles.map((candidate) =>
    candidate.id === "tile-1-0" ? { ...candidate, tileType: "Special" as const, occupyingPieceId: null } : candidate,
  ),
};

export const specialResolvedGameSession = {
  ...specialReadyGameSession,
  currentTurnPlayerId: "player-2",
  turnNumber: 2,
  tiles: specialReadyGameSession.tiles.map((candidate) => {
    if (candidate.id === "tile-0-0") {
      return { ...candidate, occupyingPieceId: null };
    }
    if (candidate.id === "tile-1-0") {
      return { ...candidate, occupyingPieceId: "piece-1", ownerPlayerId: "player-1" };
    }
    return candidate;
  }),
  pieces: specialReadyGameSession.pieces.map((candidate) =>
    candidate.id === "piece-1" ? { ...candidate, currentTileId: "tile-1-0", level: 2 } : candidate,
  ),
};

export const repeatFallbackBattleQuestion = {
  battleAttemptId: "battle-1",
  attemptKind: "Battle",
  attemptId: "battle-1",
  questionAttemptId: "battle-question-repeat-1",
  questionId: "question-repeat-1",
  gameSessionId: "session-1",
  actingPlayerId: "player-1",
  pieceId: "piece-1",
  sourceTileId: "tile-0-0",
  targetTileId: "tile-1-0",
  categoryId: "cat-1",
  categoryName: "History",
  questionText: "Repeated fallback battle question?",
  answerOptions: [
    { answerId: "answer-1", text: "Alpha" },
    { answerId: "answer-2", text: "Beta" },
    { answerId: "answer-3", text: "Gamma" },
    { answerId: "answer-4", text: "Delta" },
  ],
  expiresAtUtc: null,
  progress: { requiredCorrectAnswers: 3, correctAnswers: 0, status: "Pending" },
  questionSelectionMode: "RepeatFallback",
};

export const specialFieldQuestion = {
  specialFieldAttemptId: "special-1",
  attemptKind: "SpecialField",
  attemptId: "special-1",
  questionAttemptId: "special-question-1",
  questionId: "question-special-1",
  gameSessionId: "session-1",
  actingPlayerId: "player-1",
  pieceId: "piece-1",
  sourceTileId: "tile-0-0",
  targetTileId: "tile-1-0",
  categoryId: "cat-1",
  categoryName: "History",
  questionText: "Which answer conquers this special field?",
  answerOptions: repeatFallbackBattleQuestion.answerOptions,
  expiresAtUtc: null,
  progress: { requiredCorrectAnswers: 3, correctAnswers: 0, status: "Pending" },
  questionSelectionMode: "ActiveValid",
};

export const conquestQuestion = {
  questionAttemptId: "attempt-1",
  questionId: "question-1",
  gameSessionId: "session-1",
  playerId: "player-1",
  pieceId: "piece-1",
  sourceTileId: "tile-0-0",
  targetTileId: "tile-1-0",
  categoryId: "cat-1",
  categoryName: "History",
  questionText: "Which answer conquers this tile?",
  answerOptions: [
    { id: "answer-1", text: "Alpha" },
    { id: "answer-2", text: "Beta" },
    { id: "answer-3", text: "Gamma" },
    { id: "answer-4", text: "Delta" },
  ],
  expiresAtUtc: null,
};

export async function signInToGame(page: Page) {
  await page.addInitScript((accessToken) => {
    window.localStorage.setItem("knowledge-mayhem.auth", JSON.stringify({ accessToken }));
  }, hostToken);
}

export async function routeGameApi(page: Page) {
  await page.route("**/api/game-sessions/malformed", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ...gameSession, tiles: gameSession.tiles.slice(1) }),
    });
  });
  await page.route("**/api/game-sessions/session-1/moves", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        session: movedGameSession,
        turn: {
          gameSessionId: "session-1",
          currentTurnPlayerId: "player-2",
          turnNumber: 2,
          status: null,
        },
      }),
    });
  });
  await page.route("**/api/game-sessions/session-1/conquest-attempts", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(conquestQuestion) });
  });
  await page.route("**/api/game-sessions/session-1/battle-attempts", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(repeatFallbackBattleQuestion) });
  });
  await page.route("**/api/game-sessions/session-1/battle-attempts/battle-1/answers", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        battleAttemptId: "battle-1",
        status: "Succeeded",
        reason: "completed",
        gameSessionId: "session-1",
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
        session: battleResolvedGameSession,
      }),
    });
  });
  await page.route("**/api/game-sessions/session-1/special-field-attempts", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(specialFieldQuestion) });
  });
  await page.route("**/api/game-sessions/session-1/special-field-attempts/special-1/answers", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        specialFieldAttemptId: "special-1",
        status: "Succeeded",
        reason: "completed",
        gameSessionId: "session-1",
        movedPieceId: "piece-1",
        leveledPieceId: "piece-1",
        newLevel: 2,
        sourceTileId: "tile-0-0",
        targetTileId: "tile-1-0",
        targetOwnerPlayerId: "player-1",
        nextTurnPlayerId: "player-2",
        turnNumber: 2,
        sequence: 2,
        session: specialResolvedGameSession,
      }),
    });
  });
  await page.route("**/api/question-attempts/attempt-1/answer", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
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
        session: movedGameSession,
      }),
    });
  });
  await page.route("**/api/game-sessions/session-1", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(gameSession) });
  });
}

function tile(x: number, y: number, occupyingPieceId: string | null = null, tileType: "Normal" | "Blocked" | "Special" = "Normal") {
  return {
    id: `tile-${x}-${y}`,
    gameSessionId: "session-1",
    x,
    y,
    categoryId: `cat-${(x + y) % 2}`,
    ownerPlayerId: null,
    occupyingPieceId,
    tileType,
    createdAtUtc: now,
  };
}

function piece(id: string, ownerPlayerId: string, currentTileId: string | null) {
  return {
    id,
    gameSessionId: "session-1",
    ownerPlayerId,
    currentTileId,
    level: 1,
    isCaptured: false,
    createdAtUtc: now,
  };
}
