import { useCallback, useEffect } from "react";
import {
  normalizeBattleError,
  startBattleAttempt,
  startSpecialFieldAttempt,
  submitBattleAnswer,
  submitSpecialFieldAnswer,
} from "../../api/battleApi";
import type { BattleQuestion, BattleResult } from "../../domain/battle/battleTypes";
import type { BoardCoordinate, BoardTile, GameSession } from "../../domain/game/gameTypes";
import { findTileByCoordinate, isCandidateTarget } from "../../domain/game/gameMovement";
import { useBattleStore } from "../../stores/battleStore";
import { useErrorStore } from "../../stores/errorStore";
import { useGameStore } from "../../stores/gameStore";
import { useLoadingStore } from "../../stores/loadingStore";
import { publishBattleResult } from "../../realtime/gameBroadcast";
import { recordGameTelemetry, recordGameTiming } from "../../realtime/gameTelemetry";

type UseBattleActionsOptions = {
  session: GameSession | null;
  accessToken: string | null;
  currentPlayerId: string | null;
  selectedPieceId: string | null;
  reload?: () => Promise<void>;
};

export function useBattleActions({ session, accessToken, currentPlayerId, selectedPieceId, reload }: UseBattleActionsOptions) {
  const showError = useErrorStore((state) => state.showError);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const beginOperation = useGameStore((state) => state.beginOperation);
  const endOperation = useGameStore((state) => state.endOperation);
  const selectPiece = useGameStore((state) => state.selectPiece);
  const applyBattleResultToGame = useGameStore((state) => state.applyBattleResult);
  const requestSnapshotRefresh = useGameStore((state) => state.requestSnapshotRefresh);

  const battleState = useBattleStore();
  const question = useBattleStore((state) => state.question);
  const selectedAnswerId = useBattleStore((state) => state.selectedAnswerId);
  const pendingAnswer = useBattleStore((state) => state.pendingAnswer);
  const expiredPending = useBattleStore((state) => state.expiredPending);
  const resultVisibleUntilUtc = useBattleStore((state) => state.resultVisibleUntilUtc);

  const receiveQuestion = useCallback((nextQuestion: BattleQuestion) => {
    useBattleStore.getState().receiveQuestion(nextQuestion);
  }, []);

  const applyBattleResult = useCallback(
    (result: BattleResult) => {
      const isNewResult = useBattleStore.getState().applyResult(result);
      if (!isNewResult) {
        return;
      }
      const applied = applyBattleResultToGame(result);
      if (!applied) {
        requestSnapshotRefresh("Refreshing game state after battle result.");
        void reload?.();
      }
    },
    [applyBattleResultToGame, reload, requestSnapshotRefresh],
  );

  const startBattle = useCallback(
    async (targetTile: BoardTile) => {
      const validation = validateBattleTarget(session, selectedPieceId, targetTile, currentPlayerId, useBattleStore.getState().pendingAttempt);
      if (!validation.ok) {
        showError({ title: "Move unavailable", message: validation.message, displayMode: "toast" });
        return;
      }
      if (!session || !accessToken || !selectedPieceId || !validation.sourceTileId) {
        return;
      }

      useBattleStore.getState().beginAttempt("Requesting battle question.");
      beginOperation("startBattle");
      showLoading("startBattle");
      const startedAtMs = Date.now();
      try {
        const nextQuestion = await startBattleAttempt(
          session.id,
          { attackingPieceId: selectedPieceId, targetTileId: targetTile.id },
          {
            accessToken,
            questionFallback: {
              actingPlayerId: currentPlayerId ?? undefined,
              pieceId: selectedPieceId,
              sourceTileId: validation.sourceTileId,
              targetTileId: targetTile.id,
            },
          },
        );
        recordGameTiming("battle-start", startedAtMs, {
          gameSessionId: session.id,
          attemptKind: "Battle",
          pieceId: selectedPieceId,
          targetTileId: targetTile.id,
        });
        useBattleStore.getState().receiveQuestion(nextQuestion);
        selectPiece(null, []);
      } catch (error) {
        const normalized = normalizeBattleError(error);
        recordGameTelemetry("battle-command-failed", {
          gameSessionId: session.id,
          attemptKind: "Battle",
          pieceId: selectedPieceId,
          targetTileId: targetTile.id,
          title: normalized.title,
          message: normalized.message,
        });
        showError(normalized);
        useBattleStore.getState().failAttempt(normalized.message);
      } finally {
        endOperation();
        hideLoading();
      }
    },
    [accessToken, beginOperation, currentPlayerId, endOperation, hideLoading, selectPiece, selectedPieceId, session, showError, showLoading],
  );

  const startSpecialField = useCallback(
    async (targetTile: BoardTile) => {
      const validation = validateSpecialTarget(session, selectedPieceId, targetTile, currentPlayerId, useBattleStore.getState().pendingAttempt);
      if (!validation.ok) {
        showError({ title: "Move unavailable", message: validation.message, displayMode: "toast" });
        return;
      }
      if (!session || !accessToken || !selectedPieceId || !validation.sourceTileId) {
        return;
      }

      useBattleStore.getState().beginAttempt("Requesting special field question.");
      beginOperation("startSpecialField");
      showLoading("startSpecialField");
      try {
        const nextQuestion = await startSpecialFieldAttempt(
          session.id,
          { pieceId: selectedPieceId, targetTileId: targetTile.id },
          {
            accessToken,
            questionFallback: {
              actingPlayerId: currentPlayerId ?? undefined,
              pieceId: selectedPieceId,
              sourceTileId: validation.sourceTileId,
              targetTileId: targetTile.id,
            },
          },
        );
        useBattleStore.getState().receiveQuestion(nextQuestion);
        selectPiece(null, []);
      } catch (error) {
        const normalized = normalizeBattleError(error);
        recordGameTelemetry("special-command-failed", {
          gameSessionId: session.id,
          attemptKind: "SpecialField",
          pieceId: selectedPieceId,
          targetTileId: targetTile.id,
          title: normalized.title,
          message: normalized.message,
        });
        showError(normalized);
        useBattleStore.getState().failAttempt(normalized.message);
      } finally {
        endOperation();
        hideLoading();
      }
    },
    [accessToken, beginOperation, currentPlayerId, endOperation, hideLoading, selectPiece, selectedPieceId, session, showError, showLoading],
  );

  const startForTarget = useCallback(
    async (target: BoardCoordinate): Promise<boolean> => {
      if (!session || !selectedPieceId) {
        return false;
      }
      const targetTile = findTileByCoordinate(session, target);
      if (!targetTile) {
        return false;
      }
      const selectedPiece = session.pieces.find((piece) => piece.id === selectedPieceId && !piece.isCaptured);
      const occupyingPiece = targetTile.occupyingPieceId
        ? session.pieces.find((piece) => piece.id === targetTile.occupyingPieceId && !piece.isCaptured)
        : null;
      if (selectedPiece && occupyingPiece && occupyingPiece.ownerPlayerId !== selectedPiece.ownerPlayerId) {
        await startBattle(targetTile);
        return true;
      }
      if (targetTile.tileType === "Special" && !targetTile.occupyingPieceId) {
        await startSpecialField(targetTile);
        return true;
      }
      return false;
    },
    [selectedPieceId, session, startBattle, startSpecialField],
  );

  const selectAnswer = useCallback(
    (answerId: string) => {
      useBattleStore.getState().selectAnswer(answerId, currentPlayerId);
    },
    [currentPlayerId],
  );

  const submitAnswer = useCallback(async () => {
    if (!question || !selectedAnswerId || !accessToken || pendingAnswer || expiredPending || question.actingPlayerId !== currentPlayerId) {
      return;
    }
    useBattleStore.getState().beginAnswer();
    beginOperation(question.attemptKind === "Battle" ? "submitBattle" : "submitSpecialField");
    showLoading(question.attemptKind === "Battle" ? "submitBattle" : "submitSpecialField");
    try {
      const response =
        question.attemptKind === "Battle"
          ? await submitBattleAnswer(
              question.gameSessionId,
              question.attemptId,
              { questionAttemptId: question.questionAttemptId, answerId: selectedAnswerId },
              { accessToken, resultFallback: question },
            )
          : await submitSpecialFieldAnswer(
              question.gameSessionId,
              question.attemptId,
              { questionAttemptId: question.questionAttemptId, answerId: selectedAnswerId },
              { accessToken, resultFallback: question },
            );
      if ("questionText" in response) {
        useBattleStore.getState().receiveQuestion(response);
      } else {
        applyBattleResult(response);
        publishBattleResult(response);
      }
    } catch (error) {
      const normalized = normalizeBattleError(error);
      recordGameTelemetry(question.attemptKind === "Battle" ? "battle-command-failed" : "special-command-failed", {
        gameSessionId: question.gameSessionId,
        attemptKind: question.attemptKind,
        attemptId: question.attemptId,
        questionAttemptId: question.questionAttemptId,
        answerId: selectedAnswerId,
        title: normalized.title,
        message: normalized.message,
      });
      showError(normalized);
      useBattleStore.getState().failAttempt(normalized.message);
    } finally {
      useBattleStore.getState().endAnswer();
      endOperation();
      hideLoading();
    }
  }, [
    accessToken,
    applyBattleResult,
    beginOperation,
    currentPlayerId,
    endOperation,
    expiredPending,
    hideLoading,
    pendingAnswer,
    question,
    selectedAnswerId,
    showError,
    showLoading,
  ]);

  const expirePending = useCallback(() => {
    useBattleStore.getState().expirePending();
    requestSnapshotRefresh("Question expired. Waiting for authoritative result.");
    void reload?.();
  }, [reload, requestSnapshotRefresh]);

  useEffect(() => {
    if (!resultVisibleUntilUtc) {
      return;
    }
    const delay = Math.max(0, new Date(resultVisibleUntilUtc).getTime() - Date.now());
    const timeoutId = window.setTimeout(() => useBattleStore.getState().clearResult(), delay);
    return () => window.clearTimeout(timeoutId);
  }, [resultVisibleUntilUtc]);

  return {
    battleState,
    startForTarget,
    startBattle,
    startSpecialField,
    selectAnswer,
    submitAnswer,
    expirePending,
    receiveQuestion,
    applyBattleResult,
  };
}

function validateBattleTarget(
  session: GameSession | null,
  pieceId: string | null,
  targetTile: BoardTile,
  currentPlayerId: string | null,
  pendingAttempt: boolean,
): { ok: true; sourceTileId: string } | { ok: false; message: string; sourceTileId?: undefined } {
  const base = validateCommonTarget(session, pieceId, targetTile, currentPlayerId, pendingAttempt);
  if (!base.ok) {
    return base;
  }
  if (!targetTile.occupyingPieceId) {
    return { ok: false, message: "Battle target must contain an enemy piece." };
  }
  const defender = session?.pieces.find((piece) => piece.id === targetTile.occupyingPieceId && !piece.isCaptured);
  const attacker = session?.pieces.find((piece) => piece.id === pieceId && !piece.isCaptured);
  if (!defender || !attacker || defender.ownerPlayerId === attacker.ownerPlayerId) {
    return { ok: false, message: "Battle target must belong to another player." };
  }
  return base;
}

function validateSpecialTarget(
  session: GameSession | null,
  pieceId: string | null,
  targetTile: BoardTile,
  currentPlayerId: string | null,
  pendingAttempt: boolean,
): { ok: true; sourceTileId: string } | { ok: false; message: string; sourceTileId?: undefined } {
  const base = validateCommonTarget(session, pieceId, targetTile, currentPlayerId, pendingAttempt);
  if (!base.ok) {
    return base;
  }
  if (targetTile.tileType !== "Special") {
    return { ok: false, message: "That tile is not a special field." };
  }
  if (targetTile.occupyingPieceId) {
    return { ok: false, message: "Special field is already occupied." };
  }
  return base;
}

function validateCommonTarget(
  session: GameSession | null,
  pieceId: string | null,
  targetTile: BoardTile,
  currentPlayerId: string | null,
  pendingAttempt: boolean,
): { ok: true; sourceTileId: string } | { ok: false; message: string; sourceTileId?: undefined } {
  if (!session || !pieceId) {
    return { ok: false, message: "Game session is not loaded." };
  }
  if (pendingAttempt) {
    return { ok: false, message: "Resolve the current attempt before starting another action." };
  }
  const piece = session.pieces.find((candidate) => candidate.id === pieceId && !candidate.isCaptured);
  if (!piece || !piece.currentTileId) {
    return { ok: false, message: "Piece is not available." };
  }
  if (piece.ownerPlayerId !== currentPlayerId || session.currentTurnPlayerId !== currentPlayerId) {
    return { ok: false, message: "It is not your turn." };
  }
  if (!isCandidateTarget(session, pieceId, { x: targetTile.x, y: targetTile.y })) {
    return { ok: false, message: "That target tile is not available for this piece." };
  }
  return { ok: true, sourceTileId: piece.currentTileId };
}
