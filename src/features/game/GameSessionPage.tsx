import { useParams } from "react-router-dom";
import { GameBoard } from "./GameBoard";
import { GamePlayerPanel } from "./GamePlayerPanel";
import { GameStatusBar } from "./GameStatusBar";
import { useGameSession } from "./useGameSession";
import { useGameStore } from "../../stores/gameStore";

export function GameSessionPage() {
  const { sessionId } = useParams();
  const { session, blockingError, connection, currentUserId, isLoading, selectedPieceId, selectPiece, moveSelectedPiece } =
    useGameSession(sessionId);
  const liveMessage = useGameStore((state) => state.liveMessage);
  const candidateTargets = useGameStore((state) => state.candidateTargets);

  if (isLoading && !session && !blockingError) {
    return (
      <main className="game-page" aria-busy="true">
        <p>Loading game...</p>
      </main>
    );
  }

  if (blockingError) {
    return (
      <main className="game-page">
        <section role="alertdialog" aria-labelledby="game-blocking-title" className="game-blocking-state">
          <h1 id="game-blocking-title">{blockingError.title}</h1>
          <p>{blockingError.message}</p>
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
      </header>
      <GameStatusBar session={session} connection={connection} liveMessage={liveMessage} />
      <div className="game-layout">
        <GameBoard
          session={session}
          currentUserId={currentUserId}
          selectedPieceId={selectedPieceId}
          candidateTargets={candidateTargets}
          onPieceSelect={selectPiece}
          onTargetSelect={(target) => void moveSelectedPiece(target)}
        />
        <GamePlayerPanel session={session} currentUserId={currentUserId} />
      </div>
    </main>
  );
}
