import { apiBaseUrl } from "./apiConfig";
import { authenticatedRequestJson, HttpError } from "./httpClient";
import { mapGameActionResult, mapGameSession, mapTurnState, type GameActionResultDto, type GameSessionDto, type TurnStateDto } from "../domain/game/gameMappers";
import type { GameActionError, GameActionResult, GameCompletionSummary, GameSession, MovePieceRequest, TurnState } from "../domain/game/gameTypes";

type GameRequestOptions = {
  accessToken: string;
};

export async function getGameSession(gameSessionId: string, options: GameRequestOptions): Promise<GameSession> {
  const response = await authenticatedRequestJson<GameSessionDto>(`${apiBaseUrl}/api/game-sessions/${gameSessionId}`, {
    accessToken: options.accessToken,
  });
  return mapGameSession(response);
}

export async function getGameTurn(gameSessionId: string, options: GameRequestOptions): Promise<TurnState> {
  const response = await authenticatedRequestJson<TurnStateDto>(`${apiBaseUrl}/api/game-sessions/${gameSessionId}/turn`, {
    accessToken: options.accessToken,
  });
  return mapTurnState(response);
}

export async function getGameCompletionSummary(
  gameSessionId: string,
  options: GameRequestOptions,
): Promise<GameCompletionSummary> {
  const summary = await authenticatedRequestJson<GameCompletionSummary>(
    `${apiBaseUrl}/api/game-sessions/${gameSessionId}/completion-summary`,
    { accessToken: options.accessToken },
  );

  if (!summary.gameSessionId || !summary.winnerPlayerId || !summary.endedAtUtc || !Array.isArray(summary.players)) {
    throw new Error("Game completion summary response is malformed.");
  }

  return summary;
}

export async function movePiece(
  gameSessionId: string,
  request: MovePieceRequest,
  options: GameRequestOptions,
): Promise<GameActionResult> {
  const response = await authenticatedRequestJson<GameActionResultDto, MovePieceRequest>(
    `${apiBaseUrl}/api/game-sessions/${gameSessionId}/moves`,
    {
      method: "POST",
      accessToken: options.accessToken,
      body: request,
    },
  );
  return mapGameActionResult(response);
}

export function normalizeGameError(error: unknown): GameActionError {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      return createGameError("Please sign in again.", "Session expired");
    }
    if (error.status === 403) {
      return createGameError("You are not allowed to perform that game action.");
    }
    if (error.status === 404) {
      return createGameError("Game session not found.", "Game unavailable", "modal");
    }
    if (error.status === 409 || error.status === 400) {
      return createGameError(error.problem?.detail ?? error.problem?.title ?? "That move is not legal right now.");
    }
    if (error.status >= 500) {
      return createGameError("Game service is temporarily unavailable. Try again shortly.", "Game unavailable", "modal");
    }
  }

  if (error instanceof TypeError) {
    return createGameError(
      "Unable to reach the backend API. Check that the frontend origin is allowed by the backend CORS configuration and that VITE_API_BASE_URL is correct.",
    );
  }

  if (error instanceof Error && /Game session response/.test(error.message)) {
    return createGameError("The game board could not be loaded safely. Waiting for a valid snapshot.", "Game board problem", "modal");
  }

  return createGameError("We could not complete that game action. Try again.");
}

function createGameError(
  message: string,
  title = "Game problem",
  displayMode: GameActionError["displayMode"] = "toast",
): GameActionError {
  return { title, message, displayMode };
}
