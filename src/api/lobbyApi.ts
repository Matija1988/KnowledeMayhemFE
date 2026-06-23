import { apiBaseUrl } from "./apiConfig";
import { authenticatedRequestJson, HttpError } from "./httpClient";
import {
  mapActiveLobbyConflict,
  mapCancelLobbyResult,
  mapLeaveLobbyResult,
  mapLobby,
  mapStartLobbyResult,
  normalizeJoinCode,
  type ActiveLobbyConflictDto,
  type CancelLobbyResultDto,
  type LeaveLobbyResultDto,
  type LobbyDto,
  type StartLobbyResultDto,
} from "../domain/lobby/lobbyMappers";
import type {
  CancelLobbyResult,
  LeaveLobbyResult,
  Lobby,
  LobbyActionError,
  PieceColor,
  StartLobbyResult,
} from "../domain/lobby/lobbyTypes";

type LobbyRequestOptions = {
  accessToken: string;
};

export async function createLobby(maxPlayers: number, options: LobbyRequestOptions): Promise<Lobby> {
  const response = await authenticatedRequestJson<LobbyDto, { maxPlayers: number }>(`${apiBaseUrl}/api/lobbies/`, {
    method: "POST",
    accessToken: options.accessToken,
    body: { maxPlayers },
  });
  return mapLobby(response);
}

export async function joinLobby(code: string, options: LobbyRequestOptions): Promise<Lobby> {
  const response = await authenticatedRequestJson<LobbyDto, { code: string }>(`${apiBaseUrl}/api/lobbies/join`, {
    method: "POST",
    accessToken: options.accessToken,
    body: { code: normalizeJoinCode(code) },
  });
  return mapLobby(response);
}

export async function getLobby(lobbyId: string, options: LobbyRequestOptions): Promise<Lobby> {
  const response = await authenticatedRequestJson<LobbyDto>(`${apiBaseUrl}/api/lobbies/${lobbyId}`, {
    accessToken: options.accessToken,
  });
  return mapLobby(response);
}

export async function leaveLobby(lobbyId: string, options: LobbyRequestOptions): Promise<LeaveLobbyResult> {
  const response = await authenticatedRequestJson<LeaveLobbyResultDto>(`${apiBaseUrl}/api/lobbies/${lobbyId}/leave`, {
    method: "POST",
    accessToken: options.accessToken,
  });
  return mapLeaveLobbyResult(response);
}

export async function cancelLobby(lobbyId: string, options: LobbyRequestOptions): Promise<CancelLobbyResult> {
  const response = await authenticatedRequestJson<CancelLobbyResultDto>(
    `${apiBaseUrl}/api/lobbies/${lobbyId}/cancel`,
    {
      method: "POST",
      accessToken: options.accessToken,
    },
  );
  return mapCancelLobbyResult(response);
}

export async function updateLobbyCategories(
  lobbyId: string,
  categoryIds: string[],
  options: LobbyRequestOptions,
): Promise<Lobby> {
  const response = await authenticatedRequestJson<LobbyDto, { categoryIds: string[] }>(
    `${apiBaseUrl}/api/lobbies/${lobbyId}/setup/categories`,
    {
      method: "PUT",
      accessToken: options.accessToken,
      body: { categoryIds },
    },
  );
  return mapLobby(response);
}

export async function selectLobbyPieceColor(
  lobbyId: string,
  pieceColor: PieceColor,
  options: LobbyRequestOptions,
): Promise<Lobby> {
  const response = await authenticatedRequestJson<LobbyDto, { pieceColor: PieceColor }>(
    `${apiBaseUrl}/api/lobbies/${lobbyId}/setup/color`,
    {
      method: "PUT",
      accessToken: options.accessToken,
      body: { pieceColor },
    },
  );
  return mapLobby(response);
}

export async function setLobbyReady(
  lobbyId: string,
  isReady: boolean,
  setupVersion: number,
  options: LobbyRequestOptions,
): Promise<Lobby> {
  const response = await authenticatedRequestJson<LobbyDto, { isReady: boolean; setupVersion: number }>(
    `${apiBaseUrl}/api/lobbies/${lobbyId}/setup/ready`,
    {
      method: "PUT",
      accessToken: options.accessToken,
      body: { isReady, setupVersion },
    },
  );
  return mapLobby(response);
}

export async function startLobby(
  lobbyId: string,
  setupVersionOrOptions: number | LobbyRequestOptions,
  maybeOptions?: LobbyRequestOptions,
): Promise<StartLobbyResult> {
  const setupVersion = typeof setupVersionOrOptions === "number" ? setupVersionOrOptions : undefined;
  const options = typeof setupVersionOrOptions === "number" ? maybeOptions : setupVersionOrOptions;
  if (!options) {
    throw new Error("Lobby start request is missing authentication options.");
  }

  const response = await authenticatedRequestJson<StartLobbyResultDto>(`${apiBaseUrl}/api/lobbies/${lobbyId}/start`, {
    method: "POST",
    accessToken: options.accessToken,
    body: setupVersion === undefined ? undefined : { setupVersion },
  });
  return mapStartLobbyResult(response);
}

export function normalizeLobbyError(error: unknown): LobbyActionError {
  if (error instanceof HttpError) {
    const activeConflict = tryMapActiveLobbyConflict(error.problem as ActiveLobbyConflictDto | null);

    if (activeConflict.lobby || activeConflict.lobbyId) {
      return {
        title: "Active lobby found",
        message: activeConflict.message ?? "You already have an active lobby.",
        displayMode: "toast",
        code: error.problem?.code,
        activeLobby: activeConflict.lobby ?? null,
        activeLobbyId: activeConflict.lobbyId ?? null,
      };
    }

    if (error.status === 401) {
      return createLobbyError("Please sign in again.", "Session expired", "toast", error.problem?.code);
    }
    if (error.status === 403) {
      return createLobbyError("Only the lobby host can do that.", "Lobby problem", "toast", error.problem?.code);
    }
    if (error.status === 404) {
      return createLobbyError("Lobby not found.", "Lobby problem", "toast", error.problem?.code);
    }
    if (error.status === 409) {
      return createLobbyError(error.problem?.detail ?? error.problem?.title ?? "This lobby is not available.", "Lobby problem", "toast", error.problem?.code);
    }
    if (error.status >= 500) {
      return createLobbyError("Lobby service is temporarily unavailable. Try again shortly.", "Lobby unavailable", "modal", error.problem?.code);
    }
  }

  if (error instanceof TypeError) {
    return createLobbyError(
      "Unable to reach the backend API. Check that the frontend origin is allowed by the backend CORS configuration and that VITE_API_BASE_URL is correct.",
    );
  }

  return createLobbyError("We could not complete that lobby action. Try again.");
}

function tryMapActiveLobbyConflict(problem: ActiveLobbyConflictDto | null) {
  if (!problem) {
    return {};
  }

  try {
    return mapActiveLobbyConflict(problem);
  } catch {
    return {};
  }
}

function createLobbyError(
  message: string,
  title = "Lobby problem",
  displayMode: LobbyActionError["displayMode"] = "toast",
  code?: string,
): LobbyActionError {
  return { title, message, displayMode, code };
}
