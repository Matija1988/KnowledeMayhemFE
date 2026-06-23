import { Badge } from "../../components/ui/Badge";
import type { Lobby } from "../../domain/lobby/lobbyTypes";

type LobbyPlayerListProps = {
  lobby: Lobby;
  currentUserId: string | null;
};

export function LobbyPlayerList({ lobby, currentUserId }: LobbyPlayerListProps) {
  return (
    <section aria-labelledby="players-title">
      <h2 id="players-title">Players</h2>
      <ul className="player-list">
        {lobby.players.map((player) => (
          <li key={player.userId}>
            <span className="player-identity">
              <span>{player.userId}</span>
              <span className="player-setup-summary">
                {player.selectedPieceColor ?? "No color"} - {player.isReady ? "Ready" : "Not ready"}
              </span>
            </span>
            <span className="player-badges">
              {player.userId === lobby.hostUserId ? <Badge>Host</Badge> : null}
              {player.userId === currentUserId ? <Badge tone="success">You</Badge> : null}
              {player.isReady ? <Badge tone="success">Ready</Badge> : <Badge tone="warning">Pending</Badge>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
