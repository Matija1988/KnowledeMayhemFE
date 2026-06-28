import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { GameTile } from "./GameTile";

describe("GameTile", () => {
  it("labels ownership, category, blocked, occupied, selected, and valid target state without color alone", () => {
    const session = gameSessionFixture();
    const tile = { ...session.tiles[0], ownerPlayerId: "player-1" };

    render(
      <GameTile
        tile={tile}
        categoryName="C#"
        categoryColor="#7C3AED"
        piece={session.pieces[0]}
        player={session.players[0]}
        pieceOwner={session.players[0]}
        isCurrentUserPiece
        isSelected
        isValidTarget
      />,
    );

    expect(screen.getByRole("gridcell")).toHaveAccessibleName(/category c#/i);
    expect(screen.getByRole("gridcell")).toHaveAccessibleName(/owned by alice/i);
    expect(screen.getByRole("gridcell")).toHaveAccessibleName(/selected/i);
    expect(screen.queryByText("Selected")).not.toBeInTheDocument();
    expect(screen.getByText("Valid target")).toBeInTheDocument();
    expect(screen.getByLabelText("Category: C#")).toHaveStyle({ backgroundColor: "#7C3AED" });
  });

  it("keeps special fields in the accessible label without rendering text inside the tile", () => {
    const session = gameSessionFixture();
    const tile = { ...session.tiles[1], tileType: "Special" as const };

    render(
      <GameTile
        tile={tile}
        piece={null}
        player={null}
        pieceOwner={null}
        isCurrentUserPiece={false}
        isValidTarget
      />,
    );

    expect(screen.getByRole("gridcell")).toHaveAccessibleName(/special field/i);
    expect(screen.queryByText("Special field")).not.toBeInTheDocument();
    expect(screen.getByText("Valid target")).toBeInTheDocument();
  });
});
