import { findTileByCoordinate } from "../game/gameMovement";
import type { BoardCoordinate, GameSession } from "../game/gameTypes";

export type ConquestValidationResult =
  | { ok: true; targetTileId: string; sourceTileId: string }
  | { ok: false; message: string };

export function validateConquestTarget(
  session: GameSession | null,
  currentUserId: string | null,
  pieceId: string | null,
  target: BoardCoordinate,
  hasPendingAttempt: boolean,
): ConquestValidationResult {
  if (!session) {
    return { ok: false, message: "Game session is not loaded." };
  }
  if (session.status !== "InProgress") {
    return { ok: false, message: "This game is not in progress." };
  }
  if (hasPendingAttempt) {
    return { ok: false, message: "A question attempt is already in progress." };
  }
  if (!pieceId) {
    return { ok: false, message: "Select a piece before choosing a target." };
  }

  const piece = session.pieces.find((candidate) => candidate.id === pieceId);
  if (!piece) {
    return { ok: false, message: "Piece is not available." };
  }
  if (piece.isCaptured) {
    return { ok: false, message: "That piece has been captured." };
  }

  const owner = session.players.find((player) => player.id === piece.ownerPlayerId);
  if (!currentUserId || owner?.userId !== currentUserId) {
    return { ok: false, message: "That piece belongs to another player." };
  }
  if (session.currentTurnPlayerId !== owner.id) {
    return { ok: false, message: "It is not your turn." };
  }

  const sourceTile = session.tiles.find((tile) => tile.id === piece.currentTileId);
  const targetTile = findTileByCoordinate(session, target);
  if (!sourceTile || !targetTile) {
    return { ok: false, message: "That target tile is not available for this piece." };
  }
  const distance = Math.abs(sourceTile.x - targetTile.x) + Math.abs(sourceTile.y - targetTile.y);
  if (distance !== 1) {
    return { ok: false, message: "That target tile is not adjacent to this piece." };
  }
  if (targetTile.tileType === "Blocked") {
    return { ok: false, message: "That target tile is blocked." };
  }
  if (targetTile.occupyingPieceId) {
    return { ok: false, message: "That target tile is occupied." };
  }

  return { ok: true, targetTileId: targetTile.id, sourceTileId: sourceTile.id };
}

