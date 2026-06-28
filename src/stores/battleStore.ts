import { create } from "zustand";
import type { BattleQuestion, BattleResult, BattleUiState } from "../domain/battle/battleTypes";

type BattleStore = BattleUiState & {
  beginAttempt: (message?: string) => void;
  receiveQuestion: (question: BattleQuestion) => void;
  failAttempt: (message: string) => void;
  selectAnswer: (answerId: string, actingPlayerId: string | null) => void;
  beginAnswer: () => void;
  endAnswer: () => void;
  expirePending: () => void;
  clearExpiredAttempt: () => void;
  applyResult: (result: BattleResult, now?: Date) => boolean;
  clearResult: () => void;
  clearBlockingError: () => void;
  resetBattle: () => void;
};

const initialState: BattleUiState = {
  question: null,
  selectedAnswerId: null,
  pendingAttempt: false,
  pendingAnswer: false,
  expiredPending: false,
  lastResult: null,
  resultVisibleUntilUtc: null,
  blockingError: null,
  liveMessage: "",
  resolvedAttemptIds: {},
  lastSequence: 0,
};

export const useBattleStore = create<BattleStore>((set, get) => ({
  ...initialState,
  beginAttempt: (message = "Requesting battle question.") =>
    set({ pendingAttempt: true, blockingError: null, liveMessage: message }),
  receiveQuestion: (question) =>
    set((state) => {
      if (question.progress.status !== "Pending") {
        return {};
      }
      if (state.lastResult?.attemptId === question.attemptId) {
        return {};
      }
      return {
        question,
        selectedAnswerId: null,
        pendingAttempt: false,
        pendingAnswer: false,
        expiredPending: false,
        blockingError: null,
        liveMessage: `${question.attemptKind === "Battle" ? "Battle" : "Special field"} question available. ${question.progress.correctAnswers} of ${question.progress.requiredCorrectAnswers} correct.`,
      };
    }),
  failAttempt: (message) =>
    set({
      pendingAttempt: false,
      pendingAnswer: false,
      blockingError: message,
      liveMessage: message,
    }),
  selectAnswer: (answerId, actingPlayerId) =>
    set((state) => {
      if (!state.question || state.question.actingPlayerId !== actingPlayerId || state.pendingAnswer || state.expiredPending) {
        return {};
      }
      return { selectedAnswerId: answerId, liveMessage: "Answer selected. Submit to confirm." };
    }),
  beginAnswer: () => set({ pendingAnswer: true, liveMessage: "Submitting answer." }),
  endAnswer: () => set({ pendingAnswer: false }),
  expirePending: () =>
    set((state) => {
      if (!state.question || state.lastResult) {
        return {};
      }
      return {
        expiredPending: true,
        pendingAnswer: false,
        selectedAnswerId: null,
        liveMessage: "Question expired. Waiting for authoritative result.",
      };
    }),
  clearExpiredAttempt: () =>
    set((state) => {
      if (!state.expiredPending || state.lastResult) {
        return {};
      }
      return {
        question: null,
        selectedAnswerId: null,
        pendingAttempt: false,
        pendingAnswer: false,
        expiredPending: false,
        blockingError: null,
        liveMessage: "Question expired. Turn advanced.",
      };
    }),
  applyResult: (result, now = new Date()) => {
    if (result.sequence !== null && result.sequence < get().lastSequence) {
      return false;
    }
    if (get().resolvedAttemptIds[result.attemptId]) {
      return false;
    }
    const resultVisibleUntilUtc = new Date(now.getTime() + 4000).toISOString();
    set((state) => ({
      question: state.question?.attemptId === result.attemptId ? null : state.question,
      selectedAnswerId: null,
      pendingAttempt: false,
      pendingAnswer: false,
      expiredPending: false,
      lastResult: result,
      resultVisibleUntilUtc,
      blockingError: null,
      resolvedAttemptIds: { ...state.resolvedAttemptIds, [result.attemptId]: true },
      lastSequence: Math.max(state.lastSequence, result.sequence ?? state.lastSequence),
      liveMessage: resultMessage(result),
    }));
    return true;
  },
  clearResult: () => set({ lastResult: null, resultVisibleUntilUtc: null, liveMessage: "" }),
  clearBlockingError: () => set({ blockingError: null }),
  resetBattle: () => set(initialState),
}));

export function resetBattleStoreForTests(): void {
  useBattleStore.getState().resetBattle();
}

export function selectHasPendingBattle(state: BattleUiState): boolean {
  return Boolean(state.pendingAttempt || state.pendingAnswer || state.expiredPending || (state.question && !state.lastResult));
}

function resultMessage(result: BattleResult): string {
  const label = result.attemptKind === "Battle" ? "Battle" : "Special field";
  if (result.status === "Succeeded") {
    return `${label} succeeded.${result.newLevel ? ` Piece reached level ${result.newLevel}.` : ""}`;
  }
  if (result.status === "Expired") {
    return `${label} expired. Turn advanced.`;
  }
  if (result.status === "Cancelled") {
    return `${label} cancelled.`;
  }
  return `${label} failed. Turn advanced.`;
}
