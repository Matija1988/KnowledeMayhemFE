import { memo } from "react";
import type { BoardTile, GamePlayer, Piece } from "../../domain/game/gameTypes";
import { GamePiece } from "./GamePiece";

type GameTileProps = {
  tile: BoardTile;
  categoryName?: string | null;
  categoryColor?: string;
  piece: Piece | null;
  player: GamePlayer | null;
  pieceOwner: GamePlayer | null;
  isCurrentUserPiece: boolean;
  isSelected?: boolean;
  isValidTarget?: boolean;
  isDisabled?: boolean;
  onActivate?: () => void;
};

function GameTileComponent({
  tile,
  categoryName = null,
  categoryColor = "#64748B",
  piece,
  player,
  pieceOwner,
  isCurrentUserPiece,
  isSelected = false,
  isValidTarget = false,
  isDisabled = false,
  onActivate,
}: GameTileProps) {
  const label = [
    `Row ${tile.y + 1} column ${tile.x + 1}`,
    tile.tileType === "Blocked" ? "blocked" : tile.tileType === "Special" ? "special field" : "normal",
    categoryName ? `category ${categoryName}` : null,
    player ? `owned by ${player.displayName ?? player.userId}` : "unowned",
    piece ? "occupied" : "empty",
    isSelected ? "selected" : null,
    isValidTarget ? "valid target" : null,
    isDisabled ? "interaction paused" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      role="gridcell"
      aria-label={label}
      tabIndex={0}
      aria-disabled={isDisabled}
      className={`game-tile game-tile--${tile.tileType.toLowerCase()}${isSelected ? " game-tile--selected" : ""}${isValidTarget ? " game-tile--valid" : ""}${isDisabled ? " game-tile--disabled" : ""}`}
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
      {tile.categoryId ? (
        <span
          className="game-category-dot game-tile__category-dot"
          style={{ backgroundColor: categoryColor }}
          title={categoryName ?? "Unknown category"}
          aria-label={`Category: ${categoryName ?? "Unknown category"}`}
        />
      ) : null}
      {tile.tileType === "Blocked" ? <span className="game-tile__state">Blocked</span> : null}
      {isValidTarget ? <span className="game-tile__state">Valid target</span> : null}
      {piece ? <GamePiece piece={piece} owner={pieceOwner} isCurrentUserPiece={isCurrentUserPiece} /> : null}
    </div>
  );
}

export const GameTile = memo(GameTileComponent);
