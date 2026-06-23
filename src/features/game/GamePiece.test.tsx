import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { GamePiece } from "./GamePiece";

describe("GamePiece", () => {
  it("renders a non-color-only level badge and accessible level name", () => {
    const session = gameSessionFixture();
    const piece = { ...session.pieces[0], level: 3 };

    render(<GamePiece piece={piece} owner={session.players[0]} isCurrentUserPiece />);

    expect(screen.getByLabelText(/alice piece level 3/i)).toBeInTheDocument();
    expect(screen.getByText("L3")).toBeInTheDocument();
  });

  it("includes configured piece color in the accessible piece name", () => {
    const session = gameSessionFixture();
    const owner = { ...session.players[0], pieceColor: "Red" };
    const piece = { ...session.pieces[0], level: 3 };

    render(<GamePiece piece={piece} owner={owner} isCurrentUserPiece />);

    expect(screen.getByLabelText(/alice red piece level 3/i)).toBeInTheDocument();
    expect(screen.getByText("Red")).toHaveClass("sr-only");
  });

  it("renders captured pieces as inactive textual indicators", () => {
    const session = gameSessionFixture();
    const piece = { ...session.pieces[1], currentTileId: null, isCaptured: true };

    render(<GamePiece piece={piece} owner={session.players[1]} isCurrentUserPiece={false} />);

    expect(screen.getByLabelText(/captured piece/i)).toHaveTextContent("Captured");
  });
});
