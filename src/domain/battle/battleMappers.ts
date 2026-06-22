import { mapGameSession, type GameSessionDto } from "../game/gameMappers";
import type {
  BattleAnswerOption,
  BattleAttemptKind,
  BattleAttemptStatus,
  BattleProgress,
  BattleQuestion,
  BattleResult,
  ResolvedBattleAttemptStatus,
} from "./battleTypes";

export type BattleAnswerOptionDto = {
  id?: string;
  answerId?: string;
  text?: string;
  isCorrect?: unknown;
  correct?: unknown;
  answerKey?: unknown;
  score?: unknown;
  [key: string]: unknown;
};

export type BattleProgressDto = {
  requiredCorrectAnswers?: number;
  correctAnswers?: number;
  status?: BattleAttemptStatus | string;
};

export type BattleQuestionDto = {
  battleAttemptId?: string;
  specialFieldAttemptId?: string;
  attemptId?: string;
  questionAttemptId?: string;
  questionId?: string;
  gameSessionId?: string;
  actingPlayerId?: string;
  playerId?: string;
  pieceId?: string;
  attackingPieceId?: string;
  sourceTileId?: string;
  targetTileId?: string;
  categoryId?: string;
  categoryName?: string | null;
  questionText?: string;
  answerOptions?: BattleAnswerOptionDto[];
  expiresAtUtc?: string | null;
  progress?: BattleProgressDto;
  requiredCorrectAnswers?: number;
  correctAnswers?: number;
};

export type BattleResultDto = {
  battleAttemptId?: string;
  specialFieldAttemptId?: string;
  attemptId?: string;
  attemptKind?: BattleAttemptKind | string;
  gameSessionId?: string;
  status?: BattleAttemptStatus | string;
  resultStatus?: BattleAttemptStatus | string;
  correctAnswers?: number;
  requiredCorrectAnswers?: number;
  nextQuestion?: BattleQuestionDto | null;
  reason?: string | null;
  movedPieceId?: string;
  pieceId?: string;
  capturedPieceId?: string;
  defendingPieceId?: string;
  leveledPieceId?: string;
  newLevel?: number;
  sourceTileId?: string;
  fromTileId?: string;
  targetTileId?: string;
  toTileId?: string;
  targetOwnerPlayerId?: string | null;
  ownerPlayerId?: string | null;
  nextTurnPlayerId?: string | null;
  turnNumber?: number;
  sequence?: number;
  session?: GameSessionDto | null;
};

export type BattleQuestionFallback = {
  attemptKind: BattleAttemptKind;
  gameSessionId?: string;
  actingPlayerId?: string;
  pieceId?: string;
  sourceTileId?: string;
  targetTileId?: string;
};

export type BattleResultFallback = BattleQuestionFallback & {
  attemptId?: string;
};

const attemptStatuses = new Set<BattleAttemptStatus>(["Pending", "Succeeded", "Failed", "Expired", "Cancelled"]);
const resolvedStatuses = new Set<BattleAttemptStatus>(["Succeeded", "Failed", "Expired", "Cancelled"]);

export function mapBattleQuestion(dto: BattleQuestionDto, fallback: BattleQuestionFallback): BattleQuestion {
  const attemptKind = fallback.attemptKind;
  const attemptId = requiredString(
    attemptKind === "Battle" ? dto.battleAttemptId ?? dto.attemptId : dto.specialFieldAttemptId ?? dto.attemptId,
    "attemptId",
  );
  const answerOptions = dto.answerOptions;
  if (!Array.isArray(answerOptions) || answerOptions.length < 2) {
    throw new Error("Battle question response must include answer options.");
  }

  return {
    attemptKind,
    attemptId,
    questionAttemptId: requiredString(dto.questionAttemptId, "questionAttemptId"),
    questionId: requiredString(dto.questionId, "questionId"),
    gameSessionId: requiredString(dto.gameSessionId ?? fallback.gameSessionId, "gameSessionId"),
    actingPlayerId: requiredString(dto.actingPlayerId ?? dto.playerId ?? fallback.actingPlayerId, "actingPlayerId"),
    pieceId: requiredString(dto.pieceId ?? dto.attackingPieceId ?? fallback.pieceId, "pieceId"),
    sourceTileId: requiredString(dto.sourceTileId ?? fallback.sourceTileId, "sourceTileId"),
    targetTileId: requiredString(dto.targetTileId ?? fallback.targetTileId, "targetTileId"),
    categoryId: requiredString(dto.categoryId, "categoryId"),
    categoryName: dto.categoryName ?? null,
    questionText: requiredString(dto.questionText, "questionText"),
    answerOptions: answerOptions.map(mapBattleAnswerOption),
    expiresAtUtc: dto.expiresAtUtc ?? null,
    progress: mapBattleProgress(dto.progress, dto),
  };
}

export function mapBattleAnswerOption(dto: BattleAnswerOptionDto): BattleAnswerOption {
  if ("isCorrect" in dto || "correct" in dto || "score" in dto || "answerKey" in dto) {
    throw new Error("Battle question response exposes answer correctness.");
  }
  return {
    id: requiredString(dto.id ?? dto.answerId, "answer option id"),
    text: requiredString(dto.text, "answer option text"),
  };
}

export function mapBattleProgress(progress: BattleProgressDto | undefined, fallback: BattleQuestionDto): BattleProgress {
  const status = normalizeStatus(progress?.status ?? fallback.progress?.status ?? "Pending");
  if (!attemptStatuses.has(status)) {
    throw new Error("Battle question response has unsupported progress status.");
  }
  const requiredCorrectAnswers = progress?.requiredCorrectAnswers ?? fallback.requiredCorrectAnswers;
  const correctAnswers = progress?.correctAnswers ?? fallback.correctAnswers ?? 0;
  if (
    typeof requiredCorrectAnswers !== "number" ||
    !Number.isInteger(requiredCorrectAnswers) ||
    requiredCorrectAnswers < 1 ||
    !Number.isInteger(correctAnswers) ||
    correctAnswers < 0
  ) {
    throw new Error("Battle question response has invalid progress.");
  }
  return { requiredCorrectAnswers, correctAnswers, status };
}

export function mapBattleResult(dto: BattleResultDto, fallback: BattleResultFallback): BattleResult {
  const attemptKind = fallback.attemptKind;
  const status = normalizeStatus(dto.resultStatus ?? dto.status);
  if (!resolvedStatuses.has(status)) {
    throw new Error("Battle result response must be resolved.");
  }
  return {
    attemptKind,
    attemptId: requiredString(
      dto.battleAttemptId ?? dto.specialFieldAttemptId ?? dto.attemptId ?? fallback.attemptId,
      "attemptId",
    ),
    gameSessionId: requiredString(dto.gameSessionId ?? dto.session?.id ?? dto.session?.sessionId ?? fallback.gameSessionId, "gameSessionId"),
    status: status as ResolvedBattleAttemptStatus,
    reason: dto.reason ?? null,
    movedPieceId: dto.movedPieceId ?? dto.pieceId ?? fallback.pieceId ?? null,
    capturedPieceId: dto.capturedPieceId ?? dto.defendingPieceId ?? null,
    leveledPieceId: dto.leveledPieceId ?? null,
    newLevel: typeof dto.newLevel === "number" ? dto.newLevel : null,
    sourceTileId: dto.sourceTileId ?? dto.fromTileId ?? fallback.sourceTileId ?? null,
    targetTileId: dto.targetTileId ?? dto.toTileId ?? fallback.targetTileId ?? null,
    targetOwnerPlayerId: dto.targetOwnerPlayerId ?? dto.ownerPlayerId ?? null,
    nextTurnPlayerId: dto.nextTurnPlayerId ?? null,
    turnNumber: typeof dto.turnNumber === "number" ? dto.turnNumber : null,
    sequence: typeof dto.sequence === "number" ? dto.sequence : null,
    session: dto.session ? mapGameSession(dto.session) : null,
  };
}

function normalizeStatus(value: unknown): BattleAttemptStatus {
  if (typeof value !== "string") {
    return "Pending";
  }
  const lower = value.toLowerCase();
  if (lower === "succeeded" || lower === "success" || lower === "conquered") {
    return "Succeeded";
  }
  if (lower === "failed" || lower === "failure") {
    return "Failed";
  }
  if (lower === "expired") {
    return "Expired";
  }
  if (lower === "cancelled" || lower === "canceled") {
    return "Cancelled";
  }
  return "Pending";
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Battle gameplay response is missing ${field}.`);
  }
  return value;
}
