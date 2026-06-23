import { memo } from "react";
import type { GamePlayer, Piece } from "../../domain/game/gameTypes";

type GamePieceProps = {
  piece: Piece;
  owner: GamePlayer | null;
  isCurrentUserPiece: boolean;
};

function GamePieceComponent({ piece, owner, isCurrentUserPiece }: GamePieceProps) {
  if (piece.isCaptured) {
    return (
      <span className="game-piece game-piece--captured" aria-label="Captured piece">
        Captured
      </span>
    );
  }

  const orderLabel = owner?.playerOrder ?? "?";
  const pieceColor = owner?.pieceColor ?? null;
  const colorLabel = pieceColor ? `${pieceColor} ` : "";
  return (
    <span
      className={`game-piece${isCurrentUserPiece ? " game-piece--own" : ""}`}
      style={pieceColor ? { backgroundColor: `var(--piece-color-${pieceColor.toLowerCase()})` } : undefined}
      aria-label={`${owner?.displayName ?? owner?.userId ?? "Unknown player"} ${colorLabel}piece level ${piece.level}`}
    >
      P{orderLabel}
      <span className="game-piece__level">L{piece.level}</span>
      {pieceColor ? <span className="sr-only">{pieceColor}</span> : null}
    </span>
  );
}

export const GamePiece = memo(GamePieceComponent);
