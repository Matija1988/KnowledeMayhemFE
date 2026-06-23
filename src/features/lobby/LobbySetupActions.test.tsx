import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { lobbyWithGuest } from "../../tests/fixtures/lobbyFixtures";
import { configuredLobbyFixture } from "../../tests/fixtures/lobbySetupFixtures";
import { LobbySetupActions } from "./LobbySetupActions";

describe("LobbySetupActions", () => {
  it("enables ready and host start when setup is complete", () => {
    render(<LobbySetupActions lobby={configuredLobbyFixture()} currentUserId="user-1" pendingOperation={null} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByRole("button", { name: "Not ready" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Start lobby" })).toBeEnabled();
  });

  it("blocks ready before the current player selects a color", () => {
    render(<LobbySetupActions lobby={lobbyWithGuest()} currentUserId="user-1" pendingOperation={null} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByRole("button", { name: "Ready" })).toBeDisabled();
    expect(screen.getByText("Select a color before ready.")).toBeInTheDocument();
  });
});
