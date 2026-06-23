import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "../../tests/setup";
import { lobbyWithGuest } from "../../tests/fixtures/lobbyFixtures";
import { useAuthStore } from "../../stores/authStore";
import { useLobbyStore } from "../../stores/lobbyStore";
import { useErrorStore } from "../../stores/errorStore";
import type { LobbyHubHandlers } from "../../realtime/lobbyHub";
import { LobbyRoomPage } from "./LobbyRoomPage";

const lobbyHubMocks = vi.hoisted(() => ({
  createLobbyHubConnection: vi.fn(),
  joinLobbyHubGroup: vi.fn(),
  registerLobbyHubHandlers: vi.fn(),
}));

vi.mock("../../realtime/lobbyHub", () => ({
  createLobbyHubConnection: lobbyHubMocks.createLobbyHubConnection,
  joinLobbyHubGroup: lobbyHubMocks.joinLobbyHubGroup,
  registerLobbyHubHandlers: lobbyHubMocks.registerLobbyHubHandlers,
}));

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

function accessTokenForUser(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const payload = btoa(JSON.stringify({ exp: 4102444800, sub: userId })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${header}.${payload}.`;
}

describe("LobbyRoomPage", () => {
  beforeEach(() => {
    lobbyHubMocks.createLobbyHubConnection.mockReset();
    lobbyHubMocks.joinLobbyHubGroup.mockReset();
    lobbyHubMocks.joinLobbyHubGroup.mockResolvedValue(undefined);
    lobbyHubMocks.registerLobbyHubHandlers.mockReset();
  });

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

  it("ignores lobby update connection start failures after unmount", async () => {
    let rejectStart!: (error: unknown) => void;
    const stop = vi.fn().mockResolvedValue(undefined);
    const start = vi.fn(
      () =>
        new Promise<void>((_, reject) => {
          rejectStart = reject;
        }),
    );

    lobbyHubMocks.createLobbyHubConnection.mockReturnValue({
      start,
      stop,
      on: vi.fn(),
    });

    useAuthStore.getState().login(accessTokenForUser("user-1"));
    useLobbyStore.getState().setCurrentLobby(lobbyWithGuest());

    const { unmount } = render(
      <MemoryRouter initialEntries={["/lobby/lobby-1"]}>
        <Routes>
          <Route path="/lobby/:lobbyId" element={<LobbyRoomPage />} />
        </Routes>
      </MemoryRouter>,
    );

    unmount();
    rejectStart(new Error("Connection stopped before startup completed."));

    await waitFor(() => expect(stop).toHaveBeenCalled());
    await Promise.resolve();

    expect(useErrorStore.getState().toast).toBeNull();
    expect(useLobbyStore.getState().connection.status).toBe("connecting");
  });

  it("navigates guests to the game route when the lobby starts over realtime", async () => {
    let handlers!: LobbyHubHandlers;
    lobbyHubMocks.createLobbyHubConnection.mockReturnValue({
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
    });
    lobbyHubMocks.registerLobbyHubHandlers.mockImplementation((_, nextHandlers: LobbyHubHandlers) => {
      handlers = nextHandlers;
    });

    useAuthStore.getState().login(accessTokenForUser("user-2"));
    useLobbyStore.getState().setCurrentLobby(lobbyWithGuest());

    render(
      <MemoryRouter initialEntries={["/lobby/lobby-1"]}>
        <Routes>
          <Route path="/lobby/:lobbyId" element={<LobbyRoomPage />} />
          <Route path="/game/:sessionId" element={<p>Game loaded</p>} />
        </Routes>
      </MemoryRouter>,
    );

    handlers.onStarted({ lobbyId: "lobby-1", sessionId: "session-1", initialState: null, lobby: null });

    expect(await screen.findByText("Game loaded")).toBeInTheDocument();
  });

  it("subscribes to the current lobby update group after connecting", async () => {
    const connection = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
    };
    lobbyHubMocks.createLobbyHubConnection.mockReturnValue(connection);

    useAuthStore.getState().login(accessTokenForUser("user-1"));
    useLobbyStore
      .getState()
      .setCurrentLobby(lobbyWithGuest({ players: [{ userId: "user-1", joinedAtUtc: "now", selectedPieceColor: null, isReady: false }] }));

    render(
      <MemoryRouter initialEntries={["/lobby/lobby-1"]}>
        <Routes>
          <Route path="/lobby/:lobbyId" element={<LobbyRoomPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(lobbyHubMocks.joinLobbyHubGroup).toHaveBeenCalledWith(connection, "lobby-1"));
  });

  it("refetches the lobby when a setup realtime payload cannot be mapped safely", async () => {
    let handlers!: LobbyHubHandlers;
    let readCount = 0;
    server.use(
      http.get("**/api/lobbies/lobby-1", () => {
        readCount += 1;
        return HttpResponse.json(lobbyWithGuest({ setupVersion: 7 }));
      }),
    );
    lobbyHubMocks.createLobbyHubConnection.mockReturnValue({
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
    });
    lobbyHubMocks.registerLobbyHubHandlers.mockImplementation((_, nextHandlers: LobbyHubHandlers) => {
      handlers = nextHandlers;
    });

    useAuthStore.getState().login(accessTokenForUser("user-1"));
    useLobbyStore.getState().setCurrentLobby(lobbyWithGuest());

    render(
      <MemoryRouter initialEntries={["/lobby/lobby-1"]}>
        <Routes>
          <Route path="/lobby/:lobbyId" element={<LobbyRoomPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(lobbyHubMocks.registerLobbyHubHandlers).toHaveBeenCalled());
    handlers.onSetupChangedMalformed?.();

    await waitFor(() => expect(readCount).toBe(1));
    expect(useLobbyStore.getState().currentLobby?.setupVersion).toBe(7);
  });

  it("does not repeatedly refetch the lobby after a failed route read", async () => {
    let readCount = 0;
    server.use(
      http.get("**/api/lobbies/lobby-1", () => {
        readCount += 1;
        return HttpResponse.json({ title: "Rate limited", status: 429 }, { status: 429 });
      }),
    );
    lobbyHubMocks.createLobbyHubConnection.mockReturnValue({
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
    });

    useAuthStore.getState().login(accessTokenForUser("user-1"));

    render(
      <MemoryRouter initialEntries={["/lobby/lobby-1"]}>
        <Routes>
          <Route path="/lobby/:lobbyId" element={<LobbyRoomPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(readCount).toBe(1));
    await new Promise((resolve) => window.setTimeout(resolve, 25));

    expect(readCount).toBe(1);
  });
});
