import type {
  ActiveLobbyConflict,
  Lobby,
  LobbyPlayer,
  StartLobbyResult,
} from "../../domain/lobby/lobbyTypes";

const host: LobbyPlayer = {
  userId: "user-1",
  joinedAtUtc: "2026-06-16T10:00:00.000Z",
  selectedPieceColor: null,
  isReady: false,
};

export function lobbyFixture(overrides: Partial<Lobby> = {}): Lobby {
  return {
    id: "lobby-1",
    code: "ABC123",
    hostUserId: "user-1",
    status: "Open",
    maxPlayers: 4,
    expiresAtUtc: "2099-06-16T10:30:00.000Z",
    createdAtUtc: "2026-06-16T10:00:00.000Z",
    startedAtUtc: null,
    closedAtUtc: null,
    selectedCategoryIds: [],
    setupStatus: "Pending",
    setupVersion: 0,
    updatedAtUtc: null,
    players: [host],
    ...overrides,
  };
}

export function lobbyWithGuest(overrides: Partial<Lobby> = {}): Lobby {
  return lobbyFixture({
    players: [host, { userId: "user-2", joinedAtUtc: "2026-06-16T10:01:00.000Z", selectedPieceColor: null, isReady: false }],
    ...overrides,
  });
}

export function startLobbyResultFixture(): StartLobbyResult {
  return {
    sessionId: "session-1",
    initialState: {
      lobbyId: "lobby-1",
      orderedPlayerIds: ["user-1", "user-2"],
      createdAtUtc: "2026-06-16T10:02:00.000Z",
      selectedCategoryIds: [],
      playerColors: {},
    },
    lobby: lobbyWithGuest({ status: "Started", startedAtUtc: "2026-06-16T10:02:00.000Z" }),
  };
}

export function activeLobbyConflict(): ActiveLobbyConflict {
  return {
    lobby: lobbyFixture(),
    lobbyId: "lobby-1",
    message: "You already have an active lobby.",
  };
}
