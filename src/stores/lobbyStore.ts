import { create } from "zustand";
import { isLobbyExpired } from "../domain/lobby/lobbyMappers";
import { allowedPieceColors, type ConnectionState, type Lobby, type LobbyOperation, type PieceColor, type StartLobbyResult } from "../domain/lobby/lobbyTypes";

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
  applyPlayerJoinedPatch: (lobbyId: string, userId: string, joinedAtUtc: string) => void;
  applyPlayerLeft: (lobby: Lobby, userId?: string) => void;
  applyPlayerLeftPatch: (lobbyId: string, userId: string) => void;
  applyHostChanged: (hostUserId: string) => void;
  applyLobbyStarted: (result: StartLobbyResult) => void;
  applyLobbySnapshot: (lobby: Lobby) => void;
  applySetupChanged: (lobby: Lobby, reason?: string) => void;
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
  applyPlayerJoinedPatch: (lobbyId, userId, joinedAtUtc) =>
    set((state) => {
      if (!state.currentLobby || state.currentLobby.id !== lobbyId) {
        return {};
      }
      const alreadyJoined = state.currentLobby.players.some((player) => player.userId === userId);
      return {
        currentLobby: alreadyJoined
          ? state.currentLobby
          : {
              ...state.currentLobby,
              players: [...state.currentLobby.players, { userId, joinedAtUtc, selectedPieceColor: null, isReady: false }],
            },
        liveMessage: `${userId} joined the lobby.`,
      };
    }),
  applyPlayerLeft: (lobby, userId) =>
    set({ currentLobby: lobby, liveMessage: userId ? `${userId} left the lobby.` : "A player left the lobby." }),
  applyPlayerLeftPatch: (lobbyId, userId) =>
    set((state) => {
      if (!state.currentLobby || state.currentLobby.id !== lobbyId) {
        return {};
      }
      return {
        currentLobby: {
          ...state.currentLobby,
          players: state.currentLobby.players.filter((player) => player.userId !== userId),
        },
        liveMessage: `${userId} left the lobby.`,
      };
    }),
  applyHostChanged: (hostUserId) =>
    set((state) => ({
      currentLobby: state.currentLobby ? { ...state.currentLobby, hostUserId } : null,
      liveMessage: "Lobby host changed.",
    })),
  applyLobbyStarted: (result) =>
    set({ currentLobby: result.lobby, lastStartResult: result, liveMessage: "Lobby started." }),
  applyLobbySnapshot: (lobby) => set({ currentLobby: lobby }),
  applySetupChanged: (lobby, reason = "SetupRecalculated") =>
    set({ currentLobby: lobby, liveMessage: toSetupLiveMessage(reason) }),
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
  if (lobby.selectedCategoryIds.length === 0) {
    return "Select at least one category.";
  }
  if (!lobby.players.every((player) => player.selectedPieceColor)) {
    return "Every player must select a color.";
  }
  if (!hasUniqueSelectedColors(lobby)) {
    return "Every player must use a unique color.";
  }
  if (!lobby.players.every((player) => player.isReady)) {
    return "Every player must be ready.";
  }
  if (lobby.setupStatus !== "Ready") {
    return "Lobby setup is not ready.";
  }
  return null;
}

export function selectUsedPieceColors(lobby: Lobby | null): PieceColor[] {
  if (!lobby) {
    return [];
  }

  return lobby.players.flatMap((player) => (player.selectedPieceColor ? [player.selectedPieceColor] : []));
}

export function selectCurrentLobbyPlayer(lobby: Lobby | null, currentUserId: string | null) {
  if (!lobby || !currentUserId) {
    return null;
  }

  return lobby.players.find((player) => player.userId === currentUserId) ?? null;
}

export function selectCurrentPlayerColor(lobby: Lobby | null, currentUserId: string | null): PieceColor | null {
  return selectCurrentLobbyPlayer(lobby, currentUserId)?.selectedPieceColor ?? null;
}

export function selectIsColorUsedByAnother(lobby: Lobby | null, currentUserId: string | null, color: PieceColor): boolean {
  if (!lobby) {
    return false;
  }

  return lobby.players.some((player) => player.userId !== currentUserId && player.selectedPieceColor === color);
}

export function selectAvailablePieceColors(lobby: Lobby | null, currentUserId: string | null): PieceColor[] {
  return allowedPieceColors.filter((color) => !selectIsColorUsedByAnother(lobby, currentUserId, color));
}

function hasUniqueSelectedColors(lobby: Lobby): boolean {
  const colors = lobby.players.flatMap((player) => (player.selectedPieceColor ? [player.selectedPieceColor] : []));
  return colors.length === lobby.players.length && new Set(colors).size === colors.length;
}

function toSetupLiveMessage(reason: string): string {
  switch (reason) {
    case "CategoriesUpdated":
      return "Lobby categories updated.";
    case "PlayerColorSelected":
      return "Player color updated.";
    case "PlayerReadyChanged":
      return "Player readiness updated.";
    case "PlayerJoined":
      return "A player joined the lobby.";
    case "PlayerLeft":
      return "A player left the lobby.";
    case "HostTransferred":
      return "Lobby host changed.";
    default:
      return "Lobby setup updated.";
  }
}
