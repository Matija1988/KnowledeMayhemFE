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
  await page.route("**/api/game-sessions/session-1", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(gameSession) });
  });
}

function tile(x: number, y: number, occupyingPieceId: string | null = null, tileType: "Normal" | "Blocked" = "Normal") {
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

function piece(id: string, ownerPlayerId: string, currentTileId: string) {
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
