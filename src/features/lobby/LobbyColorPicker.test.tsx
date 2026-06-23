import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { configuredLobbyFixture } from "../../tests/fixtures/lobbySetupFixtures";
import { LobbyColorPicker } from "./LobbyColorPicker";

describe("LobbyColorPicker", () => {
  it("shows selected and unavailable colors with text labels", () => {
    render(<LobbyColorPicker lobby={configuredLobbyFixture()} currentUserId="user-1" />, { wrapper: MemoryRouter });

    expect(screen.getByRole("button", { name: /Red Selected/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Blue Taken/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Green Available/i })).toBeEnabled();
  });
});
