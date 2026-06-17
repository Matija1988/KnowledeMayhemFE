import * as signalR from "@microsoft/signalr";
import { apiBaseUrl } from "../api/apiConfig";
import type { GameActionResult, GameSession } from "../domain/game/gameTypes";
import {
  gameEventNames,
  isGameActionResult,
  isGameMoveExecutedEvent,
  isGameSession,
  isGameTileOwnershipChangedEvent,
  isGameTurnAdvancedEvent,
  toGameActionResultEvent,
  toGameSessionEvent,
  type GameMoveExecutedEventDto,
  type GameTileOwnershipChangedEventDto,
  type GameTurnAdvancedEventDto,
} from "./gameEvents";

type HubLike = {
  on: (eventName: string, callback: (...args: unknown[]) => void) => void;
  invoke?: (methodName: string, ...args: unknown[]) => Promise<unknown>;
  onreconnecting?: (callback: () => void) => void;
  onreconnected?: (callback: () => void) => void;
  onclose?: (callback: () => void) => void;
};

export type GameHubHandlers = {
  onSession: (session: GameSession) => void;
  onActionResult: (result: GameActionResult) => void;
  onMoveExecuted: (event: GameMoveExecutedEventDto) => void;
  onTileOwnershipChanged: (event: GameTileOwnershipChangedEventDto) => void;
  onTurnAdvanced: (event: GameTurnAdvancedEventDto) => void;
  onPatchNeedsRefresh: () => void;
  onConnectionStatus: (status: "connected" | "reconnecting" | "disconnected") => void;
};

export function getGameHubUrl(baseUrl = apiBaseUrl): string {
  return `${baseUrl.replace(/\/$/, "")}/hubs/game`;
}

export function createGameHubConnection(accessToken: string, baseUrl = apiBaseUrl): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(getGameHubUrl(baseUrl), { accessTokenFactory: () => accessToken })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

export async function joinGameSessionHubGroup(connection: Pick<HubLike, "invoke">, gameSessionId: string): Promise<void> {
  if (!connection.invoke) {
    return;
  }

  await connection.invoke("SubscribeToGameSession", { gameSessionId });
}

export function registerGameHubHandlers(connection: HubLike, handlers: GameHubHandlers): void {
  const handlePayload = (payload: unknown) => {
    if (isGameActionResult(payload)) {
      handlers.onActionResult(toGameActionResultEvent(payload));
      return;
    }
    if (isGameSession(payload)) {
      handlers.onSession(toGameSessionEvent(payload));
      return;
    }
    if (typeof payload === "object" && payload !== null && "session" in payload && isGameSession(payload.session)) {
      handlers.onSession(toGameSessionEvent(payload.session));
      return;
    }
    if (isGameMoveExecutedEvent(payload)) {
      payload.session ? handlers.onSession(toGameSessionEvent(payload.session)) : handlers.onMoveExecuted(payload);
      return;
    }
    if (isGameTileOwnershipChangedEvent(payload)) {
      payload.session ? handlers.onSession(toGameSessionEvent(payload.session)) : handlers.onTileOwnershipChanged(payload);
      return;
    }
    if (isGameTurnAdvancedEvent(payload)) {
      if (payload.session) {
        handlers.onSession(toGameSessionEvent(payload.session));
        return;
      }
      handlers.onTurnAdvanced(payload);
      return;
    }
    handlers.onPatchNeedsRefresh();
  };

  connection.on(gameEventNames.sessionCreated, handlePayload);
  connection.on(gameEventNames.started, handlePayload);
  connection.on(gameEventNames.moveExecuted, handlePayload);
  connection.on(gameEventNames.tileOwnershipChanged, handlePayload);
  connection.on(gameEventNames.turnAdvanced, handlePayload);
  connection.on(gameEventNames.completed, handlePayload);
  connection.on(gameEventNames.cancelled, handlePayload);
  connection.onreconnecting?.(() => handlers.onConnectionStatus("reconnecting"));
  connection.onreconnected?.(() => handlers.onConnectionStatus("connected"));
  connection.onclose?.(() => handlers.onConnectionStatus("disconnected"));
}
