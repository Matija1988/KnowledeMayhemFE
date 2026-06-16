import { Button } from "../../components/ui/Button";
import type { Lobby } from "../../domain/lobby/lobbyTypes";
import { selectStartDisabledReason } from "../../stores/lobbyStore";
import { useLobbyActions } from "./useLobbyActions";

type LobbyActionsProps = {
  lobby: Lobby;
  currentUserId: string | null;
};

export function LobbyActions({ lobby, currentUserId }: LobbyActionsProps) {
  const { leave, cancel, start } = useLobbyActions();
  const isHost = currentUserId === lobby.hostUserId;
  const disabledReason = selectStartDisabledReason(lobby, currentUserId, null);

  return (
    <div className="lobby-actions">
      <Button type="button" variant="secondary" onClick={() => void leave(lobby.id)}>
        Leave lobby
      </Button>
      {isHost ? (
        <>
          <Button type="button" variant="danger" onClick={() => void cancel(lobby.id)}>
            Cancel lobby
          </Button>
          <Button type="button" onClick={() => void start(lobby.id)} disabled={Boolean(disabledReason)} title={disabledReason ?? undefined}>
            Start lobby
          </Button>
          {disabledReason ? <p className="disabled-reason">{disabledReason}</p> : null}
        </>
      ) : null}
    </div>
  );
}
