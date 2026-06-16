import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { lobbyWithGuest } from "../../tests/fixtures/lobbyFixtures";
import { useLobbyStore } from "../../stores/lobbyStore";
import { useErrorStore } from "../../stores/errorStore";
import { LobbyRoomPage } from "./LobbyRoomPage";

function renderRoom() {
  useLobbyStore.getState().setCurrentLobby(lobbyWithGuest());
  render(
    <MemoryRouter initialEntries={["/lobby/lobby-1"]}>
      <Routes>
        <Route path="/lobby/:lobbyId" element={<LobbyRoomPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LobbyRoomPage", () => {
  it("renders lobby details and copy-code feedback", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    renderRoom();

    expect(screen.getByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("2/4")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Copy lobby code" }));
    expect(await screen.findByText("Lobby code copied.")).toBeInTheDocument();
  });

  it("shows expired lobby messaging", () => {
    useLobbyStore.getState().setCurrentLobby(lobbyWithGuest({ expiresAtUtc: "2020-01-01T00:00:00.000Z" }));
    render(
      <MemoryRouter initialEntries={["/lobby/lobby-1"]}>
        <Routes>
          <Route path="/lobby/:lobbyId" element={<LobbyRoomPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("This lobby has expired.")).toBeInTheDocument();
  });

  it("exposes live region messages", () => {
    useLobbyStore.getState().setCurrentLobby(lobbyWithGuest());
    useLobbyStore.getState().applyPlayerJoined(lobbyWithGuest(), "user-2");
    render(
      <MemoryRouter initialEntries={["/lobby/lobby-1"]}>
        <Routes>
          <Route path="/lobby/:lobbyId" element={<LobbyRoomPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("user-2 joined the lobby.")).toBeInTheDocument();
  });

  it("can show lobby update connection errors through the error store", () => {
    useErrorStore.getState().showError({
      title: "Lobby updates unavailable",
      message: "Unable to connect to lobby updates.",
      displayMode: "toast",
    });

    expect(useErrorStore.getState().toast?.message).toBe("Unable to connect to lobby updates.");
  });
});
