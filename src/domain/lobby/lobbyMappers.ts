import type {
  ActiveLobbyConflict,
  CancelLobbyResult,
  LeaveLobbyResult,
  Lobby,
  LobbyPlayer,
  LobbyStatus,
  StartLobbyResult,
} from "./lobbyTypes";

const lobbyStatuses = new Set<LobbyStatus>(["Open", "Started", "Closed", "Cancelled"]);

export type LobbyPlayerDto = LobbyPlayer;
export type LobbyDto = Lobby;
export type StartLobbyResultDto = StartLobbyResult;
export type LeaveLobbyResultDto = LeaveLobbyResult;
export type CancelLobbyResultDto = CancelLobbyResult;
export type ActiveLobbyConflictDto = {
  lobby?: LobbyDto | null;
  lobbyId?: string | null;
  message?: string;
};

export function mapLobby(dto: LobbyDto): Lobby {
  if (!dto.id || !dto.code || !dto.hostUserId) {
    throw new Error("Lobby response is missing required identity fields.");
  }

  if (!lobbyStatuses.has(dto.status)) {
    throw new Error(`Unsupported lobby status: ${String(dto.status)}`);
  }

  if (![2, 3, 4].includes(dto.maxPlayers)) {
    throw new Error(`Unsupported maxPlayers value: ${dto.maxPlayers}`);
  }

  return {
    id: dto.id,
    code: dto.code,
    hostUserId: dto.hostUserId,
    status: dto.status,
    maxPlayers: dto.maxPlayers,
    expiresAtUtc: dto.expiresAtUtc,
    createdAtUtc: dto.createdAtUtc,
    startedAtUtc: dto.startedAtUtc ?? null,
    closedAtUtc: dto.closedAtUtc ?? null,
    players: (dto.players ?? []).map(mapLobbyPlayer),
  };
}

export function mapLobbyPlayer(dto: LobbyPlayerDto): LobbyPlayer {
  if (!dto.userId) {
    throw new Error("Lobby player response is missing userId.");
  }

  return {
    userId: dto.userId,
    joinedAtUtc: dto.joinedAtUtc,
  };
}

export function mapStartLobbyResult(dto: StartLobbyResultDto): StartLobbyResult {
  if (!dto.sessionId || !dto.initialState?.lobbyId) {
    throw new Error("Start lobby response is missing session handoff data.");
  }

  return {
    sessionId: dto.sessionId,
    initialState: {
      lobbyId: dto.initialState.lobbyId,
      orderedPlayerIds: [...dto.initialState.orderedPlayerIds],
      createdAtUtc: dto.initialState.createdAtUtc,
    },
    lobby: mapLobby(dto.lobby),
  };
}

export function mapLeaveLobbyResult(dto: LeaveLobbyResultDto): LeaveLobbyResult {
  return {
    lobby: dto.lobby ? mapLobby(dto.lobby) : null,
    closed: Boolean(dto.closed),
    newHostUserId: dto.newHostUserId ?? null,
  };
}

export function mapCancelLobbyResult(dto: CancelLobbyResultDto): CancelLobbyResult {
  return { lobby: mapLobby(dto.lobby) };
}

export function mapActiveLobbyConflict(dto: ActiveLobbyConflictDto): ActiveLobbyConflict {
  return {
    lobby: dto.lobby ? mapLobby(dto.lobby) : null,
    lobbyId: dto.lobbyId ?? null,
    message: dto.message,
  };
}

export function normalizeJoinCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isLobbyExpired(lobby: Lobby, now = Date.now()): boolean {
  return new Date(lobby.expiresAtUtc).getTime() <= now;
}
