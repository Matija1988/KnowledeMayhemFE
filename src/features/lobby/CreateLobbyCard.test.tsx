import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { useLobbyStore } from "../../stores/lobbyStore";
import { CreateLobbyCard } from "./CreateLobbyCard";

describe("CreateLobbyCard", () => {
  it("defaults to four players and creates a lobby", async () => {
    useAuthStore.getState().login("token");
    render(<CreateLobbyCard />, { wrapper: MemoryRouter });

    expect(screen.getByLabelText("Max players")).toHaveValue("4");
    await userEvent.click(screen.getByRole("button", { name: "Create lobby" }));

    expect(useLobbyStore.getState().currentLobby?.maxPlayers).toBe(4);
  });
});
