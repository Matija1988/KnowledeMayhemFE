import { memo } from "react";
import type { BoardTile, GamePlayer, Piece } from "../../domain/game/gameTypes";
import { GamePiece } from "./GamePiece";

type GameTileProps = {
  tile: BoardTile;
  piece: Piece | null;
  player: GamePlayer | null;
  pieceOwner: GamePlayer | null;
  isCurrentUserPiece: boolean;
  isSelected?: boolean;
  isValidTarget?: boolean;
  onActivate?: () => void;
};

function GameTileComponent({
  tile,
  piece,
  player,
  pieceOwner,
  isCurrentUserPiece,
  isSelected = false,
  isValidTarget = false,
  onActivate,
}: GameTileProps) {
  const label = [
    `Row ${tile.y + 1} column ${tile.x + 1}`,
    tile.tileType === "Blocked" ? "blocked" : "normal",
    player ? `owned by ${player.displayName ?? player.userId}` : "unowned",
    piece ? "occupied" : "empty",
    isSelected ? "selected" : null,
    isValidTarget ? "valid target" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      role="gridcell"
      aria-label={label}
      tabIndex={0}
      className={`game-tile game-tile--${tile.tileType.toLowerCase()}${isSelected ? " game-tile--selected" : ""}${isValidTarget ? " game-tile--valid" : ""}`}
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate?.();
        }
      }}
    >
      <span className="game-tile__coordinate">
        {tile.x},{tile.y}
      </span>
      {tile.categoryId ? <span className="game-tile__category">{tile.categoryId}</span> : null}
      {tile.tileType === "Blocked" ? <span className="game-tile__state">Blocked</span> : null}
      {isSelected ? <span className="game-tile__state">Selected</span> : null}
      {isValidTarget ? <span className="game-tile__state">Valid target</span> : null}
      {piece ? <GamePiece piece={piece} owner={pieceOwner} isCurrentUserPiece={isCurrentUserPiece} /> : null}
    </div>
  );
}

export const GameTile = memo(GameTileComponent);
