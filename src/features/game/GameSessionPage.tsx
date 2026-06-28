import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GameBoard } from "./GameBoard";
import { GamePlayerPanel } from "./GamePlayerPanel";
import { GameStatusBar } from "./GameStatusBar";
import { GameCategoryLegend } from "./GameCategoryLegend";
import { useGameSession } from "./useGameSession";
import { useGameStore } from "../../stores/gameStore";
import { QuestionModal } from "../conquest/QuestionModal";
import { selectHasPendingConquest } from "../../stores/conquestStore";
import { BattleQuestionModal } from "../battle/BattleQuestionModal";
import { selectHasPendingBattle } from "../../stores/battleStore";
import { LogoutButton } from "../auth/LogoutButton";

export function GameSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    session,
    categories,
    blockingError,
    connection,
    currentUserId,
    isLoading,
    selectedPieceId,
    selectPiece,
    moveSelectedPiece,
    conquestState,
    selectAnswer,
    submitAnswer,
    expireConquest,
    battleState,
    selectBattleAnswer,
    submitBattleAnswer,
    expireBattle,
  } = useGameSession(sessionId);
  const liveMessage = useGameStore((state) => state.liveMessage);
  const candidateTargets = useGameStore((state) => state.candidateTargets);
  const currentPlayerId = session?.players.find((player) => player.userId === currentUserId)?.id ?? null;
  const conquestPending = selectHasPendingConquest(conquestState);
  const battlePending = selectHasPendingBattle(battleState);

  useEffect(() => {
    if (!session || session.status !== "Completed") {
      return;
    }

    navigate(`/game/${session.id}/result`, { replace: true });
  }, [navigate, session]);

  if (isLoading && !session && !blockingError) {
    return (
      <main className="game-page" aria-busy="true">
        <p>Loading game...</p>
      </main>
    );
  }

  if (blockingError) {
    const canReturnToLobby = blockingError.reason === "completed" || blockingError.reason === "cancelled";

    return (
      <main className="game-page">
        <section role="alertdialog" aria-labelledby="game-blocking-title" className="game-blocking-state">
          <h1 id="game-blocking-title">{blockingError.title}</h1>
          <p>{blockingError.message}</p>
          {canReturnToLobby ? (
            <button className="ui-button ui-button--primary" type="button" onClick={() => navigate("/lobby", { replace: true })}>
              Return to lobby
            </button>
          ) : null}
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="game-page">
        <section role="alert">
          <h1>Game unavailable</h1>
          <p>We could not load this game session.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="game-page">
      <header className="game-header">
        <h1>Game Session</h1>
        <LogoutButton confirmActiveGame />
      </header>
      <GameStatusBar session={session} connection={connection} liveMessage={liveMessage} />
      <div className="game-layout">
        <GameBoard
          session={session}
          categories={categories}
          currentUserId={currentUserId}
          selectedPieceId={selectedPieceId}
          candidateTargets={candidateTargets}
          disabled={conquestPending || battlePending}
          onPieceSelect={selectPiece}
          onTargetSelect={(target) => void moveSelectedPiece(target)}
        />
        <div className="game-sidebar">
          <GamePlayerPanel session={session} currentUserId={currentUserId} />
          <GameCategoryLegend session={session} categories={categories} />
        </div>
      </div>
      <QuestionModal
        question={conquestState.question}
        result={conquestState.lastResult}
        selectedAnswerId={conquestState.selectedAnswerId}
        pendingAnswer={conquestState.pendingAnswer}
        expiredPending={conquestState.expiredPending}
        blockingError={conquestState.blockingError}
        actingPlayerId={currentPlayerId}
        liveMessage={conquestState.liveMessage}
        onSelectAnswer={selectAnswer}
        onSubmitAnswer={() => void submitAnswer()}
        onExpired={expireConquest}
      />
      <BattleQuestionModal
        question={battleState.question}
        result={battleState.lastResult}
        selectedAnswerId={battleState.selectedAnswerId}
        pendingAnswer={battleState.pendingAnswer}
        expiredPending={battleState.expiredPending}
        blockingError={battleState.blockingError}
        actingPlayerId={currentPlayerId}
        liveMessage={battleState.liveMessage}
        onSelectAnswer={selectBattleAnswer}
        onSubmitAnswer={() => void submitBattleAnswer()}
        onExpired={expireBattle}
      />
    </main>
  );
}
