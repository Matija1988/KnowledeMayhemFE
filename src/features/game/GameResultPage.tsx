import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGameCompletionSummary, normalizeGameError } from "../../api/gameApi";
import { getUserIdFromJwt } from "../../domain/auth";
import type { GameCompletionSummary, GamePlayerStatistics } from "../../domain/game/gameTypes";
import { useAuthStore } from "../../stores/authStore";

export function GameResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [summary, setSummary] = useState<GameCompletionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !accessToken) {
      return;
    }

    let isActive = true;
    setError(null);
    void getGameCompletionSummary(sessionId, { accessToken })
      .then((nextSummary) => {
        if (isActive) {
          setSummary(nextSummary);
        }
      })
      .catch((reason: unknown) => {
        if (isActive) {
          setError(normalizeGameError(reason).message);
        }
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, sessionId]);

  const currentUserId = accessToken ? getUserIdFromJwt(accessToken) : null;
  const orderedPlayers = useMemo(() => {
    if (!summary) {
      return [];
    }

    return [...summary.players].sort((left, right) => {
      if (left.userId === currentUserId) return -1;
      if (right.userId === currentUserId) return 1;
      return left.displayName.localeCompare(right.displayName);
    });
  }, [currentUserId, summary]);

  if (error) {
    return (
      <main className="game-result-page">
        <section className="game-result-state" role="alert">
          <h1>Game result unavailable</h1>
          <p>{error}</p>
          <button className="ui-button ui-button--primary" type="button" onClick={() => navigate("/lobby", { replace: true })}>
            Return to lobby
          </button>
        </section>
      </main>
    );
  }

  if (!summary) {
    return (
      <main className="game-result-page" aria-busy="true">
        <p>Loading game result...</p>
      </main>
    );
  }

  const currentPlayer = summary.players.find((player) => player.userId === currentUserId);
  const isWinner = currentPlayer?.playerId === summary.winnerPlayerId;
  const winner = summary.players.find((player) => player.playerId === summary.winnerPlayerId);

  return (
    <main className={`game-result-page game-result-page--${isWinner ? "victory" : "defeat"}`}>
      <header className="game-result-hero">
        <p className="game-result-hero__eyebrow">Game completed</p>
        <h1>{isWinner ? "Victory!" : "Game lost"}</h1>
        <p>
          {isWinner
            ? "You won the game. Nicely played."
            : `${winner?.displayName ?? "Your opponent"} won this game.`}
        </p>
      </header>

      <section className="game-result-summary" aria-labelledby="game-statistics-title">
        <div className="game-result-summary__heading">
          <div>
            <p className="game-result-hero__eyebrow">Final report</p>
            <h2 id="game-statistics-title">Question statistics</h2>
          </div>
          <p>Correctly answered questions by category</p>
        </div>

        <div className="game-result-players">
          {orderedPlayers.map((player) => (
            <PlayerStatisticsCard key={player.playerId} player={player} isCurrentPlayer={player.userId === currentUserId} />
          ))}
        </div>
      </section>

      <div className="game-result-actions">
        <button className="ui-button ui-button--primary" type="button" onClick={() => navigate("/lobby", { replace: true })}>
          Return to lobby
        </button>
      </div>
    </main>
  );
}

function PlayerStatisticsCard({ player, isCurrentPlayer }: { player: GamePlayerStatistics; isCurrentPlayer: boolean }) {
  return (
    <article className={`game-result-player${player.isWinner ? " game-result-player--winner" : ""}`}>
      <header className="game-result-player__header">
        <div>
          <h3>{player.displayName}</h3>
          <p>{isCurrentPlayer ? "You" : "Opponent"}</p>
        </div>
        {player.isWinner ? <span className="game-result-badge">Winner</span> : null}
      </header>

      <div className="game-result-overall" aria-label={`${player.displayName} overall score`}>
        <strong>{formatPercentage(player.percentage)}</strong>
        <span>{player.correctAnswers} of {player.totalAnswers} correct overall</span>
      </div>

      {player.categories.length > 0 ? (
        <div className="game-result-table-wrap">
          <table className="game-result-table">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Correct</th>
                <th scope="col">Success</th>
              </tr>
            </thead>
            <tbody>
              {player.categories.map((category) => (
                <tr key={category.categoryId}>
                  <th scope="row">{category.categoryName}</th>
                  <td>{category.correctAnswers} of {category.totalAnswers}</td>
                  <td>{formatPercentage(category.percentage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="game-result-empty">No submitted answers in this game.</p>
      )}
    </article>
  );
}

function formatPercentage(value: number): string {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;
}
