import type {
  BoardTile,
  GameActionResult,
  GamePlayer,
  GameSession,
  GameSessionStatus,
  Piece,
  TileType,
  TurnState,
} from "./gameTypes";

const gameSessionStatuses = new Set<GameSessionStatus>(["InProgress", "Completed", "Cancelled"]);
const tileTypes = new Set<TileType>(["Normal", "Blocked", "Special"]);

export type GamePlayerDto = Omit<GamePlayer, "id" | "gameSessionId" | "createdAtUtc"> & {
  id?: string;
  playerId?: string;
  gameSessionId?: string;
  createdAtUtc?: string;
};
export type BoardTileDto = Omit<BoardTile, "id" | "gameSessionId" | "createdAtUtc"> & {
  id?: string;
  tileId?: string;
  gameSessionId?: string;
  createdAtUtc?: string;
  type?: string;
};
export type PieceDto = Omit<Piece, "id" | "gameSessionId" | "createdAtUtc"> & {
  id?: string;
  pieceId?: string;
  gameSessionId?: string;
  createdAtUtc?: string;
};
export type TurnStateDto = Omit<TurnState, "gameSessionId"> & {
  gameSessionId?: string;
  sessionId?: string;
};
export type GameSessionDto = Omit<GameSession, "id" | "players" | "tiles" | "pieces" | "createdAtUtc"> & {
  id?: string;
  sessionId?: string;
  createdAtUtc?: string;
  players: GamePlayerDto[];
  tiles: BoardTileDto[];
  pieces: PieceDto[];
};
export type GameActionResultDto = {
  session: GameSessionDto;
  turn: TurnStateDto;
};

export function mapGameSession(dto: GameSessionDto): GameSession {
  const sessionId = dto.id ?? dto.sessionId;
  if (!sessionId || !dto.lobbyId) {
    throw new Error("Game session response is missing identity fields.");
  }
  if (!gameSessionStatuses.has(dto.status)) {
    throw new Error(`Unsupported game session status: ${String(dto.status)}`);
  }
  if (!Number.isInteger(dto.boardWidth) || dto.boardWidth < 1 || !Number.isInteger(dto.boardHeight) || dto.boardHeight < 1) {
    throw new Error("Game session response has invalid board dimensions.");
  }

  const players = (dto.players ?? []).map((player) => mapGamePlayer(player, sessionId));
  const tiles = (dto.tiles ?? []).map((tile) => mapBoardTile(tile, sessionId));
  const pieces = (dto.pieces ?? []).map((piece) => mapPiece(piece, sessionId));

  const session: GameSession = {
    id: sessionId,
    lobbyId: dto.lobbyId,
    status: dto.status,
    boardSeed: dto.boardSeed,
    boardWidth: dto.boardWidth,
    boardHeight: dto.boardHeight,
    currentTurnPlayerId: dto.currentTurnPlayerId ?? null,
    turnNumber: dto.turnNumber,
    startedAtUtc: dto.startedAtUtc,
    endedAtUtc: dto.endedAtUtc ?? null,
    winnerPlayerId: dto.winnerPlayerId ?? null,
    createdAtUtc: dto.createdAtUtc ?? dto.startedAtUtc,
    players,
    tiles,
    pieces,
  };

  validateGameSessionSnapshot(session);
  return session;
}

export function mapGamePlayer(dto: GamePlayerDto, fallbackGameSessionId?: string): GamePlayer {
  const playerId = dto.id ?? dto.playerId;
  const gameSessionId = dto.gameSessionId ?? fallbackGameSessionId;
  if (!playerId || !gameSessionId || !dto.userId) {
    throw new Error("Game player response is missing required fields.");
  }
  return {
    id: playerId,
    gameSessionId,
    userId: dto.userId,
    playerOrder: dto.playerOrder,
    displayName: dto.displayName ?? null,
    isEliminated: Boolean(dto.isEliminated),
    createdAtUtc: dto.createdAtUtc ?? "",
  };
}

export function mapBoardTile(dto: BoardTileDto, fallbackGameSessionId?: string): BoardTile {
  const tileId = dto.id ?? dto.tileId;
  const gameSessionId = dto.gameSessionId ?? fallbackGameSessionId;
  if (!tileId || !gameSessionId) {
    throw new Error("Board tile response is missing required fields.");
  }
  const tileType = normalizeTileType(dto.tileType ?? dto.type);
  if (!tileTypes.has(tileType)) {
    throw new Error(`Unsupported tile type: ${String(dto.tileType ?? dto.type)}`);
  }
  return {
    id: tileId,
    gameSessionId,
    x: dto.x,
    y: dto.y,
    categoryId: dto.categoryId ?? null,
    ownerPlayerId: dto.ownerPlayerId ?? null,
    occupyingPieceId: dto.occupyingPieceId ?? null,
    tileType,
    createdAtUtc: dto.createdAtUtc ?? "",
  };
}

export function mapPiece(dto: PieceDto, fallbackGameSessionId?: string): Piece {
  const pieceId = dto.id ?? dto.pieceId;
  const gameSessionId = dto.gameSessionId ?? fallbackGameSessionId;
  if (!pieceId || !gameSessionId || !dto.ownerPlayerId || (!dto.currentTileId && !dto.isCaptured)) {
    throw new Error("Piece response is missing required fields.");
  }
  return {
    id: pieceId,
    gameSessionId,
    ownerPlayerId: dto.ownerPlayerId,
    currentTileId: dto.currentTileId ?? null,
    level: normalizePieceLevel(dto.level),
    isCaptured: Boolean(dto.isCaptured),
    capturedAtUtc: dto.capturedAtUtc ?? null,
    createdAtUtc: dto.createdAtUtc ?? "",
  };
}

export function mapTurnState(dto: TurnStateDto): TurnState {
  const gameSessionId = dto.gameSessionId ?? dto.sessionId;
  if (!gameSessionId) {
    throw new Error("Turn response is missing gameSessionId.");
  }
  return {
    gameSessionId,
    currentTurnPlayerId: dto.currentTurnPlayerId ?? null,
    turnNumber: dto.turnNumber,
    status: dto.status ?? null,
  };
}

export function mapGameActionResult(dto: GameActionResultDto): GameActionResult {
  return {
    session: mapGameSession(dto.session),
    turn: mapTurnState(dto.turn),
  };
}

export function validateGameSessionSnapshot(session: GameSession): void {
  const playerIds = new Set(session.players.map((player) => player.id));
  const tileIds = new Set<string>();
  const tileCoordinates = new Set<string>();
  const pieceIds = new Set(session.pieces.map((piece) => piece.id));

  if (session.status === "InProgress" && (!session.currentTurnPlayerId || !playerIds.has(session.currentTurnPlayerId))) {
    throw new Error("Game session response references an unknown current turn player.");
  }

  for (const tile of session.tiles) {
    if (tile.x < 0 || tile.y < 0 || tile.x >= session.boardWidth || tile.y >= session.boardHeight) {
      throw new Error("Game session response includes an out-of-bounds tile.");
    }
    const coordinateKey = `${tile.x}:${tile.y}`;
    if (tileCoordinates.has(coordinateKey)) {
      throw new Error("Game session response includes duplicate tile coordinates.");
    }
    tileCoordinates.add(coordinateKey);
    tileIds.add(tile.id);
    if (tile.ownerPlayerId && !playerIds.has(tile.ownerPlayerId)) {
      throw new Error("Game session response references an unknown tile owner.");
    }
    if (tile.occupyingPieceId && !pieceIds.has(tile.occupyingPieceId)) {
      throw new Error("Game session response references an unknown occupying piece.");
    }
  }

  if (tileCoordinates.size !== session.boardWidth * session.boardHeight) {
    throw new Error("Game session response is missing board tiles.");
  }

  for (const piece of session.pieces) {
    if (!playerIds.has(piece.ownerPlayerId)) {
      throw new Error("Game session response references an unknown piece owner.");
    }
    if (!piece.isCaptured && (!piece.currentTileId || !tileIds.has(piece.currentTileId))) {
      throw new Error("Game session response references an unknown piece tile.");
    }
  }
}

function normalizeTileType(value: unknown): TileType {
  if (value === "special") {
    return "Special";
  }
  if (value === "blocked") {
    return "Blocked";
  }
  if (value === "normal") {
    return "Normal";
  }
  return value as TileType;
}

function normalizePieceLevel(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 1 ? value : 1;
}
