import { mapGameActionResult, mapGameSession, type GameActionResultDto, type GameSessionDto } from "../domain/game/gameMappers";
import type { GameActionResult, GameSession } from "../domain/game/gameTypes";
import {
  mapConquestResult,
  mapGameplayQuestion,
  mapQuestionAttemptEvent,
  type ConquestResultDto,
  type GameplayQuestionDto,
  type QuestionAttemptEventDto,
} from "../domain/conquest/conquestMappers";
import type { ConquestResult, GameplayQuestion, QuestionAttemptEvent } from "../domain/conquest/conquestTypes";
import { mapBattleQuestion, mapBattleResult, type BattleQuestionDto, type BattleResultDto } from "../domain/battle/battleMappers";
import type { BattleQuestion, BattleResult } from "../domain/battle/battleTypes";

export const gameEventNames = {
  sessionCreated: "GameSessionCreatedEvent",
  started: "GameStartedEvent",
  moveExecuted: "GameMoveExecutedEvent",
  tileOwnershipChanged: "GameTileOwnershipChangedEvent",
  turnAdvanced: "GameTurnAdvancedEvent",
  completed: "GameCompletedEvent",
  cancelled: "GameCancelledEvent",
  conquestAttemptStarted: "GameConquestAttemptStartedEvent",
  questionIssued: "GameQuestionIssuedEvent",
  answerSubmitted: "GameAnswerSubmittedEvent",
  conquestSucceeded: "GameConquestSucceededEvent",
  conquestFailed: "GameConquestFailedEvent",
  conquestExpired: "GameConquestExpiredEvent",
  battleAttemptStarted: "BattleAttemptStartedEvent",
  battleQuestionIssued: "BattleQuestionIssuedEvent",
  battleProgressUpdated: "BattleProgressUpdatedEvent",
  battleSucceeded: "BattleSucceededEvent",
  battleFailed: "BattleFailedEvent",
  specialFieldAttemptStarted: "SpecialFieldAttemptStartedEvent",
  specialFieldQuestionIssued: "SpecialFieldQuestionIssuedEvent",
  specialFieldProgressUpdated: "SpecialFieldProgressUpdatedEvent",
  specialFieldConquered: "SpecialFieldConqueredEvent",
  specialFieldFailed: "SpecialFieldFailedEvent",
  pieceCaptured: "PieceCapturedEvent",
  pieceLeveledUp: "PieceLeveledUpEvent",
  snapshotRequired: "GameSnapshotRequiredEvent",
} as const;

export type GameMoveExecutedEventDto = {
  gameSessionId: string;
  actingPlayerId: string;
  pieceId: string;
  fromTileId: string;
  toTileId: string;
  turnNumber: number;
  session?: GameSessionDto;
  turn?: GameActionResultDto["turn"];
};

export type GameTileOwnershipChangedEventDto = {
  gameSessionId: string;
  tileId: string;
  ownerPlayerId: string | null;
  session?: GameSessionDto;
};

export type GameTurnAdvancedEventDto = {
  gameSessionId: string;
  currentTurnPlayerId: string | null;
  turnNumber: number;
  reason?: string;
  session?: GameSessionDto;
  turn?: GameActionResultDto["turn"];
};

export type PieceCapturedEventDto = {
  gameSessionId: string;
  sequence?: number;
  pieceId: string;
  removedFromTileId?: string | null;
  capturedAtUtc?: string;
  capturedByPieceId?: string;
};

export type PieceLeveledUpEventDto = {
  gameSessionId: string;
  sequence?: number;
  pieceId: string;
  newLevel: number;
};

export type GameSnapshotRequiredEventDto = {
  gameSessionId: string;
  sequence?: number;
  reason?: string;
};

export function toGameSessionEvent(payload: GameSessionDto): GameSession {
  return mapGameSession(payload);
}

export function toGameActionResultEvent(payload: GameActionResultDto): GameActionResult {
  return mapGameActionResult(payload);
}

export function toGameplayQuestionEvent(payload: GameplayQuestionDto): GameplayQuestion {
  return mapGameplayQuestion(payload);
}

export function toQuestionAttemptEvent(payload: QuestionAttemptEventDto): QuestionAttemptEvent {
  return mapQuestionAttemptEvent(payload);
}

export function toConquestResultEvent(payload: ConquestResultDto): ConquestResult {
  return mapConquestResult(payload);
}

export function toBattleQuestionEvent(payload: BattleQuestionDto): BattleQuestion {
  return mapBattleQuestion(payload, { attemptKind: "Battle" });
}

export function toSpecialFieldQuestionEvent(payload: BattleQuestionDto): BattleQuestion {
  return mapBattleQuestion(payload, { attemptKind: "SpecialField" });
}

export function toBattleResultEvent(payload: BattleResultDto): BattleResult {
  return mapBattleResult(payload, { attemptKind: "Battle" });
}

export function toSpecialFieldResultEvent(payload: BattleResultDto): BattleResult {
  return mapBattleResult(payload, { attemptKind: "SpecialField" });
}

export function isGameActionResult(payload: unknown): payload is GameActionResultDto {
  return typeof payload === "object" && payload !== null && "session" in payload && "turn" in payload;
}

export function isGameSession(payload: unknown): payload is GameSessionDto {
  return typeof payload === "object" && payload !== null && "tiles" in payload && "pieces" in payload && "players" in payload;
}

export function isGameMoveExecutedEvent(payload: unknown): payload is GameMoveExecutedEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as GameMoveExecutedEventDto).gameSessionId === "string" &&
    typeof (payload as GameMoveExecutedEventDto).pieceId === "string" &&
    typeof (payload as GameMoveExecutedEventDto).fromTileId === "string" &&
    typeof (payload as GameMoveExecutedEventDto).toTileId === "string" &&
    typeof (payload as GameMoveExecutedEventDto).turnNumber === "number"
  );
}

export function isGameTileOwnershipChangedEvent(payload: unknown): payload is GameTileOwnershipChangedEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as GameTileOwnershipChangedEventDto).gameSessionId === "string" &&
    typeof (payload as GameTileOwnershipChangedEventDto).tileId === "string"
  );
}

export function isGameTurnAdvancedEvent(payload: unknown): payload is GameTurnAdvancedEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as GameTurnAdvancedEventDto).gameSessionId === "string" &&
    typeof (payload as GameTurnAdvancedEventDto).turnNumber === "number"
  );
}

export function isGameplayQuestionEvent(payload: unknown): payload is GameplayQuestionDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as GameplayQuestionDto).questionAttemptId === "string" &&
    typeof (payload as GameplayQuestionDto).questionId === "string" &&
    Array.isArray((payload as GameplayQuestionDto).answerOptions)
  );
}

export function isQuestionAttemptEvent(payload: unknown): payload is QuestionAttemptEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as QuestionAttemptEventDto).questionAttemptId === "string" &&
    typeof (payload as QuestionAttemptEventDto).status === "string" &&
    typeof (payload as QuestionAttemptEventDto).pieceId === "string" &&
    typeof (payload as QuestionAttemptEventDto).sourceTileId === "string" &&
    typeof (payload as QuestionAttemptEventDto).targetTileId === "string" &&
    !("resultStatus" in payload)
  );
}

export function isConquestResultEvent(payload: unknown): payload is ConquestResultDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    !Array.isArray((payload as GameplayQuestionDto).answerOptions) &&
    typeof (payload as ConquestResultDto).questionAttemptId === "string" &&
    typeof (payload as ConquestResultDto).turnNumber === "number" &&
    (
      typeof (payload as ConquestResultDto).resultStatus === "string" ||
      typeof (payload as ConquestResultDto).toTileId === "string" ||
      typeof (payload as ConquestResultDto).targetTileId === "string"
    )
  );
}

export function isBattleQuestionEvent(payload: unknown): payload is BattleQuestionDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as BattleQuestionDto).battleAttemptId === "string" &&
    typeof (payload as BattleQuestionDto).questionAttemptId === "string" &&
    Array.isArray((payload as BattleQuestionDto).answerOptions)
  );
}

export function isSpecialFieldQuestionEvent(payload: unknown): payload is BattleQuestionDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as BattleQuestionDto).specialFieldAttemptId === "string" &&
    typeof (payload as BattleQuestionDto).questionAttemptId === "string" &&
    Array.isArray((payload as BattleQuestionDto).answerOptions)
  );
}

export function isBattleResultEvent(payload: unknown): payload is BattleResultDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as BattleResultDto).battleAttemptId === "string" &&
    !Array.isArray((payload as BattleQuestionDto).answerOptions) &&
    (typeof (payload as BattleResultDto).status === "string" || typeof (payload as BattleResultDto).resultStatus === "string")
  );
}

export function isSpecialFieldResultEvent(payload: unknown): payload is BattleResultDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as BattleResultDto).specialFieldAttemptId === "string" &&
    !Array.isArray((payload as BattleQuestionDto).answerOptions) &&
    (typeof (payload as BattleResultDto).status === "string" || typeof (payload as BattleResultDto).resultStatus === "string")
  );
}

export function isPieceCapturedEvent(payload: unknown): payload is PieceCapturedEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as PieceCapturedEventDto).gameSessionId === "string" &&
    typeof (payload as PieceCapturedEventDto).pieceId === "string" &&
    ("removedFromTileId" in payload || "capturedAtUtc" in payload || "capturedByPieceId" in payload)
  );
}

export function isPieceLeveledUpEvent(payload: unknown): payload is PieceLeveledUpEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as PieceLeveledUpEventDto).gameSessionId === "string" &&
    typeof (payload as PieceLeveledUpEventDto).pieceId === "string" &&
    typeof (payload as PieceLeveledUpEventDto).newLevel === "number"
  );
}

export function isGameSnapshotRequiredEvent(payload: unknown): payload is GameSnapshotRequiredEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as GameSnapshotRequiredEventDto).gameSessionId === "string" &&
    !("turnNumber" in payload) &&
    !("pieceId" in payload) &&
    !("tileId" in payload) &&
    ("reason" in payload || "minimumSequence" in payload)
  );
}
