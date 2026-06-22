import { createAuthError, type AuthError, type LoginCredentials, type LoginResponse, type LogoutResponse } from "../domain/auth";
import { authenticatedRequestJson, HttpError, requestJson } from "./httpClient";
import { apiBaseUrl } from "./apiConfig";

export type LoginRequestDto = LoginCredentials;
export type LoginResponseDto = LoginResponse;
export type LogoutResponseDto = LogoutResponse;

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

export async function logout(accessToken: string): Promise<LogoutResponseDto> {
  const url = `${apiBaseUrl}/api/identity/logout`;
  return authenticatedRequestJson<LogoutResponseDto>(url, {
    method: "POST",
    accessToken,
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

export function normalizeLogoutError(error: unknown): AuthError {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      return createAuthError("Your session is already signed out locally.", "toast", "Session ended");
    }

    if (error.status === 429) {
      return createAuthError("Too many logout attempts. Wait a moment and try again.", "toast", "Logout delayed");
    }

    if (error.status >= 500) {
      return createAuthError("Logout is temporarily unavailable. Try again shortly.", "modal", "Logout problem");
    }

    if (error.status === 0) {
      return createAuthError(corsNetworkMessage, "toast", "Logout problem");
    }
  }

  if (error instanceof TypeError) {
    return createAuthError(corsNetworkMessage, "toast", "Logout problem");
  }

  return createAuthError("We could not complete logout. Check your connection and try again.", "toast", "Logout problem");
}
