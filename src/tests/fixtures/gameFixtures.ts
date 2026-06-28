import type { BoardTile, GameActionResult, GameCompletionSummary, GameSession } from "../../domain/game/gameTypes";

const now = "2026-06-16T10:00:00.000Z";

type GameFixtureOverrides = Partial<GameSession>;

export function gameSessionFixture(overrides: GameFixtureOverrides = {}): GameSession {
  const sessionId = overrides.id ?? "session-1";
  const tiles = overrides.tiles ?? createTiles(sessionId);
  const pieces =
    overrides.pieces ??
    [
      {
        id: "piece-1",
        gameSessionId: sessionId,
        ownerPlayerId: "player-1",
        currentTileId: "tile-0-0",
        level: 1,
        isCaptured: false,
        createdAtUtc: now,
      },
      {
        id: "piece-2",
        gameSessionId: sessionId,
        ownerPlayerId: "player-2",
        currentTileId: "tile-2-1",
        level: 1,
        isCaptured: false,
        createdAtUtc: now,
      },
    ];

  return {
    id: sessionId,
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
    selectedCategoryIds: [],
    createdAtUtc: now,
    players: [
      {
        id: "player-1",
        gameSessionId: sessionId,
        userId: "user-1",
        playerOrder: 1,
        displayName: "Alice",
        pieceColor: null,
        isEliminated: false,
        createdAtUtc: now,
      },
      {
        id: "player-2",
        gameSessionId: sessionId,
        userId: "user-2",
        playerOrder: 2,
        displayName: "Bob",
        pieceColor: null,
        isEliminated: false,
        createdAtUtc: now,
      },
    ],
    tiles,
    pieces,
    ...overrides,
  };
}

export function gameActionResultFixture({
  pieceId = "piece-1",
  targetX = 1,
  targetY = 0,
}: {
  pieceId?: string;
  targetX?: number;
  targetY?: number;
} = {}): GameActionResult {
  const session = gameSessionFixture();
  const targetTileId = `tile-${targetX}-${targetY}`;

  return {
    session: {
      ...session,
      currentTurnPlayerId: "player-2",
      turnNumber: session.turnNumber + 1,
      pieces: session.pieces.map((piece) => (piece.id === pieceId ? { ...piece, currentTileId: targetTileId } : piece)),
      tiles: session.tiles.map((tile) => ({
        ...tile,
        occupyingPieceId:
          tile.id === "tile-0-0" ? null : tile.id === targetTileId ? pieceId : tile.occupyingPieceId,
        ownerPlayerId: tile.id === targetTileId ? "player-1" : tile.ownerPlayerId,
      })),
    },
    turn: {
      gameSessionId: session.id,
      currentTurnPlayerId: "player-2",
      turnNumber: session.turnNumber + 1,
      status: null,
    },
  };
}

export function malformedGameSessionFixture(): GameSession {
  const session = gameSessionFixture();
  return { ...session, tiles: session.tiles.slice(1) };
}

export function gameCompletionSummaryFixture(gameSessionId = "completed"): GameCompletionSummary {
  return {
    gameSessionId,
    winnerPlayerId: "player-1",
    endedAtUtc: "2026-06-16T10:30:00.000Z",
    players: [
      {
        playerId: "player-1",
        userId: "user-1",
        displayName: "Alice",
        pieceColor: "Blue",
        isWinner: true,
        correctAnswers: 7,
        totalAnswers: 10,
        percentage: 70,
        categories: [
          { categoryId: "category-csharp", categoryName: "C#", correctAnswers: 5, totalAnswers: 10, percentage: 50 },
        ],
      },
      {
        playerId: "player-2",
        userId: "user-2",
        displayName: "Bob",
        pieceColor: "Red",
        isWinner: false,
        correctAnswers: 3,
        totalAnswers: 8,
        percentage: 37.5,
        categories: [
          { categoryId: "category-csharp", categoryName: "C#", correctAnswers: 3, totalAnswers: 8, percentage: 37.5 },
        ],
      },
    ],
  };
}

function createTiles(gameSessionId: string): BoardTile[] {
  const tiles: BoardTile[] = [];
  for (let y = 0; y < 2; y += 1) {
    for (let x = 0; x < 3; x += 1) {
      const id = `tile-${x}-${y}`;
      tiles.push({
        id,
        gameSessionId,
        x,
        y,
        categoryId: `cat-${(x + y) % 2}`,
        ownerPlayerId: null,
        occupyingPieceId: id === "tile-0-0" ? "piece-1" : id === "tile-2-1" ? "piece-2" : null,
        tileType: x === 1 && y === 1 ? "Blocked" : "Normal",
        createdAtUtc: now,
      });
    }
  }
  return tiles;
}
