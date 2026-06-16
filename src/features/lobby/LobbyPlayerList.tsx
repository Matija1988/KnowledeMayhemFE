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
            <span>{player.userId}</span>
            <span className="player-badges">
              {player.userId === lobby.hostUserId ? <Badge>Host</Badge> : null}
              {player.userId === currentUserId ? <Badge tone="success">You</Badge> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
