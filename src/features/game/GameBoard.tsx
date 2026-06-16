import type { GameSession } from "../../domain/game/gameTypes";
import type { BoardCoordinate } from "../../domain/game/gameTypes";
import { selectBoardCells, selectPieceOnTile } from "../../stores/gameStore";
import { GameTile } from "./GameTile";

type GameBoardProps = {
  session: GameSession;
  currentUserId: string | null;
  selectedPieceId?: string | null;
  candidateTargets?: BoardCoordinate[];
  onPieceSelect?: (pieceId: string) => void;
  onTargetSelect?: (target: BoardCoordinate) => void;
};

export function GameBoard({
  session,
  currentUserId,
  selectedPieceId = null,
  candidateTargets = [],
  onPieceSelect,
  onTargetSelect,
}: GameBoardProps) {
  const cells = selectBoardCells(session);

  return (
    <section className="game-board-shell" aria-label="Game board area">
      <div
        role="grid"
        aria-label="Game board"
        className="game-board"
        style={{ gridTemplateColumns: `repeat(${session.boardWidth}, minmax(0, 1fr))` }}
      >
        {cells.map((tile) => {
          const piece = selectPieceOnTile(session, tile.id);
          const pieceOwner = piece ? session.players.find((candidate) => candidate.id === piece.ownerPlayerId) ?? null : null;
          const isValidTarget = candidateTargets.some((target) => target.x === tile.x && target.y === tile.y);
          return (
            <GameTile
              key={tile.id}
              tile={tile}
              piece={piece}
              player={tile.ownerPlayerId ? session.players.find((candidate) => candidate.id === tile.ownerPlayerId) ?? null : null}
              pieceOwner={pieceOwner}
              isCurrentUserPiece={Boolean(currentUserId && pieceOwner?.userId === currentUserId)}
              isSelected={Boolean(piece && piece.id === selectedPieceId)}
              isValidTarget={isValidTarget}
              onActivate={() => {
                if (isValidTarget) {
                  onTargetSelect?.({ x: tile.x, y: tile.y });
                } else if (piece) {
                  onPieceSelect?.(piece.id);
                }
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
