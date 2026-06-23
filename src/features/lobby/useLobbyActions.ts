import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  cancelLobby,
  createLobby,
  getLobby,
  joinLobby,
  leaveLobby,
  normalizeLobbyError,
  selectLobbyPieceColor,
  startLobby,
  setLobbyReady,
  updateLobbyCategories,
} from "../../api/lobbyApi";
import { normalizeJoinCode } from "../../domain/lobby/lobbyMappers";
import { useAuthStore } from "../../stores/authStore";
import { useErrorStore } from "../../stores/errorStore";
import { useLoadingStore } from "../../stores/loadingStore";
import { useLobbyStore } from "../../stores/lobbyStore";
import type { PieceColor } from "../../domain/lobby/lobbyTypes";

export function useLobbyActions() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const showError = useErrorStore((state) => state.showError);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const isLoading = useLoadingStore((state) => state.isLoading);
  const setCurrentLobby = useLobbyStore((state) => state.setCurrentLobby);
  const currentLobby = useLobbyStore((state) => state.currentLobby);
  const clearLobby = useLobbyStore((state) => state.clearLobby);
  const beginOperation = useLobbyStore((state) => state.beginOperation);
  const endOperation = useLobbyStore((state) => state.endOperation);
  const applyLobbyStarted = useLobbyStore((state) => state.applyLobbyStarted);
  const [joinCodeError, setJoinCodeError] = useState<string | null>(null);

  async function create(maxPlayers = 4): Promise<boolean> {
    return runLobbyAction("createLobby", async () => {
      const lobby = await createLobby(maxPlayers, requireToken(accessToken));
      setCurrentLobby(lobby);
      navigate(`/lobby/${lobby.id}`);
    });
  }

  async function join(code: string): Promise<boolean> {
    const normalizedCode = normalizeJoinCode(code);
    if (!normalizedCode) {
      setJoinCodeError("Enter a lobby code.");
      return false;
    }
    setJoinCodeError(null);

    return runLobbyAction("joinLobby", async () => {
      const lobby = await joinLobby(normalizedCode, requireToken(accessToken));
      setCurrentLobby(lobby);
      navigate(`/lobby/${lobby.id}`);
    });
  }

  async function read(lobbyId: string): Promise<boolean> {
    return runLobbyAction("readLobby", async () => {
      setCurrentLobby(await getLobby(lobbyId, requireToken(accessToken)));
    });
  }

  async function leave(lobbyId: string): Promise<boolean> {
    return runLobbyAction("leaveLobby", async () => {
      const result = await leaveLobby(lobbyId, requireToken(accessToken));
      if (result.lobby) {
        setCurrentLobby(result.lobby);
      }
      clearLobby();
      navigate("/lobby");
    });
  }

  async function cancel(lobbyId: string): Promise<boolean> {
    return runLobbyAction("cancelLobby", async () => {
      await cancelLobby(lobbyId, requireToken(accessToken));
      clearLobby();
      showError({ title: "Lobby cancelled", message: "Lobby cancelled.", displayMode: "toast" });
      navigate("/lobby");
    });
  }

  async function start(lobbyId: string): Promise<boolean> {
    return runLobbyAction("startLobby", async () => {
      const result = await startLobby(lobbyId, currentLobby?.setupVersion ?? 0, requireToken(accessToken));
      applyLobbyStarted(result);
      navigate(`/game/${result.sessionId}`);
    });
  }

  async function updateCategories(lobbyId: string, categoryIds: string[]): Promise<boolean> {
    return runLobbyAction("updateCategories", async () => {
      setCurrentLobby(await updateLobbyCategories(lobbyId, categoryIds, requireToken(accessToken)));
    });
  }

  async function selectColor(lobbyId: string, pieceColor: PieceColor): Promise<boolean> {
    return runLobbyAction("selectPieceColor", async () => {
      setCurrentLobby(await selectLobbyPieceColor(lobbyId, pieceColor, requireToken(accessToken)));
    });
  }

  async function setReady(lobbyId: string, isReady: boolean, setupVersion: number): Promise<boolean> {
    return runLobbyAction("setReady", async () => {
      setCurrentLobby(await setLobbyReady(lobbyId, isReady, setupVersion, requireToken(accessToken)));
    });
  }

  async function runLobbyAction(operation: Parameters<typeof beginOperation>[0], action: () => Promise<void>) {
    if (isLoading) {
      return false;
    }

    beginOperation(operation);
    showLoading(operation);
    try {
      await action();
      return true;
    } catch (error) {
      const normalized = normalizeLobbyError(error);
      if (normalized.activeLobby) {
        setCurrentLobby(normalized.activeLobby);
        navigate(`/lobby/${normalized.activeLobby.id}`);
        return true;
      }
      if (normalized.activeLobbyId) {
        navigate(`/lobby/${normalized.activeLobbyId}`);
        return true;
      }
      if (normalized.code === "matchmaking.setup.stale-version" && currentLobby) {
        setCurrentLobby(await getLobby(currentLobby.id, requireToken(accessToken)));
        showError({
          title: "Lobby setup changed",
          message: "Lobby setup was updated. Review the latest setup and try again.",
          displayMode: "toast",
        });
        return false;
      }
      showError(normalized);
      return false;
    } finally {
      hideLoading();
      endOperation();
    }
  }

  return { create, join, read, leave, cancel, start, updateCategories, selectColor, setReady, joinCodeError };
}

function requireToken(accessToken: string | null): { accessToken: string } {
  if (!accessToken) {
    throw new Error("Authentication required.");
  }

  return { accessToken };
}
