import { mapGameSession, type GameSessionDto } from "../game/gameMappers";
import type {
  ConquestResult,
  GameplayAnswerOption,
  GameplayQuestion,
  QuestionAttemptEvent,
  QuestionAttemptStatus,
  ResolvedQuestionAttemptStatus,
} from "./conquestTypes";

export type GameplayAnswerOptionDto = {
  id?: string;
  text?: string;
  isCorrect?: unknown;
  correct?: unknown;
  score?: unknown;
  answerKey?: unknown;
  [key: string]: unknown;
};

export type GameplayQuestionDto = {
  questionAttemptId?: string;
  questionId?: string;
  gameSessionId?: string;
  playerId?: string;
  pieceId?: string;
  sourceTileId?: string;
  targetTileId?: string;
  categoryId?: string;
  categoryName?: string | null;
  questionText?: string;
  answerOptions?: GameplayAnswerOptionDto[];
  expiresAtUtc?: string | null;
};

export type QuestionAttemptEventDto = {
  questionAttemptId?: string;
  gameSessionId?: string;
  playerId?: string;
  pieceId?: string;
  sourceTileId?: string;
  targetTileId?: string;
  status?: QuestionAttemptStatus;
  expiresAtUtc?: string | null;
  question?: GameplayQuestionDto | null;
};

export type ConquestResultDto = {
  questionAttemptId?: string;
  gameSessionId?: string;
  resultStatus?: QuestionAttemptStatus;
  isCorrect?: boolean;
  pieceId?: string;
  sourceTileId?: string;
  targetTileId?: string;
  currentTileId?: string;
  ownerPlayerId?: string | null;
  nextTurnPlayerId?: string | null;
  turnNumber?: number;
  session?: GameSessionDto | null;
};

const attemptStatuses = new Set<QuestionAttemptStatus>(["Pending", "Succeeded", "Failed", "Expired", "Cancelled"]);
const resolvedStatuses = new Set<QuestionAttemptStatus>(["Succeeded", "Failed", "Expired", "Cancelled"]);

export function mapGameplayQuestion(dto: GameplayQuestionDto): GameplayQuestion {
  const questionAttemptId = requiredString(dto.questionAttemptId, "questionAttemptId");
  const answerOptions = dto.answerOptions;
  if (!Array.isArray(answerOptions) || answerOptions.length !== 4) {
    throw new Error("Gameplay question response must include exactly four answer options.");
  }

  return {
    questionAttemptId,
    questionId: requiredString(dto.questionId, "questionId"),
    gameSessionId: requiredString(dto.gameSessionId, "gameSessionId"),
    playerId: requiredString(dto.playerId, "playerId"),
    pieceId: requiredString(dto.pieceId, "pieceId"),
    sourceTileId: requiredString(dto.sourceTileId, "sourceTileId"),
    targetTileId: requiredString(dto.targetTileId, "targetTileId"),
    categoryId: requiredString(dto.categoryId, "categoryId"),
    categoryName: dto.categoryName ?? null,
    questionText: requiredString(dto.questionText, "questionText"),
    answerOptions: answerOptions.map(mapGameplayAnswerOption),
    expiresAtUtc: dto.expiresAtUtc ?? null,
  };
}

export function mapGameplayAnswerOption(dto: GameplayAnswerOptionDto): GameplayAnswerOption {
  if ("isCorrect" in dto || "correct" in dto || "score" in dto || "answerKey" in dto) {
    throw new Error("Gameplay question response exposes answer correctness.");
  }

  return {
    id: requiredString(dto.id, "answer option id"),
    text: requiredString(dto.text, "answer option text"),
  };
}

export function mapQuestionAttemptEvent(dto: QuestionAttemptEventDto): QuestionAttemptEvent {
  const status = dto.status;
  if (!status || !attemptStatuses.has(status)) {
    throw new Error("Question attempt event has an unsupported status.");
  }

  return {
    questionAttemptId: requiredString(dto.questionAttemptId, "questionAttemptId"),
    gameSessionId: requiredString(dto.gameSessionId, "gameSessionId"),
    playerId: requiredString(dto.playerId, "playerId"),
    pieceId: requiredString(dto.pieceId, "pieceId"),
    sourceTileId: requiredString(dto.sourceTileId, "sourceTileId"),
    targetTileId: requiredString(dto.targetTileId, "targetTileId"),
    status,
    expiresAtUtc: dto.expiresAtUtc ?? null,
    question: dto.question ? mapGameplayQuestion(dto.question) : null,
  };
}

export function mapConquestResult(dto: ConquestResultDto): ConquestResult {
  const resultStatus = dto.resultStatus;
  if (!resultStatus || !resolvedStatuses.has(resultStatus)) {
    throw new Error("Conquest result response must be resolved.");
  }
  if (typeof dto.turnNumber !== "number" || dto.turnNumber < 0) {
    throw new Error("Conquest result response has an invalid turn number.");
  }

  return {
    questionAttemptId: requiredString(dto.questionAttemptId, "questionAttemptId"),
    gameSessionId: requiredString(dto.gameSessionId ?? dto.session?.id ?? dto.session?.sessionId, "gameSessionId"),
    resultStatus: resultStatus as ResolvedQuestionAttemptStatus,
    isCorrect: Boolean(dto.isCorrect),
    pieceId: requiredString(dto.pieceId, "pieceId"),
    sourceTileId: requiredString(dto.sourceTileId, "sourceTileId"),
    targetTileId: requiredString(dto.targetTileId, "targetTileId"),
    currentTileId: requiredString(dto.currentTileId, "currentTileId"),
    ownerPlayerId: dto.ownerPlayerId ?? null,
    nextTurnPlayerId: dto.nextTurnPlayerId ?? null,
    turnNumber: dto.turnNumber,
    session: dto.session ? mapGameSession(dto.session) : null,
  };
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Gameplay conquest response is missing ${field}.`);
  }
  return value;
}

