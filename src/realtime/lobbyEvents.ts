import { mapLobby, mapStartLobbyResult, type LobbyDto, type StartLobbyResultDto } from "../domain/lobby/lobbyMappers";
import type { InitialGameState, Lobby, LobbyPlayer, StartLobbyResult } from "../domain/lobby/lobbyTypes";

export const lobbyEventNames = {
  snapshot: "LobbySnapshot",
  playerJoined: "PlayerJoined",
  playerLeft: "PlayerLeft",
  hostChanged: "HostChanged",
  started: "LobbyStarted",
  closed: "LobbyClosed",
  cancelled: "LobbyCancelled",
} as const;

export type HostChangedEventDto = {
  lobbyId: string;
  hostUserId: string;
};

export type LobbyPlayerEventDto = {
  lobbyId: string;
  player: LobbyPlayer;
};

export type LobbyStartedEventDto = {
  lobbyId: string;
  sessionId: string;
  initialState?: InitialGameState;
};

export type LobbyStartedEvent = {
  lobbyId: string;
  sessionId: string;
  initialState: InitialGameState | null;
  lobby: Lobby | null;
};

export function toLobbyEvent(payload: LobbyDto): Lobby {
  return mapLobby(payload);
}

export function toStartLobbyEvent(payload: StartLobbyResultDto | LobbyStartedEventDto): StartLobbyResult | LobbyStartedEvent {
  if (isLobbySnapshotPayload((payload as StartLobbyResultDto).lobby)) {
    return mapStartLobbyResult(payload as StartLobbyResultDto);
  }

  if (isLobbyStartedEvent(payload)) {
    return {
      lobbyId: payload.lobbyId,
      sessionId: payload.sessionId,
      initialState: payload.initialState ?? null,
      lobby: null,
    };
  }

  throw new Error("Lobby started event is missing session handoff data.");
}

export function isHostChangedEvent(payload: unknown): payload is HostChangedEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as HostChangedEventDto).lobbyId === "string" &&
    typeof (payload as HostChangedEventDto).hostUserId === "string"
  );
}

export function isLobbyPlayerEvent(payload: unknown): payload is LobbyPlayerEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as LobbyPlayerEventDto).lobbyId === "string" &&
    typeof (payload as LobbyPlayerEventDto).player?.userId === "string"
  );
}

export function isLobbyStartedEvent(payload: unknown): payload is LobbyStartedEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as LobbyStartedEventDto).lobbyId === "string" &&
    typeof (payload as LobbyStartedEventDto).sessionId === "string"
  );
}

export function isLobbySnapshotPayload(payload: unknown): payload is LobbyDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as LobbyDto).id === "string" &&
    typeof (payload as LobbyDto).code === "string" &&
    typeof (payload as LobbyDto).hostUserId === "string"
  );
}
