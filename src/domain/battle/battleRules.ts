import type { BoardTile, GameSession, Piece } from "../game/gameTypes";

export const MAX_PIECE_LEVEL = 3;
export const SPECIAL_FIELD_REQUIRED_CORRECT_ANSWERS = 3;

export function getBattleRequiredCorrectAnswers(defenderLevel: number): number {
  return Math.max(2, Math.min(MAX_PIECE_LEVEL + 1, defenderLevel + 1));
}

export function getNextPieceLevel(currentLevel: number): number {
  return Math.min(MAX_PIECE_LEVEL, Math.max(1, currentLevel) + 1);
}

export function isSpecialTile(tile: BoardTile | null | undefined): boolean {
  return tile?.tileType === "Special";
}

export function isEnemyOccupiedTile(session: GameSession, tile: BoardTile, actingPiece: Piece): boolean {
  const occupyingPiece = session.pieces.find((piece) => piece.id === tile.occupyingPieceId && !piece.isCaptured);
  return Boolean(occupyingPiece && occupyingPiece.ownerPlayerId !== actingPiece.ownerPlayerId);
}
