import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { getUserIdFromJwt } from "../../domain/auth";
import { isLobbyExpired } from "../../domain/lobby/lobbyMappers";
import { useAuthStore } from "../../stores/authStore";
import { useErrorStore } from "../../stores/errorStore";
import { useLobbyStore } from "../../stores/lobbyStore";
import { createLobbyHubConnection, registerLobbyHubHandlers } from "../../realtime/lobbyHub";
import { LobbyActions } from "./LobbyActions";
import { LobbyCodePanel } from "./LobbyCodePanel";
import { LobbyPlayerList } from "./LobbyPlayerList";
import { useLobbyActions } from "./useLobbyActions";

export function LobbyRoomPage() {
  const { lobbyId } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUserId = accessToken ? getUserIdFromJwt(accessToken) : null;
  const lobby = useLobbyStore((state) => state.currentLobby);
  const connection = useLobbyStore((state) => state.connection);
  const liveMessage = useLobbyStore((state) => state.liveMessage);
  const { read } = useLobbyActions();
  const showError = useErrorStore((state) => state.showError);
  const setConnection = useLobbyStore((state) => state.setConnection);
  const applyLobbySnapshot = useLobbyStore((state) => state.applyLobbySnapshot);
  const applyPlayerJoined = useLobbyStore((state) => state.applyPlayerJoined);
  const applyPlayerLeft = useLobbyStore((state) => state.applyPlayerLeft);
  const applyHostChanged = useLobbyStore((state) => state.applyHostChanged);
  const applyLobbyStarted = useLobbyStore((state) => state.applyLobbyStarted);
  const applyLobbyClosed = useLobbyStore((state) => state.applyLobbyClosed);
  const applyLobbyCancelled = useLobbyStore((state) => state.applyLobbyCancelled);

  useEffect(() => {
    if (lobbyId && lobby?.id !== lobbyId) {
      void read(lobbyId);
    }
  }, [lobby?.id, lobbyId, read]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const connection = createLobbyHubConnection(accessToken);
    registerLobbyHubHandlers(connection, {
      onSnapshot: applyLobbySnapshot,
      onPlayerJoined: (nextLobby) => applyPlayerJoined(nextLobby),
      onPlayerLeft: (nextLobby) => applyPlayerLeft(nextLobby),
      onHostChanged: applyHostChanged,
      onStarted: applyLobbyStarted,
      onClosed: applyLobbyClosed,
      onCancelled: applyLobbyCancelled,
      onConnectionStatus: (status) => setConnection({ status }),
    });

    setConnection({ status: "connecting" });
    void connection
      .start()
      .then(() => setConnection({ status: "connected" }))
      .catch(() => {
        setConnection({ status: "error", message: "Unable to connect to lobby updates." });
        showError({
          title: "Lobby updates unavailable",
          message: "Unable to connect to lobby updates.",
          displayMode: "toast",
        });
      });

    return () => {
      void connection.stop();
    };
  }, [
    accessToken,
    applyHostChanged,
    applyLobbyCancelled,
    applyLobbyClosed,
    applyLobbySnapshot,
    applyLobbyStarted,
    applyPlayerJoined,
    applyPlayerLeft,
    setConnection,
    showError,
  ]);

  if (!lobby) {
    return (
      <main className="lobby-page">
        <p>Loading lobby...</p>
      </main>
    );
  }

  const expired = isLobbyExpired(lobby);

  return (
    <main className="lobby-page">
      <header className="lobby-header">
        <h1>Lobby room</h1>
        <Badge tone={lobby.status === "Open" ? "success" : "warning"}>{lobby.status}</Badge>
      </header>
      <div className="lobby-room-grid">
        <Card>
          <LobbyCodePanel code={lobby.code} />
          <dl className="lobby-details">
            <div>
              <dt>Players</dt>
              <dd>
                {lobby.players.length}/{lobby.maxPlayers}
              </dd>
            </div>
            <div>
              <dt>Expires</dt>
              <dd>{new Date(lobby.expiresAtUtc).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Connection</dt>
              <dd>{connection.status}</dd>
            </div>
          </dl>
          {expired ? <p role="status">This lobby has expired.</p> : null}
        </Card>
        <Card>
          <LobbyPlayerList lobby={lobby} currentUserId={currentUserId} />
          <LobbyActions lobby={lobby} currentUserId={currentUserId} />
        </Card>
      </div>
      <p className="sr-status" aria-live="polite">
        {liveMessage}
      </p>
    </main>
  );
}
