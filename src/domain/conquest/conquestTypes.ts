import type { GameSession } from "../game/gameTypes";

export type QuestionAttemptStatus = "Pending" | "Succeeded" | "Failed" | "Expired" | "Cancelled";
export type ResolvedQuestionAttemptStatus = Exclude<QuestionAttemptStatus, "Pending">;

export type GameplayAnswerOption = {
  id: string;
  text: string;
};

export type GameplayQuestion = {
  questionAttemptId: string;
  questionId: string;
  gameSessionId: string;
  playerId: string;
  pieceId: string;
  sourceTileId: string;
  targetTileId: string;
  categoryId: string;
  categoryName: string | null;
  questionText: string;
  answerOptions: GameplayAnswerOption[];
  expiresAtUtc: string | null;
};

export type ConquestResult = {
  questionAttemptId: string;
  gameSessionId: string;
  resultStatus: ResolvedQuestionAttemptStatus;
  isCorrect: boolean;
  pieceId: string;
  sourceTileId: string;
  targetTileId: string;
  currentTileId: string;
  ownerPlayerId: string | null;
  nextTurnPlayerId: string | null;
  turnNumber: number;
  session: GameSession | null;
};

export type QuestionAttemptEvent = {
  questionAttemptId: string;
  gameSessionId: string;
  playerId: string;
  pieceId: string;
  sourceTileId: string;
  targetTileId: string;
  status: QuestionAttemptStatus;
  expiresAtUtc: string | null;
  question: GameplayQuestion | null;
};

export type ConquestUiState = {
  question: GameplayQuestion | null;
  selectedAnswerId: string | null;
  pendingAttempt: boolean;
  pendingAnswer: boolean;
  expiredPending: boolean;
  lastResult: ConquestResult | null;
  resultVisibleUntilUtc: string | null;
  blockingError: string | null;
  liveMessage: string;
  resolvedAttemptIds: Record<string, true>;
};

export type StartConquestAttemptRequest = {
  pieceId: string;
  targetX: number;
  targetY: number;
};

export type SubmitConquestAnswerRequest = {
  answerId: string;
};
