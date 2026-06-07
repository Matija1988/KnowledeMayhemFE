import { createAuthError, type AuthError, type LoginCredentials, type LoginResponse } from "../domain/auth";
import { HttpError, requestJson } from "./httpClient";
import { apiBaseUrl } from "./apiConfig";

export type LoginRequestDto = LoginCredentials;
export type LoginResponseDto = LoginResponse;

export async function login(request: LoginRequestDto): Promise<LoginResponseDto> {
  const url = `${apiBaseUrl}/api/identity/login`;
  return requestJson<LoginResponseDto, LoginRequestDto>(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    credentials: "omit",
    body: request,
    retryOnNetworkError: false,
  });
}

const corsNetworkMessage =
  "Unable to reach the backend API. Check your connection and ensure the backend URL is correct.";

export function normalizeIdentityError(error: unknown): AuthError {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      return createAuthError("Invalid username/email or password.");
    }

    if (error.status === 400) {
      return createAuthError("Check your username/email and password, then try again.");
    }

    if (error.status === 429) {
      return createAuthError("Too many sign-in attempts. Wait a moment and try again.");
    }

    if (error.status >= 500) {
      return createAuthError("Sign-in is temporarily unavailable. Try again shortly.", "modal");
    }

    if (error.status === 0) {
      return createAuthError(corsNetworkMessage);
    }
  }

  if (error instanceof TypeError) {
    return createAuthError(corsNetworkMessage);
  }

  return createAuthError("We could not sign you in. Check your connection and try again.");
}
