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
            <span className="game-player-panel__identity">
              {player.pieceColor ? (
                <span
                  className="game-player-panel__swatch"
                  style={{ backgroundColor: `var(--piece-color-${player.pieceColor.toLowerCase()})` }}
                  aria-hidden="true"
                />
              ) : null}
              {selectPlayerDisplayName(player)}
            </span>
            {player.pieceColor ? <span>{player.pieceColor}</span> : null}
            {player.userId === currentUserId ? <span aria-label="current user">You</span> : null}
            {player.id === session.currentTurnPlayerId ? <span aria-label="current turn">Turn</span> : null}
            {player.isEliminated ? <span>Eliminated</span> : null}
          </li>
        ))}
      </ol>
    </aside>
  );
}
