import * as signalR from "@microsoft/signalr";
import { apiBaseUrl } from "../api/apiConfig";
import type { GameActionResult, GameSession } from "../domain/game/gameTypes";
import type { ConquestResult, GameplayQuestion, QuestionAttemptEvent } from "../domain/conquest/conquestTypes";
import {
  gameEventNames,
  isConquestResultEvent,
  isGameActionResult,
  isGameMoveExecutedEvent,
  isGameSession,
  isGameTileOwnershipChangedEvent,
  isGameTurnAdvancedEvent,
  isGameplayQuestionEvent,
  isQuestionAttemptEvent,
  toConquestResultEvent,
  toGameActionResultEvent,
  toGameSessionEvent,
  toGameplayQuestionEvent,
  toQuestionAttemptEvent,
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
  onGameplayQuestion?: (question: GameplayQuestion) => void;
  onQuestionAttempt?: (event: QuestionAttemptEvent) => void;
  onConquestResult?: (result: ConquestResult) => void;
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
    try {
      if (isGameActionResult(payload)) {
        handlers.onActionResult(toGameActionResultEvent(payload));
        return;
      }
      if (isGameSession(payload)) {
        handlers.onSession(toGameSessionEvent(payload));
        return;
      }
      if (isConquestResultEvent(payload)) {
        handlers.onConquestResult?.(toConquestResultEvent(payload));
        return;
      }
      if (isGameplayQuestionEvent(payload)) {
        handlers.onGameplayQuestion?.(toGameplayQuestionEvent(payload));
        return;
      }
      if (isQuestionAttemptEvent(payload)) {
        handlers.onQuestionAttempt?.(toQuestionAttemptEvent(payload));
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
    } catch {
      handlers.onPatchNeedsRefresh();
      return;
    }
    handlers.onPatchNeedsRefresh();
  };

  [
    gameEventNames.sessionCreated,
    gameEventNames.started,
    gameEventNames.moveExecuted,
    gameEventNames.tileOwnershipChanged,
    gameEventNames.turnAdvanced,
    gameEventNames.completed,
    gameEventNames.cancelled,
    gameEventNames.conquestAttemptStarted,
    "ConquestAttemptStarted",
    gameEventNames.questionIssued,
    "QuestionIssued",
    gameEventNames.answerSubmitted,
    "AnswerSubmitted",
    gameEventNames.conquestSucceeded,
    "ConquestSucceeded",
    gameEventNames.conquestFailed,
    "ConquestFailed",
    gameEventNames.conquestExpired,
    "ConquestExpired",
  ].forEach((eventName) => connection.on(eventName, handlePayload));
  connection.onreconnecting?.(() => handlers.onConnectionStatus("reconnecting"));
  connection.onreconnected?.(() => handlers.onConnectionStatus("connected"));
  connection.onclose?.(() => handlers.onConnectionStatus("disconnected"));
}
