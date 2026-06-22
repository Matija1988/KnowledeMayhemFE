import * as signalR from "@microsoft/signalr";
import { apiBaseUrl } from "../api/apiConfig";
import type { GameActionResult, GameSession } from "../domain/game/gameTypes";
import type { ConquestResult, GameplayQuestion, QuestionAttemptEvent } from "../domain/conquest/conquestTypes";
import type { BattleQuestion, BattleResult } from "../domain/battle/battleTypes";
import {
  gameEventNames,
  isBattleQuestionEvent,
  isBattleResultEvent,
  isConquestResultEvent,
  isGameActionResult,
  isGameMoveExecutedEvent,
  isGameSession,
  isGameSnapshotRequiredEvent,
  isGameTileOwnershipChangedEvent,
  isGameTurnAdvancedEvent,
  isGameplayQuestionEvent,
  isPieceCapturedEvent,
  isPieceLeveledUpEvent,
  isQuestionAttemptEvent,
  isSpecialFieldQuestionEvent,
  isSpecialFieldResultEvent,
  toBattleQuestionEvent,
  toBattleResultEvent,
  toConquestResultEvent,
  toGameActionResultEvent,
  toGameSessionEvent,
  toGameplayQuestionEvent,
  toQuestionAttemptEvent,
  toSpecialFieldQuestionEvent,
  toSpecialFieldResultEvent,
  type GameMoveExecutedEventDto,
  type GameSnapshotRequiredEventDto,
  type GameTileOwnershipChangedEventDto,
  type GameTurnAdvancedEventDto,
  type PieceCapturedEventDto,
  type PieceLeveledUpEventDto,
} from "./gameEvents";
import { recordGameTelemetry } from "./gameTelemetry";

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
  onBattleQuestion?: (question: BattleQuestion) => void;
  onBattleResult?: (result: BattleResult) => void;
  onPieceCaptured?: (event: PieceCapturedEventDto) => void;
  onPieceLeveledUp?: (event: PieceLeveledUpEventDto) => void;
  onSnapshotRequired?: (event: GameSnapshotRequiredEventDto) => void;
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
      if (isBattleQuestionEvent(payload)) {
        handlers.onBattleQuestion?.(toBattleQuestionEvent(payload));
        return;
      }
      if (isSpecialFieldQuestionEvent(payload)) {
        handlers.onBattleQuestion?.(toSpecialFieldQuestionEvent(payload));
        return;
      }
      if (isSpecialFieldResultEvent(payload)) {
        handlers.onBattleResult?.(toSpecialFieldResultEvent(payload));
        return;
      }
      if (isBattleResultEvent(payload)) {
        handlers.onBattleResult?.(toBattleResultEvent(payload));
        return;
      }
      if (isPieceCapturedEvent(payload)) {
        handlers.onPieceCaptured?.(payload);
        return;
      }
      if (isPieceLeveledUpEvent(payload)) {
        handlers.onPieceLeveledUp?.(payload);
        return;
      }
      if (isGameSnapshotRequiredEvent(payload)) {
        recordGameTelemetry("game-snapshot-required", {
          gameSessionId: payload.gameSessionId,
          reason: payload.reason,
        });
        handlers.onSnapshotRequired?.(payload);
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
      recordGameTelemetry("game-realtime-payload-invalid", { payloadType: payloadType(payload) });
      handlers.onPatchNeedsRefresh();
      return;
    }
    recordGameTelemetry("game-realtime-payload-unmapped", { payloadType: payloadType(payload) });
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
    gameEventNames.battleAttemptStarted,
    gameEventNames.battleQuestionIssued,
    gameEventNames.battleProgressUpdated,
    gameEventNames.battleSucceeded,
    gameEventNames.battleFailed,
    gameEventNames.specialFieldAttemptStarted,
    gameEventNames.specialFieldQuestionIssued,
    gameEventNames.specialFieldProgressUpdated,
    gameEventNames.specialFieldConquered,
    gameEventNames.specialFieldFailed,
    gameEventNames.pieceCaptured,
    gameEventNames.pieceLeveledUp,
    gameEventNames.snapshotRequired,
  ].forEach((eventName) => connection.on(eventName, handlePayload));
  connection.onreconnecting?.(() => {
    recordGameTelemetry("game-hub-reconnecting");
    handlers.onConnectionStatus("reconnecting");
  });
  connection.onreconnected?.(() => {
    recordGameTelemetry("game-hub-reconnected");
    handlers.onConnectionStatus("connected");
  });
  connection.onclose?.(() => {
    recordGameTelemetry("game-hub-disconnected");
    handlers.onConnectionStatus("disconnected");
  });
}

function payloadType(payload: unknown): string {
  if (Array.isArray(payload)) {
    return "array";
  }
  return payload === null ? "null" : typeof payload;
}
