import { apiBaseUrl } from "./apiConfig";
import { authenticatedRequestJson, HttpError } from "./httpClient";
import {
  mapBattleQuestion,
  mapBattleResult,
  type BattleQuestionDto,
  type BattleQuestionFallback,
  type BattleResultDto,
  type BattleResultFallback,
} from "../domain/battle/battleMappers";
import type {
  BattleQuestion,
  BattleResult,
  StartBattleAttemptRequest,
  StartSpecialFieldAttemptRequest,
  SubmitBattleAnswerRequest,
} from "../domain/battle/battleTypes";
import type { GameActionError } from "../domain/game/gameTypes";

type BattleRequestOptions = {
  accessToken: string;
};

export async function startBattleAttempt(
  gameSessionId: string,
  request: StartBattleAttemptRequest,
  options: BattleRequestOptions & { questionFallback: Omit<BattleQuestionFallback, "attemptKind"> },
): Promise<BattleQuestion> {
  const response = await authenticatedRequestJson<BattleQuestionDto, StartBattleAttemptRequest>(
    `${apiBaseUrl}/api/game-sessions/${gameSessionId}/battle-attempts`,
    {
      method: "POST",
      accessToken: options.accessToken,
      body: request,
    },
  );
  return mapBattleQuestion(response, { ...options.questionFallback, attemptKind: "Battle", gameSessionId });
}

export async function submitBattleAnswer(
  gameSessionId: string,
  battleAttemptId: string,
  request: SubmitBattleAnswerRequest,
  options: BattleRequestOptions & { resultFallback: Omit<BattleResultFallback, "attemptKind"> },
): Promise<BattleQuestion | BattleResult> {
  const response = await authenticatedRequestJson<BattleQuestionDto | BattleResultDto, SubmitBattleAnswerRequest>(
    `${apiBaseUrl}/api/game-sessions/${gameSessionId}/battle-attempts/${battleAttemptId}/answers`,
    {
      method: "POST",
      accessToken: options.accessToken,
      body: request,
    },
  );
  if ("questionText" in response || "answerOptions" in response) {
    return mapBattleQuestion(response, { ...options.resultFallback, attemptKind: "Battle", gameSessionId });
  }
  return mapBattleResult(response, { ...options.resultFallback, attemptKind: "Battle", gameSessionId, attemptId: battleAttemptId });
}

export async function startSpecialFieldAttempt(
  gameSessionId: string,
  request: StartSpecialFieldAttemptRequest,
  options: BattleRequestOptions & { questionFallback: Omit<BattleQuestionFallback, "attemptKind"> },
): Promise<BattleQuestion> {
  const response = await authenticatedRequestJson<BattleQuestionDto, StartSpecialFieldAttemptRequest>(
    `${apiBaseUrl}/api/game-sessions/${gameSessionId}/special-field-attempts`,
    {
      method: "POST",
      accessToken: options.accessToken,
      body: request,
    },
  );
  return mapBattleQuestion(response, { ...options.questionFallback, attemptKind: "SpecialField", gameSessionId });
}

export async function submitSpecialFieldAnswer(
  gameSessionId: string,
  specialFieldAttemptId: string,
  request: SubmitBattleAnswerRequest,
  options: BattleRequestOptions & { resultFallback: Omit<BattleResultFallback, "attemptKind"> },
): Promise<BattleQuestion | BattleResult> {
  const response = await authenticatedRequestJson<BattleQuestionDto | BattleResultDto, SubmitBattleAnswerRequest>(
    `${apiBaseUrl}/api/game-sessions/${gameSessionId}/special-field-attempts/${specialFieldAttemptId}/answers`,
    {
      method: "POST",
      accessToken: options.accessToken,
      body: request,
    },
  );
  if ("questionText" in response || "answerOptions" in response) {
    return mapBattleQuestion(response, { ...options.resultFallback, attemptKind: "SpecialField", gameSessionId });
  }
  return mapBattleResult(response, {
    ...options.resultFallback,
    attemptKind: "SpecialField",
    gameSessionId,
    attemptId: specialFieldAttemptId,
  });
}

export function normalizeBattleError(error: unknown): GameActionError {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      return { title: "Session expired", message: "Please sign in again.", displayMode: "modal" };
    }
    if (error.status === 403) {
      return { title: "Attempt unavailable", message: "You are not allowed to resolve this attempt.", displayMode: "toast" };
    }
    if (error.status === 404) {
      return { title: "Attempt unavailable", message: "The attempt could not be found.", displayMode: "toast" };
    }
    if (error.status === 400 || error.status === 409) {
      return {
        title: "Attempt unavailable",
        message: error.problem?.detail ?? error.problem?.title ?? "This attempt is not available.",
        displayMode: "toast",
      };
    }
    if (error.status >= 500) {
      return { title: "Attempt unavailable", message: "Question service is temporarily unavailable.", displayMode: "toast" };
    }
  }

  if (error instanceof TypeError) {
    return { title: "Network unavailable", message: "Unable to reach the backend API.", displayMode: "toast" };
  }

  if (error instanceof Error && /Battle gameplay|Battle question|Battle result/.test(error.message)) {
    return {
      title: "Battle problem",
      message: "The battle question could not be loaded safely. Waiting for a valid snapshot.",
      displayMode: "modal",
    };
  }

  return { title: "Attempt unavailable", message: "We could not complete that battle action.", displayMode: "toast" };
}
