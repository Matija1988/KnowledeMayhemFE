import { mapLobby, mapStartLobbyResult, type LobbyDto, type StartLobbyResultDto } from "../domain/lobby/lobbyMappers";
import type { Lobby, StartLobbyResult } from "../domain/lobby/lobbyTypes";

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

export function toLobbyEvent(payload: LobbyDto): Lobby {
  return mapLobby(payload);
}

export function toStartLobbyEvent(payload: StartLobbyResultDto): StartLobbyResult {
  return mapStartLobbyResult(payload);
}

export function isHostChangedEvent(payload: unknown): payload is HostChangedEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as HostChangedEventDto).lobbyId === "string" &&
    typeof (payload as HostChangedEventDto).hostUserId === "string"
  );
}
