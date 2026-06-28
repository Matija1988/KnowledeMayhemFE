import { useCallback, useEffect } from "react";
import { normalizeConquestError, startConquestAttempt, submitConquestAnswer } from "../../api/conquestApi";
import { HttpError } from "../../api/httpClient";
import type { BoardCoordinate, GameSession } from "../../domain/game/gameTypes";
import { validateConquestTarget } from "../../domain/conquest/conquestRules";
import type { ConquestResult, GameplayQuestion, QuestionAttemptEvent } from "../../domain/conquest/conquestTypes";
import { useConquestStore } from "../../stores/conquestStore";
import { useErrorStore } from "../../stores/errorStore";
import { useGameStore } from "../../stores/gameStore";
import { useLoadingStore } from "../../stores/loadingStore";

type UseConquestActionsOptions = {
  session: GameSession | null;
  accessToken: string | null;
  currentPlayerId: string | null;
  currentUserId: string | null;
  selectedPieceId: string | null;
  reload?: () => Promise<void>;
};

export function useConquestActions({
  session,
  accessToken,
  currentPlayerId,
  currentUserId,
  selectedPieceId,
  reload,
}: UseConquestActionsOptions) {
  const showError = useErrorStore((state) => state.showError);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const beginOperation = useGameStore((state) => state.beginOperation);
  const endOperation = useGameStore((state) => state.endOperation);
  const selectPiece = useGameStore((state) => state.selectPiece);
  const applyConquestResultToGame = useGameStore((state) => state.applyConquestResult);
  const requestSnapshotRefresh = useGameStore((state) => state.requestSnapshotRefresh);

  const conquestState = useConquestStore();
  const question = useConquestStore((state) => state.question);
  const selectedAnswerId = useConquestStore((state) => state.selectedAnswerId);
  const pendingAnswer = useConquestStore((state) => state.pendingAnswer);
  const expiredPending = useConquestStore((state) => state.expiredPending);
  const resultVisibleUntilUtc = useConquestStore((state) => state.resultVisibleUntilUtc);

  const applyConquestResult = useCallback(
    (result: ConquestResult) => {
      const isNewResult = useConquestStore.getState().applyResult(result);
      if (!isNewResult) {
        return;
      }
      const applied = applyConquestResultToGame(result);
      if (!applied) {
        requestSnapshotRefresh("Refreshing game state after conquest result.");
        void reload?.();
      }
    },
    [applyConquestResultToGame, reload, requestSnapshotRefresh],
  );

  const receiveQuestion = useCallback((nextQuestion: GameplayQuestion) => {
    useConquestStore.getState().receiveQuestion(nextQuestion);
  }, []);

  const receiveAttempt = useCallback((event: QuestionAttemptEvent) => {
    useConquestStore.getState().receiveAttemptEvent(event);
  }, []);

  const startAttempt = useCallback(
    async (target: BoardCoordinate) => {
      const latestConquestState = useConquestStore.getState();
      const validation = validateConquestTarget(
        session,
        currentUserId,
        selectedPieceId,
        target,
        Boolean(latestConquestState.question || latestConquestState.pendingAttempt || latestConquestState.expiredPending),
      );
      if (!validation.ok) {
        showError({ title: "Move unavailable", message: validation.message, displayMode: "toast" });
        return;
      }
      if (!session || !accessToken || !selectedPieceId) {
        return;
      }

      useConquestStore.getState().beginAttempt();
      beginOperation("startConquest");
      showLoading("startConquest");
      try {
        const nextQuestion = await startConquestAttempt(
          session.id,
          { pieceId: selectedPieceId, targetX: target.x, targetY: target.y },
          {
            accessToken,
            questionFallback: {
              gameSessionId: session.id,
              playerId: currentPlayerId ?? undefined,
              pieceId: selectedPieceId,
              sourceTileId: validation.sourceTileId,
              targetTileId: validation.targetTileId,
            },
          },
        );
        useConquestStore.getState().receiveQuestion(nextQuestion);
        selectPiece(null, []);
      } catch (error) {
        const normalized = normalizeConquestError(error);
        showError(normalized);
        useConquestStore.getState().failAttempt(normalized.message);
      } finally {
        endOperation();
        hideLoading();
      }
    },
    [
      accessToken,
      beginOperation,
      currentUserId,
      endOperation,
      hideLoading,
      selectPiece,
      selectedPieceId,
      session,
      showError,
      showLoading,
    ],
  );

  const selectAnswer = useCallback(
    (answerId: string) => {
      useConquestStore.getState().selectAnswer(answerId, currentPlayerId);
    },
    [currentPlayerId],
  );

  const submitAnswer = useCallback(async () => {
    if (!question || !selectedAnswerId || !accessToken || pendingAnswer || expiredPending || question.playerId !== currentPlayerId) {
      return;
    }
    useConquestStore.getState().beginAnswer();
    beginOperation("submitConquest");
    showLoading("submitConquest");
    try {
      const result = await submitConquestAnswer(
        question.gameSessionId,
        question.questionAttemptId,
        { answerId: selectedAnswerId },
        {
          accessToken,
          resultFallback: {
            gameSessionId: question.gameSessionId,
            playerId: question.playerId,
            pieceId: question.pieceId,
            sourceTileId: question.sourceTileId,
            targetTileId: question.targetTileId,
          },
        },
      );
      applyConquestResult(result);
    } catch (error) {
      const normalized = normalizeConquestError(error);
      if (isExpiredOrConflictingAttempt(error, normalized.message)) {
        useConquestStore.getState().expirePending();
        requestSnapshotRefresh("Question expired. Refreshing game state.");
        await reload?.();
        useConquestStore.getState().clearExpiredAttempt();
      } else {
        showError(normalized);
        useConquestStore.getState().failAttempt(normalized.message);
      }
    } finally {
      useConquestStore.getState().endAnswer();
      endOperation();
      hideLoading();
    }
  }, [
    accessToken,
    applyConquestResult,
    beginOperation,
    currentPlayerId,
    endOperation,
    expiredPending,
    hideLoading,
    pendingAnswer,
    question,
    reload,
    requestSnapshotRefresh,
    selectedAnswerId,
    showError,
    showLoading,
  ]);

  const expirePending = useCallback(async () => {
    useConquestStore.getState().expirePending();
    requestSnapshotRefresh("Question expired. Waiting for authoritative result.");
    await reload?.();
    useConquestStore.getState().clearExpiredAttempt();
  }, [reload, requestSnapshotRefresh]);

  useEffect(() => {
    if (!resultVisibleUntilUtc) {
      return;
    }
    const delay = Math.max(0, new Date(resultVisibleUntilUtc).getTime() - Date.now());
    const timeoutId = window.setTimeout(() => useConquestStore.getState().clearResult(), delay);
    return () => window.clearTimeout(timeoutId);
  }, [resultVisibleUntilUtc]);

  return {
    conquestState,
    startAttempt,
    selectAnswer,
    submitAnswer,
    expirePending,
    receiveQuestion,
    receiveAttempt,
    applyConquestResult,
  };
}

function isExpiredOrConflictingAttempt(error: unknown, message: string): boolean {
  return (error instanceof HttpError && error.status === 409) || /expired|no longer be answered/i.test(message);
}
