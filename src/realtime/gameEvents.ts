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
  battleAttemptStarted: "BattleStartedEvent",
  battleQuestionIssued: "BattleQuestionIssuedEvent",
  battleProgressUpdated: "BattleProgressUpdatedEvent",
  battleSucceeded: "BattleSucceededEvent",
  battleFailed: "BattleFailedEvent",
  specialFieldAttemptStarted: "SpecialFieldStartedEvent",
  specialFieldQuestionIssued: "SpecialFieldQuestionIssuedEvent",
  specialFieldProgressUpdated: "SpecialFieldProgressUpdatedEvent",
  specialFieldConquered: "SpecialFieldConqueredEvent",
  specialFieldFailed: "SpecialFieldFailedEvent",
  pieceCaptured: "PieceCapturedEvent",
  pieceLeveledUp: "PieceLeveledUpEvent",
  playerForfeited: "PlayerForfeitedEvent",
  gameplayAttemptCancelled: "CancelledGameplayAttemptEvent",
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

export type CancelledGameplayAttemptEventDto = {
  gameSessionId: string;
  attemptId: string;
  kind: string;
  playerId: string;
  cancelledAtUtc: string;
  reason: string;
  sequence?: number;
};

export type PlayerForfeitedEventDto = {
  gameSessionId: string;
  playerId: string;
  userId: string;
  eliminatedAtUtc: string;
  eliminationReason: string;
  disabledPieceIds: string[];
  cancelledAttempt?: CancelledGameplayAttemptEventDto | null;
  sequence?: number;
  session?: GameSessionDto;
};

export function toGameSessionEvent(payload: GameSessionDto): GameSession {
  return mapGameSession(payload);
}

export function toGameActionResultEvent(payload: GameActionResultDto): GameActionResult {
  return mapGameActionResult(payload);
}

export function toGameplayQuestionEvent(payload: GameplayQuestionDto): GameplayQuestion {
  const event = payload as GameplayQuestionDto & { question?: GameplayQuestionDto | null };
  return mapGameplayQuestion(event.question ?? event, {
    gameSessionId: event.gameSessionId,
    playerId: event.playerId,
    pieceId: event.pieceId,
    sourceTileId: event.sourceTileId,
    targetTileId: event.targetTileId,
  });
}

export function toQuestionAttemptEvent(payload: QuestionAttemptEventDto): QuestionAttemptEvent {
  return mapQuestionAttemptEvent(payload);
}

export function toConquestResultEvent(payload: ConquestResultDto): ConquestResult {
  return mapConquestResult(payload);
}

export function toBattleQuestionEvent(payload: BattleQuestionDto): BattleQuestion {
  return mapBattleQuestion(extractBattleQuestionPayload(payload), { attemptKind: "Battle" });
}

export function toSpecialFieldQuestionEvent(payload: BattleQuestionDto): BattleQuestion {
  return mapBattleQuestion(extractBattleQuestionPayload(payload), { attemptKind: "SpecialField" });
}

export function toBattleResultEvent(payload: BattleResultDto): BattleResult {
  return mapBattleResult(payload, { attemptKind: "Battle" });
}

export function toSpecialFieldResultEvent(payload: BattleResultDto): BattleResult {
  return mapBattleResult(payload, { attemptKind: "SpecialField" });
}


function extractBattleQuestionPayload(payload: BattleQuestionDto): BattleQuestionDto {
  const wrapped = (payload as BattleQuestionDto & { question?: BattleQuestionDto | null }).question;
  if (!wrapped) {
    return payload;
  }

  return {
    ...wrapped,
    battleAttemptId: wrapped.battleAttemptId ?? payload.battleAttemptId,
    specialFieldAttemptId: wrapped.specialFieldAttemptId ?? payload.specialFieldAttemptId,
    attemptId: wrapped.attemptId ?? payload.attemptId,
    gameSessionId: wrapped.gameSessionId ?? payload.gameSessionId,
    actingPlayerId: wrapped.actingPlayerId ?? payload.actingPlayerId ?? payload.playerId,
    pieceId: wrapped.pieceId ?? payload.pieceId ?? payload.attackingPieceId,
    sourceTileId: wrapped.sourceTileId ?? payload.sourceTileId,
    targetTileId: wrapped.targetTileId ?? payload.targetTileId,
    categoryId: wrapped.categoryId ?? payload.categoryId,
    categoryName: wrapped.categoryName ?? payload.categoryName,
    expiresAtUtc: wrapped.expiresAtUtc ?? payload.expiresAtUtc,
    correctAnswers: wrapped.correctAnswers ?? payload.correctAnswers,
    requiredCorrectAnswers: wrapped.requiredCorrectAnswers ?? payload.requiredCorrectAnswers,
  };
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
  const event = payload as GameplayQuestionDto & { question?: GameplayQuestionDto | null };
  const question = event?.question ?? event;
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof question?.questionAttemptId === "string" &&
    typeof question.questionId === "string" &&
    Array.isArray(question.answerOptions)
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
    ((typeof (payload as BattleQuestionDto).questionAttemptId === "string" &&
      Array.isArray((payload as BattleQuestionDto).answerOptions)) ||
      Array.isArray((payload as { question?: BattleQuestionDto }).question?.answerOptions))
  );
}

export function isSpecialFieldQuestionEvent(payload: unknown): payload is BattleQuestionDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as BattleQuestionDto).specialFieldAttemptId === "string" &&
    ((typeof (payload as BattleQuestionDto).questionAttemptId === "string" &&
      Array.isArray((payload as BattleQuestionDto).answerOptions)) ||
      Array.isArray((payload as { question?: BattleQuestionDto }).question?.answerOptions))
  );
}

export function isBattleResultEvent(payload: unknown): payload is BattleResultDto {
  const result = payload as BattleResultDto;
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof result.battleAttemptId === "string" &&
    !Array.isArray((payload as BattleQuestionDto).answerOptions) &&
    !isBattleAttemptLifecycleEvent(payload) &&
    (isResolvedBattleStatus(result.resultStatus ?? result.status) || isFailedBattleResultShape(result))
  );
}

export function isSpecialFieldResultEvent(payload: unknown): payload is BattleResultDto {
  const result = payload as BattleResultDto;
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof result.specialFieldAttemptId === "string" &&
    !Array.isArray((payload as BattleQuestionDto).answerOptions) &&
    !isBattleAttemptLifecycleEvent(payload) &&
    (isResolvedBattleStatus(result.resultStatus ?? result.status) || isFailedBattleResultShape(result))
  );
}

export function isBattleAttemptLifecycleEvent(payload: unknown): boolean {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const event = payload as BattleQuestionDto;
  return (
    (typeof event.battleAttemptId === "string" || typeof event.specialFieldAttemptId === "string") &&
    typeof event.correctAnswers === "number" &&
    typeof event.requiredCorrectAnswers === "number" &&
    !Array.isArray(event.answerOptions)
  );
}

function isResolvedBattleStatus(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  return ["succeeded", "success", "conquered", "failed", "failure", "expired", "cancelled", "canceled"].includes(
    value.toLowerCase(),
  );
}

function isFailedBattleResultShape(result: BattleResultDto): boolean {
  return (
    typeof result.reason === "string" &&
    (typeof result.pieceId === "string" || typeof result.attackingPieceId === "string") &&
    typeof result.sourceTileId === "string" &&
    typeof result.targetTileId === "string"
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

export function isCancelledGameplayAttemptEvent(payload: unknown): payload is CancelledGameplayAttemptEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as CancelledGameplayAttemptEventDto).gameSessionId === "string" &&
    typeof (payload as CancelledGameplayAttemptEventDto).attemptId === "string" &&
    typeof (payload as CancelledGameplayAttemptEventDto).kind === "string" &&
    typeof (payload as CancelledGameplayAttemptEventDto).playerId === "string"
  );
}

export function isPlayerForfeitedEvent(payload: unknown): payload is PlayerForfeitedEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as PlayerForfeitedEventDto).gameSessionId === "string" &&
    typeof (payload as PlayerForfeitedEventDto).playerId === "string" &&
    typeof (payload as PlayerForfeitedEventDto).userId === "string" &&
    typeof (payload as PlayerForfeitedEventDto).eliminationReason === "string" &&
    Array.isArray((payload as PlayerForfeitedEventDto).disabledPieceIds)
  );
}

