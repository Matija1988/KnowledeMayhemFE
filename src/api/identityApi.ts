import { createAuthError, type AuthError, type LoginCredentials, type LoginResponse } from "../domain/auth";
import { HttpError, requestJson } from "./httpClient";
import { API_BASE } from "../constants/constant";

export type LoginRequestDto = LoginCredentials;
export type LoginResponseDto = LoginResponse;

export async function login(request: LoginRequestDto): Promise<LoginResponseDto> {
  const url = `${API_BASE}api/identity/login`;
  return requestJson<LoginResponseDto, LoginRequestDto>(url, {
    method: "POST",
    body: request,
    retryOnNetworkError: false,
  });
}

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
  }

  return createAuthError("We could not sign you in. Check your connection and try again.");
}
