import type { GameSession } from "../../domain/game/gameTypes";
import { selectPlayerDisplayName } from "../../stores/gameStore";

type GamePlayerPanelProps = {
  session: GameSession;
  currentUserId: string | null;
};

export function GamePlayerPanel({ session, currentUserId }: GamePlayerPanelProps) {
  const orderedPlayers = [...session.players].sort((a, b) => a.playerOrder - b.playerOrder);

  return (
    <aside className="game-player-panel" aria-label="Players">
      <h2>Players</h2>
      <ol>
        {orderedPlayers.map((player) => (
          <li key={player.id} className="game-player-panel__item">
            <span>{selectPlayerDisplayName(player)}</span>
            {player.userId === currentUserId ? <span aria-label="current user">You</span> : null}
            {player.id === session.currentTurnPlayerId ? <span aria-label="current turn">Turn</span> : null}
            {player.isEliminated ? <span>Eliminated</span> : null}
          </li>
        ))}
      </ol>
    </aside>
  );
}
