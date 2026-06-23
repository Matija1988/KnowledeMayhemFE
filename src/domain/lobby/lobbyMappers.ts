import type {
  ActiveLobbyConflict,
  CancelLobbyResult,
  LeaveLobbyResult,
  Lobby,
  LobbyPlayer,
  LobbySetupStatus,
  PieceColor,
  LobbyStatus,
  StartLobbyResult,
} from "./lobbyTypes";
import { allowedPieceColors } from "./lobbyTypes";

const lobbyStatuses = new Set<LobbyStatus>(["Open", "Started", "Closed", "Cancelled"]);
const setupStatuses = new Set<LobbySetupStatus>(["Pending", "Ready"]);
const pieceColors = new Set<PieceColor>(allowedPieceColors);

export type LobbyPlayerDto = {
  userId: string;
  joinedAtUtc: string;
  selectedPieceColor?: string | null;
  isReady?: boolean;
};
export type LobbyDto = Omit<Lobby, "players" | "selectedCategoryIds" | "setupStatus" | "setupVersion" | "updatedAtUtc"> & {
  players?: LobbyPlayerDto[];
  selectedCategoryIds?: string[] | null;
  setupStatus?: string | null;
  setupVersion?: number | null;
  updatedAtUtc?: string | null;
};
export type StartLobbyResultDto = Omit<StartLobbyResult, "lobby" | "initialState"> & {
  initialState: {
    lobbyId: string;
    orderedPlayerIds?: string[];
    createdAtUtc: string;
    selectedCategoryIds?: string[] | null;
    playerColors?: Record<string, string> | null;
  };
  lobby: LobbyDto;
};
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

  const setupStatus = dto.setupStatus ?? "Pending";
  if (!setupStatuses.has(setupStatus as LobbySetupStatus)) {
    throw new Error(`Unsupported lobby setup status: ${String(dto.setupStatus)}`);
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
    selectedCategoryIds: [...(dto.selectedCategoryIds ?? [])],
    setupStatus: setupStatus as LobbySetupStatus,
    setupVersion: dto.setupVersion ?? 0,
    updatedAtUtc: dto.updatedAtUtc ?? null,
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
    selectedPieceColor: mapPieceColor(dto.selectedPieceColor),
    isReady: Boolean(dto.isReady),
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
      orderedPlayerIds: [...(dto.initialState.orderedPlayerIds ?? [])],
      createdAtUtc: dto.initialState.createdAtUtc,
      selectedCategoryIds: [...(dto.initialState.selectedCategoryIds ?? [])],
      playerColors: mapPlayerColors(dto.initialState.playerColors ?? {}),
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

function mapPieceColor(value: unknown): PieceColor | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (!pieceColors.has(value as PieceColor)) {
    throw new Error(`Unsupported piece color: ${String(value)}`);
  }
  return value as PieceColor;
}

function mapPlayerColors(value: Record<string, string>): Record<string, PieceColor> {
  return Object.fromEntries(Object.entries(value).map(([userId, color]) => [userId, mapPieceColor(color)]).filter((entry): entry is [string, PieceColor] => entry[1] !== null));
}
