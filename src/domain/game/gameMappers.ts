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
const tileTypes = new Set<TileType>(["Normal", "Blocked"]);

export type GamePlayerDto = GamePlayer;
export type BoardTileDto = BoardTile;
export type PieceDto = Piece;
export type TurnStateDto = TurnState;
export type GameSessionDto = GameSession;
export type GameActionResultDto = {
  session: GameSessionDto;
  turn: TurnStateDto;
};

export function mapGameSession(dto: GameSessionDto): GameSession {
  if (!dto.id || !dto.lobbyId) {
    throw new Error("Game session response is missing identity fields.");
  }
  if (!gameSessionStatuses.has(dto.status)) {
    throw new Error(`Unsupported game session status: ${String(dto.status)}`);
  }
  if (!Number.isInteger(dto.boardWidth) || dto.boardWidth < 1 || !Number.isInteger(dto.boardHeight) || dto.boardHeight < 1) {
    throw new Error("Game session response has invalid board dimensions.");
  }

  const players = (dto.players ?? []).map(mapGamePlayer);
  const tiles = (dto.tiles ?? []).map(mapBoardTile);
  const pieces = (dto.pieces ?? []).map(mapPiece);

  const session: GameSession = {
    id: dto.id,
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
    createdAtUtc: dto.createdAtUtc,
    players,
    tiles,
    pieces,
  };

  validateGameSessionSnapshot(session);
  return session;
}

export function mapGamePlayer(dto: GamePlayerDto): GamePlayer {
  if (!dto.id || !dto.gameSessionId || !dto.userId) {
    throw new Error("Game player response is missing required fields.");
  }
  return {
    id: dto.id,
    gameSessionId: dto.gameSessionId,
    userId: dto.userId,
    playerOrder: dto.playerOrder,
    displayName: dto.displayName ?? null,
    isEliminated: Boolean(dto.isEliminated),
    createdAtUtc: dto.createdAtUtc,
  };
}

export function mapBoardTile(dto: BoardTileDto): BoardTile {
  if (!dto.id || !dto.gameSessionId) {
    throw new Error("Board tile response is missing required fields.");
  }
  if (!tileTypes.has(dto.tileType)) {
    throw new Error(`Unsupported tile type: ${String(dto.tileType)}`);
  }
  return {
    id: dto.id,
    gameSessionId: dto.gameSessionId,
    x: dto.x,
    y: dto.y,
    categoryId: dto.categoryId ?? null,
    ownerPlayerId: dto.ownerPlayerId ?? null,
    occupyingPieceId: dto.occupyingPieceId ?? null,
    tileType: dto.tileType,
    createdAtUtc: dto.createdAtUtc,
  };
}

export function mapPiece(dto: PieceDto): Piece {
  if (!dto.id || !dto.gameSessionId || !dto.ownerPlayerId || !dto.currentTileId) {
    throw new Error("Piece response is missing required fields.");
  }
  return {
    id: dto.id,
    gameSessionId: dto.gameSessionId,
    ownerPlayerId: dto.ownerPlayerId,
    currentTileId: dto.currentTileId,
    level: dto.level,
    isCaptured: Boolean(dto.isCaptured),
    createdAtUtc: dto.createdAtUtc,
  };
}

export function mapTurnState(dto: TurnStateDto): TurnState {
  if (!dto.gameSessionId) {
    throw new Error("Turn response is missing gameSessionId.");
  }
  return {
    gameSessionId: dto.gameSessionId,
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
    if (!tileIds.has(piece.currentTileId)) {
      throw new Error("Game session response references an unknown piece tile.");
    }
  }
}
