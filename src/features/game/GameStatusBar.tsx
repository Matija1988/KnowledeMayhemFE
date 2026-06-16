import type { ConnectionState, GameSession } from "../../domain/game/gameTypes";
import { selectPlayerDisplayName } from "../../stores/gameStore";

type GameStatusBarProps = {
  session: GameSession;
  connection: ConnectionState;
  liveMessage: string;
};

export function GameStatusBar({ session, connection, liveMessage }: GameStatusBarProps) {
  const currentTurnPlayer = session.players.find((player) => player.id === session.currentTurnPlayerId);
  const currentTurnLabel = currentTurnPlayer ? selectPlayerDisplayName(currentTurnPlayer) : "No active player";
  const statusMessage = gameStatusMessage(session.status);
  const connectionMessage = connection.message ?? connection.status;

  return (
    <section className="game-status-bar" aria-label="Game status">
      <span>Turn {session.turnNumber}: {currentTurnLabel}</span>
      <span>{statusMessage}</span>
      <span>Connection: {connection.status}</span>
      <span className="sr-only" aria-live="polite">
        {liveMessage || `Turn ${session.turnNumber}, ${currentTurnLabel}, ${statusMessage}. ${connectionMessage}`}
      </span>
      <span className="game-status-bar__hint" aria-live="polite">
        {connection.status === "reconnecting"
          ? "Reconnecting. Movement is paused until the game state refreshes."
          : "Select one of your pieces, then choose a highlighted orthogonal target."}
      </span>
    </section>
  );
}

function gameStatusMessage(status: GameSession["status"]): string {
  if (status === "Completed") {
    return "Game completed";
  }
  if (status === "Cancelled") {
    return "Game cancelled";
  }
  return "Game in progress";
}
