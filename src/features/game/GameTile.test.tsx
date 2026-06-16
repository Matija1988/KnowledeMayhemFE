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
        piece={session.pieces[0]}
        player={session.players[0]}
        pieceOwner={session.players[0]}
        isCurrentUserPiece
        isSelected
        isValidTarget
      />,
    );

    expect(screen.getByRole("gridcell")).toHaveAccessibleName(/owned by alice/i);
    expect(screen.getByText("Selected")).toBeInTheDocument();
    expect(screen.getByText("Valid target")).toBeInTheDocument();
    expect(screen.getByText("cat-0")).toBeInTheDocument();
  });
});
