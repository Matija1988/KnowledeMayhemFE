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
  return (
    <span
      className={`game-piece${isCurrentUserPiece ? " game-piece--own" : ""}`}
      aria-label={`${owner?.displayName ?? owner?.userId ?? "Unknown player"} piece level ${piece.level}`}
    >
      P{orderLabel}
      <span className="game-piece__level">L{piece.level}</span>
    </span>
  );
}

export const GamePiece = memo(GamePieceComponent);
