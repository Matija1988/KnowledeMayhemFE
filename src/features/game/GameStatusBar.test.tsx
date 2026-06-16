import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { GameStatusBar } from "./GameStatusBar";

describe("GameStatusBar", () => {
  it("renders turn, status, connection, and live-region text", () => {
    render(<GameStatusBar session={gameSessionFixture()} connection={{ status: "connected", message: null, lastUpdatedAtUtc: null }} liveMessage="Alice moved." />);

    expect(screen.getByText(/turn 1/i)).toBeInTheDocument();
    expect(screen.getByText(/game in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
    expect(screen.getByText("Alice moved.")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText(/highlighted orthogonal target/i)).toBeInTheDocument();
  });
});
