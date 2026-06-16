import { create } from "zustand";
import { isLobbyExpired } from "../domain/lobby/lobbyMappers";
import type { ConnectionState, Lobby, LobbyOperation, StartLobbyResult } from "../domain/lobby/lobbyTypes";

type LobbyStore = {
  currentLobby: Lobby | null;
  connection: ConnectionState;
  pendingOperation: LobbyOperation | null;
  lastStartResult: StartLobbyResult | null;
  liveMessage: string;
  setCurrentLobby: (lobby: Lobby | null) => void;
  beginOperation: (operation: LobbyOperation) => void;
  endOperation: () => void;
  setConnection: (connection: Partial<ConnectionState>) => void;
  applyPlayerJoined: (lobby: Lobby, userId?: string) => void;
  applyPlayerLeft: (lobby: Lobby, userId?: string) => void;
  applyHostChanged: (hostUserId: string) => void;
  applyLobbyStarted: (result: StartLobbyResult) => void;
  applyLobbySnapshot: (lobby: Lobby) => void;
  applyLobbyClosed: (lobby: Lobby | null) => void;
  applyLobbyCancelled: (lobby: Lobby | null) => void;
  clearLobby: () => void;
};

const idleConnection: ConnectionState = {
  status: "idle",
  message: null,
  lastUpdatedAtUtc: null,
};

export const useLobbyStore = create<LobbyStore>((set) => ({
  currentLobby: null,
  connection: idleConnection,
  pendingOperation: null,
  lastStartResult: null,
  liveMessage: "",
  setCurrentLobby: (lobby) => set({ currentLobby: lobby }),
  beginOperation: (operation) => set({ pendingOperation: operation }),
  endOperation: () => set({ pendingOperation: null }),
  setConnection: (connection) =>
    set((state) => ({
      connection: {
        ...state.connection,
        ...connection,
        lastUpdatedAtUtc: connection.lastUpdatedAtUtc ?? new Date().toISOString(),
      },
    })),
  applyPlayerJoined: (lobby, userId) =>
    set({ currentLobby: lobby, liveMessage: userId ? `${userId} joined the lobby.` : "A player joined the lobby." }),
  applyPlayerLeft: (lobby, userId) =>
    set({ currentLobby: lobby, liveMessage: userId ? `${userId} left the lobby.` : "A player left the lobby." }),
  applyHostChanged: (hostUserId) =>
    set((state) => ({
      currentLobby: state.currentLobby ? { ...state.currentLobby, hostUserId } : null,
      liveMessage: "Lobby host changed.",
    })),
  applyLobbyStarted: (result) =>
    set({ currentLobby: result.lobby, lastStartResult: result, liveMessage: "Lobby started." }),
  applyLobbySnapshot: (lobby) => set({ currentLobby: lobby }),
  applyLobbyClosed: (lobby) =>
    set({ currentLobby: lobby, liveMessage: "Lobby closed.", pendingOperation: null }),
  applyLobbyCancelled: (lobby) =>
    set({ currentLobby: lobby, liveMessage: "Lobby cancelled.", pendingOperation: null }),
  clearLobby: () => set({ currentLobby: null, pendingOperation: null, lastStartResult: null, liveMessage: "" }),
}));

export function resetLobbyStoreForTests(): void {
  useLobbyStore.setState({
    currentLobby: null,
    connection: idleConnection,
    pendingOperation: null,
    lastStartResult: null,
    liveMessage: "",
  });
}

export function selectIsHost(lobby: Lobby | null, currentUserId: string | null): boolean {
  return Boolean(lobby && currentUserId && lobby.hostUserId === currentUserId);
}

export function selectStartDisabledReason(
  lobby: Lobby | null,
  currentUserId: string | null,
  pendingOperation: LobbyOperation | null,
  now = Date.now(),
): string | null {
  if (!lobby) {
    return "Lobby is not loaded.";
  }
  if (!selectIsHost(lobby, currentUserId)) {
    return "Only the host can start this lobby.";
  }
  if (pendingOperation === "startLobby") {
    return "Start request is already in progress.";
  }
  if (lobby.status !== "Open") {
    return "Lobby is not open.";
  }
  if (isLobbyExpired(lobby, now)) {
    return "Lobby has expired.";
  }
  if (lobby.players.length < 2) {
    return "At least 2 players are required to start.";
  }
  if (lobby.players.length > 4) {
    return "No more than 4 players can start.";
  }
  return null;
}
