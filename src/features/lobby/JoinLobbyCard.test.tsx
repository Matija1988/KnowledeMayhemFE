import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { useLobbyStore } from "../../stores/lobbyStore";
import { JoinLobbyCard } from "./JoinLobbyCard";

describe("JoinLobbyCard", () => {
  it("validates empty codes and normalizes submitted codes", async () => {
    useAuthStore.getState().login("token");
    render(<JoinLobbyCard />, { wrapper: MemoryRouter });

    await userEvent.click(screen.getByRole("button", { name: "Join lobby" }));
    expect(await screen.findByText("Enter a lobby code.")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Lobby code"), " abc123 ");
    await userEvent.click(screen.getByRole("button", { name: "Join lobby" }));

    expect(useLobbyStore.getState().currentLobby?.code).toBe("ABC123");
  });
});
