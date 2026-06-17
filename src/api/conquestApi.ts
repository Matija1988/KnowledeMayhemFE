import { apiBaseUrl } from "./apiConfig";
import { authenticatedRequestJson, HttpError } from "./httpClient";
import {
  mapConquestResult,
  mapGameplayQuestion,
  type ConquestResultDto,
  type GameplayQuestionDto,
} from "../domain/conquest/conquestMappers";
import type {
  ConquestResult,
  GameplayQuestion,
  StartConquestAttemptRequest,
  SubmitConquestAnswerRequest,
} from "../domain/conquest/conquestTypes";
import type { GameActionError } from "../domain/game/gameTypes";

type ConquestRequestOptions = {
  accessToken: string;
};

export async function startConquestAttempt(
  gameSessionId: string,
  request: StartConquestAttemptRequest,
  options: ConquestRequestOptions,
): Promise<GameplayQuestion> {
  const response = await authenticatedRequestJson<GameplayQuestionDto, StartConquestAttemptRequest>(
    `${apiBaseUrl}/api/game-sessions/${gameSessionId}/conquest-attempts`,
    {
      method: "POST",
      accessToken: options.accessToken,
      body: request,
    },
  );
  return mapGameplayQuestion(response);
}

export async function submitConquestAnswer(
  questionAttemptId: string,
  request: SubmitConquestAnswerRequest,
  options: ConquestRequestOptions,
): Promise<ConquestResult> {
  const response = await authenticatedRequestJson<ConquestResultDto, SubmitConquestAnswerRequest>(
    `${apiBaseUrl}/api/question-attempts/${questionAttemptId}/answer`,
    {
      method: "POST",
      accessToken: options.accessToken,
      body: request,
    },
  );
  return mapConquestResult(response);
}

export function normalizeConquestError(error: unknown): GameActionError {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      return { title: "Session expired", message: "Please sign in again.", displayMode: "modal" };
    }
    if (error.status === 403) {
      return { title: "Conquest unavailable", message: "You are not allowed to resolve this question.", displayMode: "toast" };
    }
    if (error.status === 404) {
      return { title: "Conquest unavailable", message: "The question attempt could not be found.", displayMode: "toast" };
    }
    if (error.status === 400 || error.status === 409) {
      return {
        title: "Conquest unavailable",
        message: error.problem?.detail ?? error.problem?.title ?? "This conquest attempt is not available.",
        displayMode: "toast",
      };
    }
    if (error.status >= 500) {
      return { title: "Conquest unavailable", message: "Question service is temporarily unavailable.", displayMode: "toast" };
    }
  }

  if (error instanceof TypeError) {
    return { title: "Network unavailable", message: "Unable to reach the backend API.", displayMode: "toast" };
  }

  if (error instanceof Error && /Gameplay conquest|Gameplay question|Conquest result/.test(error.message)) {
    return {
      title: "Game board problem",
      message: "The question could not be loaded safely. Waiting for a valid snapshot.",
      displayMode: "modal",
    };
  }

  return { title: "Conquest unavailable", message: "We could not complete that question action.", displayMode: "toast" };
}

