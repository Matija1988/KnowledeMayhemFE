import { Button } from "../../components/ui/Button";
import type { Lobby, LobbyOperation } from "../../domain/lobby/lobbyTypes";
import { useLobbyActions } from "./useLobbyActions";
import { LobbySetupActions } from "./LobbySetupActions";

type LobbyActionsProps = {
  lobby: Lobby;
  currentUserId: string | null;
  pendingOperation?: LobbyOperation | null;
  controlsDisabled?: boolean;
};

export function LobbyActions({ lobby, currentUserId, pendingOperation = null, controlsDisabled = false }: LobbyActionsProps) {
  const { leave, cancel } = useLobbyActions();
  const isHost = currentUserId === lobby.hostUserId;

  return (
    <div className="lobby-actions">
      <LobbySetupActions lobby={lobby} currentUserId={currentUserId} pendingOperation={pendingOperation} controlsDisabled={controlsDisabled} />
      <Button type="button" variant="secondary" onClick={() => void leave(lobby.id)}>
        Leave lobby
      </Button>
      {isHost ? (
        <div className="lobby-actions__host">
          <Button type="button" variant="danger" onClick={() => void cancel(lobby.id)}>
            Cancel lobby
          </Button>
        </div>
      ) : null}
    </div>
  );
}
