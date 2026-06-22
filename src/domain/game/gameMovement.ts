import type { BoardCoordinate, GameSession, Piece } from "./gameTypes";

export function getOrthogonalCandidateTargets(session: GameSession, pieceId: string): BoardCoordinate[] {
  const piece = session.pieces.find((candidate) => candidate.id === pieceId && !candidate.isCaptured);
  const currentTile = piece ? session.tiles.find((tile) => tile.id === piece.currentTileId) : null;
  if (!piece || !currentTile) {
    return [];
  }

  return [
    { x: currentTile.x + 1, y: currentTile.y },
    { x: currentTile.x - 1, y: currentTile.y },
    { x: currentTile.x, y: currentTile.y + 1 },
    { x: currentTile.x, y: currentTile.y - 1 },
  ].filter((target) => isCandidateTarget(session, piece.id, target));
}

export function isCandidateTarget(session: GameSession, pieceId: string, target: BoardCoordinate): boolean {
  const piece = session.pieces.find((candidate) => candidate.id === pieceId && !candidate.isCaptured);
  const currentTile = piece ? session.tiles.find((tile) => tile.id === piece.currentTileId) : null;
  const targetTile = session.tiles.find((tile) => tile.x === target.x && tile.y === target.y);

  if (!piece || !currentTile || !targetTile) {
    return false;
  }

  const distance = Math.abs(currentTile.x - target.x) + Math.abs(currentTile.y - target.y);
  if (distance !== 1 || targetTile.tileType === "Blocked") {
    return false;
  }
  if (!targetTile.occupyingPieceId) {
    return true;
  }
  const occupyingPiece = session.pieces.find((candidate) => candidate.id === targetTile.occupyingPieceId && !candidate.isCaptured);
  return Boolean(occupyingPiece && occupyingPiece.ownerPlayerId !== piece.ownerPlayerId);
}

export function getPieceDisabledReason(
  session: GameSession | null,
  pieceId: string,
  currentUserId: string | null,
  pendingMove = false,
): string | null {
  if (!session) {
    return "Game session is not loaded.";
  }
  if (session.status !== "InProgress") {
    return "This game is not in progress.";
  }
  if (pendingMove) {
    return "A move is already in progress.";
  }
  const piece = session.pieces.find((candidate) => candidate.id === pieceId);
  if (!piece) {
    return "Piece is not available.";
  }
  if (piece.isCaptured) {
    return "That piece has been captured.";
  }
  const owner = session.players.find((player) => player.id === piece.ownerPlayerId);
  if (!currentUserId || owner?.userId !== currentUserId) {
    return "That piece belongs to another player.";
  }
  if (session.currentTurnPlayerId !== owner.id) {
    return "It is not your turn.";
  }
  return null;
}

export function findTileByCoordinate(session: GameSession, coordinate: BoardCoordinate) {
  return session.tiles.find((tile) => tile.x === coordinate.x && tile.y === coordinate.y) ?? null;
}

export function getPieceCurrentCoordinate(session: GameSession, piece: Piece): BoardCoordinate | null {
  if (!piece.currentTileId) {
    return null;
  }
  const tile = session.tiles.find((candidate) => candidate.id === piece.currentTileId);
  return tile ? { x: tile.x, y: tile.y } : null;
}
