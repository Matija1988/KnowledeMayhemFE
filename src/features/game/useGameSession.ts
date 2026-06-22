import { useCallback, useEffect } from "react";
import { getUserIdFromJwt } from "../../domain/auth";
import { getGameSession, normalizeGameError } from "../../api/gameApi";
import { useConquestActions } from "../conquest/useConquestActions";
import { useBattleActions } from "../battle/useBattleActions";
import {
  findTileByCoordinate,
  getOrthogonalCandidateTargets,
  getPieceDisabledReason,
  isCandidateTarget,
} from "../../domain/game/gameMovement";
import type { BoardCoordinate } from "../../domain/game/gameTypes";
import { createGameHubConnection, joinGameSessionHubGroup, registerGameHubHandlers } from "../../realtime/gameHub";
import { subscribeToGameBroadcast } from "../../realtime/gameBroadcast";
import { useAuthStore } from "../../stores/authStore";
import { selectCurrentUserPlayer } from "../../stores/gameStore";
import { useConquestStore } from "../../stores/conquestStore";
import { useBattleStore } from "../../stores/battleStore";
import { useErrorStore } from "../../stores/errorStore";
import { useGameStore } from "../../stores/gameStore";
import { useLoadingStore } from "../../stores/loadingStore";

export function useGameSession(sessionId: string | undefined) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const showError = useErrorStore((state) => state.showError);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const setSession = useGameStore((state) => state.setSession);
  const setBlockingError = useGameStore((state) => state.setBlockingError);
  const beginOperation = useGameStore((state) => state.beginOperation);
  const endOperation = useGameStore((state) => state.endOperation);
  const resetGame = useGameStore((state) => state.resetGame);
  const session = useGameStore((state) => state.session);
  const blockingError = useGameStore((state) => state.blockingError);
  const connection = useGameStore((state) => state.connection);
  const pendingOperation = useGameStore((state) => state.pendingOperation);
  const selectedPieceId = useGameStore((state) => state.selectedPieceId);
  const selectPieceInStore = useGameStore((state) => state.selectPiece);
  const applyMoveResult = useGameStore((state) => state.applyMoveResult);
  const applyGameSnapshot = useGameStore((state) => state.applyGameSnapshot);
  const applyMovePatch = useGameStore((state) => state.applyMovePatch);
  const applyTileOwnershipPatch = useGameStore((state) => state.applyTileOwnershipPatch);
  const applyTurnPatch = useGameStore((state) => state.applyTurnPatch);
  const requestSnapshotRefresh = useGameStore((state) => state.requestSnapshotRefresh);
  const setConnection = useGameStore((state) => state.setConnection);
  const resetConquest = useConquestStore((state) => state.resetConquest);
  const resetBattle = useBattleStore((state) => state.resetBattle);

  const loadSession = useCallback(async () => {
    if (!sessionId || !accessToken) {
      return;
    }

    beginOperation("readGame");
    showLoading("readGame");
    try {
      const nextSession = await getGameSession(sessionId, { accessToken });
      setSession(nextSession);
    } catch (error) {
      const normalized = normalizeGameError(error);
      showError(normalized);
      setBlockingError({
        title: normalized.title,
        message: normalized.message,
        reason: error instanceof Error && error.message.startsWith("Game session response") ? "malformedSnapshot" : "unavailable",
      });
    } finally {
      endOperation();
      hideLoading();
    }
  }, [accessToken, beginOperation, endOperation, hideLoading, sessionId, setBlockingError, setSession, showError, showLoading]);

  const currentUserId = accessToken ? getUserIdFromJwt(accessToken) : null;
  const currentPlayerId = selectCurrentUserPlayer(session, currentUserId)?.id ?? null;
  const reloadConquestSession = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  const conquest = useConquestActions({
    session,
    accessToken,
    currentPlayerId,
    currentUserId,
    selectedPieceId,
    reload: reloadConquestSession,
  });
  const {
    conquestState,
    startAttempt,
    selectAnswer,
    submitAnswer,
    expirePending,
    receiveQuestion,
    receiveAttempt,
    applyConquestResult,
  } = conquest;
  const battle = useBattleActions({
    session,
    accessToken,
    currentPlayerId,
    selectedPieceId,
    reload: reloadConquestSession,
  });
  const {
    battleState,
    startForTarget,
    selectAnswer: selectBattleAnswer,
    submitAnswer: submitBattleAnswer,
    expirePending: expireBattle,
    receiveQuestion: receiveBattleQuestion,
    applyBattleResult,
  } = battle;

  useEffect(() => {
    resetGame();
    resetConquest();
    resetBattle();
    void loadSession();
  }, [loadSession, resetBattle, resetConquest, resetGame]);

  useEffect(() => {
    if (!sessionId || !accessToken || import.meta.env.MODE === "test") {
      return;
    }

    let isActive = true;
    const connection = createGameHubConnection(accessToken);
    const joinGameUpdates = async () => {
      try {
        await joinGameSessionHubGroup(connection, sessionId);
      } catch {
        if (isActive) {
          setConnection({ status: "error", message: "Unable to subscribe to game updates." });
          showError({
            title: "Realtime unavailable",
            message: "Unable to subscribe to this game's updates.",
            displayMode: "toast",
          });
        }
      }
    };
    const refreshAuthoritativeSnapshot = (message = "Refreshing game state.") => {
      requestSnapshotRefresh(message);
      void loadSession();
    };

    setConnection({ status: "connecting", message: "Connecting to game updates." });
    registerGameHubHandlers(connection, {
      onSession: (nextSession) => {
        if (!isActive || nextSession.id !== sessionId) {
          return;
        }
        applyGameSnapshot(nextSession, `Game updated. Turn ${nextSession.turnNumber}.`);
      },
      onActionResult: (result) => {
        if (!isActive || result.session.id !== sessionId) {
          return;
        }
        applyMoveResult(result.session, `Move completed. Turn ${result.session.turnNumber}.`);
      },
      onMoveExecuted: (event) => {
        if (!isActive || event.gameSessionId !== sessionId) {
          return;
        }
        applyMovePatch(event.gameSessionId, event.pieceId, event.fromTileId, event.toTileId, event.turnNumber);
      },
      onTileOwnershipChanged: (event) => {
        if (!isActive || event.gameSessionId !== sessionId) {
          return;
        }
        applyTileOwnershipPatch(event.gameSessionId, event.tileId, event.ownerPlayerId);
      },
      onTurnAdvanced: (event) => {
        if (!isActive || event.gameSessionId !== sessionId) {
          return;
        }
        applyTurnPatch(event.gameSessionId, event.currentTurnPlayerId, event.turnNumber);
      },
      onGameplayQuestion: (question) => {
        if (!isActive || question.gameSessionId !== sessionId) {
          return;
        }
        receiveQuestion(question);
      },
      onQuestionAttempt: (event) => {
        if (!isActive || event.gameSessionId !== sessionId) {
          return;
        }
        receiveAttempt(event);
      },
      onConquestResult: (result) => {
        if (!isActive || result.gameSessionId !== sessionId) {
          return;
        }
        applyConquestResult(result);
      },
      onBattleQuestion: (question) => {
        if (!isActive || question.gameSessionId !== sessionId) {
          return;
        }
        receiveBattleQuestion(question);
      },
      onBattleResult: (result) => {
        if (!isActive || result.gameSessionId !== sessionId) {
          return;
        }
        applyBattleResult(result);
      },
      onPieceCaptured: (event) => {
        if (!isActive || event.gameSessionId !== sessionId) {
          return;
        }
        useGameStore.getState().applyPieceCapturedPatch(event.gameSessionId, event.pieceId, event.removedFromTileId ?? null, event.sequence ?? null);
      },
      onPieceLeveledUp: (event) => {
        if (!isActive || event.gameSessionId !== sessionId) {
          return;
        }
        useGameStore.getState().applyPieceLeveledPatch(event.gameSessionId, event.pieceId, event.newLevel, event.sequence ?? null);
      },
      onSnapshotRequired: (event) => {
        if (!isActive || event.gameSessionId !== sessionId) {
          return;
        }
        refreshAuthoritativeSnapshot(event.reason ?? "Refreshing authoritative game state.");
      },
      onPatchNeedsRefresh: () => {
        if (!isActive) {
          return;
        }
        refreshAuthoritativeSnapshot("Refreshing game state after realtime update.");
      },
      onConnectionStatus: (status) => {
        if (!isActive) {
          return;
        }
        if (status === "connected") {
          setConnection({ status: "connected", message: "Game updates connected." });
          void joinGameUpdates();
          refreshAuthoritativeSnapshot("Reconnected. Refreshing game state.");
          return;
        }
        if (status === "reconnecting") {
          setConnection({ status: "reconnecting", message: "Reconnecting to game updates." });
          requestSnapshotRefresh("Reconnecting. Movement is paused until the game state refreshes.");
          return;
        }
        setConnection({ status: "disconnected", message: "Game updates disconnected." });
      },
    });

    void connection
      .start()
      .then(async () => {
        if (isActive) {
          setConnection({ status: "connected", message: "Game updates connected." });
          await joinGameUpdates();
        }
      })
      .catch(() => {
        if (isActive) {
          setConnection({ status: "error", message: "Unable to connect to game updates." });
          showError({
            title: "Realtime unavailable",
            message: "Game updates could not connect. The board can still refresh from backend responses.",
            displayMode: "toast",
          });
        }
      });

    return () => {
      isActive = false;
      void connection.stop();
    };
  }, [
    accessToken,
    applyGameSnapshot,
    applyMovePatch,
    applyMoveResult,
    applyTileOwnershipPatch,
    applyTurnPatch,
    applyConquestResult,
    applyBattleResult,
    loadSession,
    receiveAttempt,
    receiveBattleQuestion,
    receiveQuestion,
    requestSnapshotRefresh,
    sessionId,
    setConnection,
    showError,
  ]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    return subscribeToGameBroadcast((message) => {
      if (message.type === "battle-result" && message.result.gameSessionId === sessionId) {
        applyBattleResult(message.result);
      }
    });
  }, [applyBattleResult, sessionId]);

  const selectPiece = useCallback(
    (pieceId: string) => {
      if (!session) {
        return;
      }
      const disabledReason = getPieceDisabledReason(session, pieceId, currentUserId, Boolean(pendingOperation));
      if (disabledReason) {
        showError({ title: "Move unavailable", message: disabledReason, displayMode: "toast" });
        return;
      }
      selectPieceInStore(pieceId, getOrthogonalCandidateTargets(session, pieceId));
    },
    [currentUserId, pendingOperation, selectPieceInStore, session, showError],
  );

  const moveSelectedPiece = useCallback(
    async (target: BoardCoordinate) => {
      if (!session || !accessToken || !selectedPieceId || pendingOperation) {
        return;
      }
      const targetTile = findTileByCoordinate(session, target);
      if (!targetTile || !isCandidateTarget(session, selectedPieceId, target)) {
        showError({ title: "Move unavailable", message: "That target tile is not available for this piece.", displayMode: "toast" });
        return;
      }

      const battleHandled = await startForTarget(target);
      if (battleHandled) {
        return;
      }
      await startAttempt(target);
    },
    [accessToken, pendingOperation, selectedPieceId, session, showError, startAttempt, startForTarget],
  );

  return {
    session,
    blockingError,
    connection,
    currentUserId,
    isLoading: pendingOperation === "readGame",
    selectedPieceId,
    selectPiece,
    moveSelectedPiece,
    reload: loadSession,
    applyRealtimeSession: applyGameSnapshot,
    conquestState,
    selectAnswer,
    submitAnswer,
    expireConquest: expirePending,
    battleState,
    selectBattleAnswer,
    submitBattleAnswer,
    expireBattle,
  };
}
