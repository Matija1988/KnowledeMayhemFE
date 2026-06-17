import * as signalR from "@microsoft/signalr";
import { apiBaseUrl } from "../api/apiConfig";
import {
  isHostChangedEvent,
  isLobbyPlayerEvent,
  isLobbySnapshotPayload,
  lobbyEventNames,
  toLobbyEvent,
  toStartLobbyEvent,
  type LobbyStartedEvent,
} from "./lobbyEvents";
import type { Lobby, StartLobbyResult } from "../domain/lobby/lobbyTypes";

type HubLike = {
  on: (eventName: string, callback: (...args: unknown[]) => void) => void;
  onreconnecting?: (callback: () => void) => void;
  onreconnected?: (callback: () => void) => void;
  onclose?: (callback: () => void) => void;
};

export type LobbyHubHandlers = {
  onSnapshot: (lobby: Lobby) => void;
  onPlayerJoined: (lobby: Lobby) => void;
  onPlayerJoinedPatch: (lobbyId: string, userId: string, joinedAtUtc: string) => void;
  onPlayerLeft: (lobby: Lobby) => void;
  onPlayerLeftPatch: (lobbyId: string, userId: string) => void;
  onHostChanged: (hostUserId: string) => void;
  onStarted: (result: StartLobbyResult | LobbyStartedEvent) => void;
  onClosed: (lobby: Lobby | null) => void;
  onCancelled: (lobby: Lobby | null) => void;
  onConnectionStatus: (status: "connected" | "reconnecting" | "disconnected") => void;
};

export function getLobbyHubUrl(baseUrl = apiBaseUrl): string {
  return `${baseUrl.replace(/\/$/, "")}/hubs/lobbies`;
}

export function createLobbyHubConnection(accessToken: string, baseUrl = apiBaseUrl): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(getLobbyHubUrl(baseUrl), {
      accessTokenFactory: () => accessToken,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export function registerLobbyHubHandlers(connection: HubLike, handlers: LobbyHubHandlers): void {
  connection.on(lobbyEventNames.snapshot, (payload) => handlers.onSnapshot(toLobbyEvent(payload as never)));
  connection.on(lobbyEventNames.playerJoined, (payload) => {
    if (isLobbySnapshotPayload(payload)) {
      handlers.onPlayerJoined(toLobbyEvent(payload));
      return;
    }
    if (isLobbyPlayerEvent(payload)) {
      handlers.onPlayerJoinedPatch(payload.lobbyId, payload.player.userId, payload.player.joinedAtUtc);
    }
  });
  connection.on(lobbyEventNames.playerLeft, (payload) => {
    if (isLobbySnapshotPayload(payload)) {
      handlers.onPlayerLeft(toLobbyEvent(payload));
      return;
    }
    if (isLobbyPlayerEvent(payload)) {
      handlers.onPlayerLeftPatch(payload.lobbyId, payload.player.userId);
    }
  });
  connection.on(lobbyEventNames.hostChanged, (payload) => {
    if (isHostChangedEvent(payload)) {
      handlers.onHostChanged(payload.hostUserId);
    }
  });
  connection.on(lobbyEventNames.started, (payload) => handlers.onStarted(toStartLobbyEvent(payload as never)));
  connection.on(lobbyEventNames.closed, (payload) => handlers.onClosed(payload ? toLobbyEvent(payload as never) : null));
  connection.on(lobbyEventNames.cancelled, (payload) =>
    handlers.onCancelled(payload ? toLobbyEvent(payload as never) : null),
  );
  connection.onreconnecting?.(() => handlers.onConnectionStatus("reconnecting"));
  connection.onreconnected?.(() => handlers.onConnectionStatus("connected"));
  connection.onclose?.(() => handlers.onConnectionStatus("disconnected"));
}
