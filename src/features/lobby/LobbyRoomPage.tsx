import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { getUserIdFromJwt } from "../../domain/auth";
import { isLobbyExpired } from "../../domain/lobby/lobbyMappers";
import { useAuthStore } from "../../stores/authStore";
import { useErrorStore } from "../../stores/errorStore";
import { useLobbyStore } from "../../stores/lobbyStore";
import { createLobbyHubConnection, joinLobbyHubGroup, registerLobbyHubHandlers } from "../../realtime/lobbyHub";
import { LobbyActions } from "./LobbyActions";
import { LobbyCodePanel } from "./LobbyCodePanel";
import { LobbyPlayerList } from "./LobbyPlayerList";
import { useLobbyActions } from "./useLobbyActions";
import { LogoutButton } from "../auth/LogoutButton";

export function LobbyRoomPage() {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUserId = accessToken ? getUserIdFromJwt(accessToken) : null;
  const lobby = useLobbyStore((state) => state.currentLobby);
  const connection = useLobbyStore((state) => state.connection);
  const liveMessage = useLobbyStore((state) => state.liveMessage);
  const pendingOperation = useLobbyStore((state) => state.pendingOperation);
  const requestedLobbyIdRef = useRef<string | null>(null);
  const { read } = useLobbyActions();
  const showError = useErrorStore((state) => state.showError);
  const setConnection = useLobbyStore((state) => state.setConnection);
  const applyLobbySnapshot = useLobbyStore((state) => state.applyLobbySnapshot);
  const applyPlayerJoined = useLobbyStore((state) => state.applyPlayerJoined);
  const applyPlayerJoinedPatch = useLobbyStore((state) => state.applyPlayerJoinedPatch);
  const applyPlayerLeft = useLobbyStore((state) => state.applyPlayerLeft);
  const applyPlayerLeftPatch = useLobbyStore((state) => state.applyPlayerLeftPatch);
  const applyHostChanged = useLobbyStore((state) => state.applyHostChanged);
  const applyLobbyStarted = useLobbyStore((state) => state.applyLobbyStarted);
  const applyLobbyClosed = useLobbyStore((state) => state.applyLobbyClosed);
  const applyLobbyCancelled = useLobbyStore((state) => state.applyLobbyCancelled);

  useEffect(() => {
    if (lobby?.id === lobbyId) {
      requestedLobbyIdRef.current = null;
      return;
    }

    if (lobbyId && pendingOperation !== "readLobby" && requestedLobbyIdRef.current !== lobbyId) {
      requestedLobbyIdRef.current = lobbyId;
      void read(lobbyId);
    }
  }, [lobby?.id, lobbyId, pendingOperation, read]);

  useEffect(() => {
    if (!accessToken || !lobbyId) {
      return;
    }

    let isActive = true;
    const connection = createLobbyHubConnection(accessToken);
    const joinLobbyUpdates = async () => {
      try {
        await joinLobbyHubGroup(connection, lobbyId);
      } catch {
        if (isActive) {
          setConnection({ status: "error", message: "Unable to subscribe to lobby updates." });
          showError({
            title: "Lobby updates unavailable",
            message: "Unable to subscribe to this lobby's updates.",
            displayMode: "toast",
          });
        }
      }
    };

    registerLobbyHubHandlers(connection, {
      onSnapshot: (nextLobby) => {
        if (isActive) {
          applyLobbySnapshot(nextLobby);
        }
      },
      onPlayerJoined: (nextLobby) => {
        if (isActive) {
          applyPlayerJoined(nextLobby);
        }
      },
      onPlayerJoinedPatch: (nextLobbyId, userId, joinedAtUtc) => {
        if (isActive) {
          applyPlayerJoinedPatch(nextLobbyId, userId, joinedAtUtc);
        }
      },
      onPlayerLeft: (nextLobby) => {
        if (isActive) {
          applyPlayerLeft(nextLobby);
        }
      },
      onPlayerLeftPatch: (nextLobbyId, userId) => {
        if (isActive) {
          applyPlayerLeftPatch(nextLobbyId, userId);
        }
      },
      onHostChanged: (hostUserId) => {
        if (isActive) {
          applyHostChanged(hostUserId);
        }
      },
      onStarted: (result) => {
        if (isActive) {
          if (result.lobby && result.initialState) {
            applyLobbyStarted({
              sessionId: result.sessionId,
              initialState: result.initialState,
              lobby: result.lobby,
            });
          }
          navigate(`/game/${result.sessionId}`);
        }
      },
      onClosed: (nextLobby) => {
        if (isActive) {
          applyLobbyClosed(nextLobby);
        }
      },
      onCancelled: (nextLobby) => {
        if (isActive) {
          applyLobbyCancelled(nextLobby);
        }
      },
      onConnectionStatus: (status) => {
        if (isActive) {
          setConnection({ status });
          if (status === "connected") {
            void joinLobbyUpdates();
          }
        }
      },
    });

    setConnection({ status: "connecting" });
    void connection
      .start()
      .then(async () => {
        if (isActive) {
          setConnection({ status: "connected" });
          await joinLobbyUpdates();
        }
      })
      .catch(() => {
        if (isActive) {
          setConnection({ status: "error", message: "Unable to connect to lobby updates." });
          showError({
            title: "Lobby updates unavailable",
            message: "Unable to connect to lobby updates.",
            displayMode: "toast",
          });
        }
      });

    return () => {
      isActive = false;
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
    applyPlayerJoinedPatch,
    applyPlayerLeft,
    applyPlayerLeftPatch,
    lobbyId,
    navigate,
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
        <div className="lobby-header__actions">
          <Badge tone={lobby.status === "Open" ? "success" : "warning"}>{lobby.status}</Badge>
          <LogoutButton />
        </div>
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
