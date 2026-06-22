import type { GameSession } from "../game/gameTypes";

export type BattleAttemptKind = "Battle" | "SpecialField";
export type BattleAttemptStatus = "Pending" | "Succeeded" | "Failed" | "Expired" | "Cancelled";
export type ResolvedBattleAttemptStatus = Exclude<BattleAttemptStatus, "Pending">;

export type BattleAnswerOption = {
  id: string;
  text: string;
};

export type BattleProgress = {
  requiredCorrectAnswers: number;
  correctAnswers: number;
  status: BattleAttemptStatus;
};

export type BattleQuestion = {
  attemptKind: BattleAttemptKind;
  attemptId: string;
  questionAttemptId: string;
  questionId: string;
  gameSessionId: string;
  actingPlayerId: string;
  pieceId: string;
  sourceTileId: string;
  targetTileId: string;
  categoryId: string;
  categoryName: string | null;
  questionText: string;
  answerOptions: BattleAnswerOption[];
  expiresAtUtc: string | null;
  progress: BattleProgress;
};

export type BattleResult = {
  attemptKind: BattleAttemptKind;
  attemptId: string;
  gameSessionId: string;
  status: ResolvedBattleAttemptStatus;
  reason: string | null;
  movedPieceId: string | null;
  capturedPieceId: string | null;
  leveledPieceId: string | null;
  newLevel: number | null;
  sourceTileId: string | null;
  targetTileId: string | null;
  targetOwnerPlayerId: string | null;
  nextTurnPlayerId: string | null;
  turnNumber: number | null;
  sequence: number | null;
  session: GameSession | null;
};

export type BattleUiState = {
  question: BattleQuestion | null;
  selectedAnswerId: string | null;
  pendingAttempt: boolean;
  pendingAnswer: boolean;
  expiredPending: boolean;
  lastResult: BattleResult | null;
  resultVisibleUntilUtc: string | null;
  blockingError: string | null;
  liveMessage: string;
  resolvedAttemptIds: Record<string, true>;
  lastSequence: number;
};

export type StartBattleAttemptRequest = {
  attackingPieceId: string;
  targetTileId: string;
};

export type StartSpecialFieldAttemptRequest = {
  pieceId: string;
  targetTileId: string;
};

export type SubmitBattleAnswerRequest = {
  questionAttemptId: string;
  answerId: string;
};
