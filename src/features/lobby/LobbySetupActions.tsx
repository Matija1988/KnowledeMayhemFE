import { Button } from "../../components/ui/Button";
import type { Lobby, LobbyOperation } from "../../domain/lobby/lobbyTypes";
import { selectCurrentLobbyPlayer, selectStartDisabledReason } from "../../stores/lobbyStore";
import { useLobbyActions } from "./useLobbyActions";

type LobbySetupActionsProps = {
  lobby: Lobby;
  currentUserId: string | null;
  pendingOperation: LobbyOperation | null;
  controlsDisabled?: boolean;
};

export function LobbySetupActions({ lobby, currentUserId, pendingOperation, controlsDisabled = false }: LobbySetupActionsProps) {
  const { setReady, start } = useLobbyActions();
  const currentPlayer = selectCurrentLobbyPlayer(lobby, currentUserId);
  const isHost = currentUserId === lobby.hostUserId;
  const disabledReason = selectStartDisabledReason(lobby, currentUserId, pendingOperation);
  const readyDisabled = !currentPlayer?.selectedPieceColor || lobby.status !== "Open" || pendingOperation === "setReady" || controlsDisabled;

  return (
    <section className="lobby-setup-section" aria-labelledby="lobby-ready-title">
      <div className="lobby-setup-section__header">
        <h2 id="lobby-ready-title">Ready</h2>
        <span>{lobby.setupStatus}</span>
      </div>
      <Button
        type="button"
        variant={currentPlayer?.isReady ? "secondary" : "primary"}
        disabled={readyDisabled}
        isLoading={pendingOperation === "setReady"}
        onClick={() => currentPlayer && void setReady(lobby.id, !currentPlayer.isReady, lobby.setupVersion)}
      >
        {currentPlayer?.isReady ? "Not ready" : "Ready"}
      </Button>
      {!currentPlayer?.selectedPieceColor ? <p className="disabled-reason">Select a color before ready.</p> : null}
      {isHost ? (
        <>
          <Button
            type="button"
            onClick={() => void start(lobby.id)}
            disabled={Boolean(disabledReason) || controlsDisabled}
            isLoading={pendingOperation === "startLobby"}
            title={disabledReason ?? undefined}
          >
            Start lobby
          </Button>
          {disabledReason ? <p className="disabled-reason">{disabledReason}</p> : null}
        </>
      ) : null}
    </section>
  );
}
