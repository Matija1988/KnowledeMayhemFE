export type LobbyStatus = "Open" | "Started" | "Closed" | "Cancelled";

export type LobbyPlayer = {
  userId: string;
  joinedAtUtc: string;
};

export type Lobby = {
  id: string;
  code: string;
  hostUserId: string;
  status: LobbyStatus;
  maxPlayers: number;
  expiresAtUtc: string;
  createdAtUtc: string;
  startedAtUtc: string | null;
  closedAtUtc: string | null;
  players: LobbyPlayer[];
};

export type InitialGameState = {
  lobbyId: string;
  orderedPlayerIds: string[];
  createdAtUtc: string;
};

export type StartLobbyResult = {
  sessionId: string;
  initialState: InitialGameState;
  lobby: Lobby;
};

export type LeaveLobbyResult = {
  lobby: Lobby | null;
  closed: boolean;
  newHostUserId?: string | null;
};

export type CancelLobbyResult = {
  lobby: Lobby;
};

export type ActiveLobbyConflict = {
  lobby?: Lobby | null;
  lobbyId?: string | null;
  message?: string;
};

export type ConnectionState = {
  status: "idle" | "connecting" | "connected" | "reconnecting" | "disconnected" | "error";
  message: string | null;
  lastUpdatedAtUtc: string | null;
};

export type LobbyOperation =
  | "createLobby"
  | "joinLobby"
  | "readLobby"
  | "leaveLobby"
  | "cancelLobby"
  | "startLobby";

export type LobbyActionError = {
  title: string;
  message: string;
  displayMode: "toast" | "modal";
  activeLobby?: Lobby | null;
  activeLobbyId?: string | null;
};
