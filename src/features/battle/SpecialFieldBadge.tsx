import type { BoardTile } from "../../domain/game/gameTypes";

type SpecialFieldBadgeProps = {
  tile: BoardTile;
};

export function SpecialFieldBadge({ tile }: SpecialFieldBadgeProps) {
  if (tile.tileType !== "Special") {
    return null;
  }
  return <span className="game-tile__state">Special field</span>;
}
