import { create } from "zustand";
import type { ConquestResult, ConquestUiState, GameplayQuestion, QuestionAttemptEvent } from "../domain/conquest/conquestTypes";

type ConquestStore = ConquestUiState & {
  beginAttempt: () => void;
  receiveQuestion: (question: GameplayQuestion) => void;
  receiveAttemptEvent: (event: QuestionAttemptEvent) => void;
  failAttempt: (message: string) => void;
  selectAnswer: (answerId: string, actingPlayerId: string | null) => void;
  beginAnswer: () => void;
  endAnswer: () => void;
  expirePending: () => void;
  clearExpiredAttempt: () => void;
  applyResult: (result: ConquestResult, now?: Date) => boolean;
  clearResult: () => void;
  clearBlockingError: () => void;
  resetConquest: () => void;
};

const initialState: ConquestUiState = {
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
};

export const useConquestStore = create<ConquestStore>((set, get) => ({
  ...initialState,
  beginAttempt: () =>
    set({
      pendingAttempt: true,
      blockingError: null,
      liveMessage: "Requesting conquest question.",
    }),
  receiveQuestion: (question) =>
    set({
      question,
      selectedAnswerId: null,
      pendingAttempt: false,
      pendingAnswer: false,
      expiredPending: false,
      blockingError: null,
      liveMessage: "Conquest question available.",
    }),
  receiveAttemptEvent: (event) => {
    if (event.question) {
      get().receiveQuestion(event.question);
      return;
    }
    if (event.status === "Pending") {
      set({ pendingAttempt: false, liveMessage: "Conquest attempt pending." });
    }
  },
  failAttempt: (message) =>
    set({
      pendingAttempt: false,
      pendingAnswer: false,
      blockingError: message,
      liveMessage: message,
    }),
  selectAnswer: (answerId, actingPlayerId) =>
    set((state) => {
      if (!state.question || state.question.playerId !== actingPlayerId || state.pendingAnswer || state.expiredPending) {
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
    if (get().resolvedAttemptIds[result.questionAttemptId]) {
      return false;
    }
    const resultVisibleUntilUtc = new Date(now.getTime() + 3000).toISOString();
    set((state) => ({
      question: state.question?.questionAttemptId === result.questionAttemptId ? state.question : null,
      selectedAnswerId: null,
      pendingAttempt: false,
      pendingAnswer: false,
      expiredPending: false,
      lastResult: result,
      resultVisibleUntilUtc,
      blockingError: null,
      resolvedAttemptIds: { ...state.resolvedAttemptIds, [result.questionAttemptId]: true },
      liveMessage: resultMessage(result),
    }));
    return true;
  },
  clearResult: () => set({ question: null, lastResult: null, resultVisibleUntilUtc: null, liveMessage: "" }),
  clearBlockingError: () => set({ blockingError: null }),
  resetConquest: () => set(initialState),
}));

export function resetConquestStoreForTests(): void {
  useConquestStore.getState().resetConquest();
}

export function selectHasPendingConquest(state: ConquestUiState): boolean {
  return Boolean(state.pendingAttempt || state.pendingAnswer || state.expiredPending || (state.question && !state.lastResult));
}

function resultMessage(result: ConquestResult): string {
  if (result.resultStatus === "Succeeded" || result.isCorrect) {
    return "Correct answer. Territory conquered.";
  }
  if (result.resultStatus === "Expired") {
    return "Question expired. Conquest failed.";
  }
  if (result.resultStatus === "Cancelled") {
    return "Conquest attempt cancelled.";
  }
  return "Incorrect answer. Conquest failed.";
}

