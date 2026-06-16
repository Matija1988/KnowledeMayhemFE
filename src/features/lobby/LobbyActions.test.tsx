import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { lobbyFixture, lobbyWithGuest } from "../../tests/fixtures/lobbyFixtures";
import { LobbyActions } from "./LobbyActions";

describe("LobbyActions", () => {
  it("hides host actions for non-host players", () => {
    render(<LobbyActions lobby={lobbyWithGuest()} currentUserId="user-2" />, { wrapper: MemoryRouter });

    expect(screen.getByRole("button", { name: "Leave lobby" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start lobby" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel lobby" })).not.toBeInTheDocument();
  });

  it("shows disabled start reasons for hosts", () => {
    render(<LobbyActions lobby={lobbyFixture()} currentUserId="user-1" />, { wrapper: MemoryRouter });

    expect(screen.getByRole("button", { name: "Start lobby" })).toBeDisabled();
    expect(screen.getByText("At least 2 players are required to start.")).toBeInTheDocument();
  });

  it("enables start for hosts when two players are present", () => {
    render(<LobbyActions lobby={lobbyWithGuest()} currentUserId="user-1" />, { wrapper: MemoryRouter });

    expect(screen.getByRole("button", { name: "Start lobby" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Cancel lobby" })).toBeInTheDocument();
  });
});
