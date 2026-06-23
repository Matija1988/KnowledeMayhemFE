import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { GamePlayerPanel } from "./GamePlayerPanel";

describe("GamePlayerPanel", () => {
  it("renders players in order with current user and current turn markers", () => {
    render(<GamePlayerPanel session={gameSessionFixture()} currentUserId="user-1" />);

    const players = screen.getAllByRole("listitem");
    expect(players[0]).toHaveTextContent("Alice");
    expect(players[0]).toHaveTextContent("You");
    expect(players[0]).toHaveTextContent("Turn");
    expect(players[1]).toHaveTextContent("Bob");
  });

  it("falls back to stable identifiers and shows eliminated state", () => {
    const session = gameSessionFixture({
      players: [
        { ...gameSessionFixture().players[0], displayName: null },
        { ...gameSessionFixture().players[1], isEliminated: true },
      ],
    });

    render(<GamePlayerPanel session={session} currentUserId="user-2" />);

    expect(screen.getByText("user-1")).toBeInTheDocument();
    expect(screen.getByText("Eliminated")).toBeInTheDocument();
  });

  it("shows configured player piece colors with text and swatches", () => {
    const session = gameSessionFixture({
      players: [
        { ...gameSessionFixture().players[0], pieceColor: "Red" },
        { ...gameSessionFixture().players[1], pieceColor: "Blue" },
      ],
    });

    render(<GamePlayerPanel session={session} currentUserId="user-1" />);

    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
  });
});
