import { createAuthError } from "../domain/auth";
import {
  mapCurrentUserProfile,
  toChangePasswordDto,
  toDeactivateAccountDto,
  toUpdateAccountIdentityDto,
  type AccountDeactivationResponseDto,
  type ChangePasswordRequestDto,
  type CurrentUserProfileDto,
  type DeactivateAccountRequestDto,
  type PasswordChangeResponseDto,
  type UpdateAccountIdentityRequestDto,
} from "../domain/accountSettings/accountSettingsMappers";
import type {
  AccountDeactivationResult,
  AccountSettingsError,
  ChangePasswordRequest,
  CurrentUserProfile,
  DeactivateAccountRequest,
  PasswordChangeResult,
  UpdateAccountIdentityRequest,
} from "../domain/accountSettings/accountSettingsTypes";
import { apiBaseUrl } from "./apiConfig";
import { authenticatedRequestJson, HttpError } from "./httpClient";

const accountSettingsBaseUrl = `${apiBaseUrl}/api/identity/users/me`;

export async function getCurrentUserProfile(accessToken: string): Promise<CurrentUserProfile> {
  const response = await authenticatedRequestJson<CurrentUserProfileDto>(accountSettingsBaseUrl, {
    method: "GET",
    accessToken,
    retryOnNetworkError: false,
  });
  return mapCurrentUserProfile(response);
}

export async function updateAccountIdentity(
  accessToken: string,
  request: UpdateAccountIdentityRequest,
): Promise<CurrentUserProfile> {
  const response = await authenticatedRequestJson<CurrentUserProfileDto, UpdateAccountIdentityRequestDto>(
    accountSettingsBaseUrl,
    {
      method: "PUT",
      accessToken,
      body: toUpdateAccountIdentityDto(request),
      retryOnNetworkError: false,
    },
  );
  return mapCurrentUserProfile(response);
}

export async function changeCurrentUserPassword(
  accessToken: string,
  request: ChangePasswordRequest,
): Promise<PasswordChangeResult> {
  return authenticatedRequestJson<PasswordChangeResponseDto, ChangePasswordRequestDto>(
    `${accountSettingsBaseUrl}/password`,
    {
      method: "PUT",
      accessToken,
      body: toChangePasswordDto(request),
      retryOnNetworkError: false,
    },
  );
}

export async function deactivateCurrentUser(
  accessToken: string,
  request: DeactivateAccountRequest,
): Promise<AccountDeactivationResult> {
  return authenticatedRequestJson<AccountDeactivationResponseDto, DeactivateAccountRequestDto>(
    `${accountSettingsBaseUrl}/deactivation`,
    {
      method: "POST",
      accessToken,
      body: toDeactivateAccountDto(request),
      retryOnNetworkError: false,
    },
  );
}

export function normalizeAccountSettingsError(error: unknown): AccountSettingsError {
  if (error instanceof HttpError) {
    const detail = error.problem?.detail;
    const code = error.problem?.code;

    if (error.status === 401) {
      return { title: "Session expired", message: "Please sign in again.", isSessionInvalid: true };
    }

    if (error.status === 403) {
      return { title: "Account unavailable", message: "This account is inactive.", isSessionInvalid: true };
    }

    if (code === "identity.user.duplicate-username") {
      return { title: "Username unavailable", message: "Username is already taken.", field: "username" };
    }

    if (code === "identity.user.duplicate-email") {
      return { title: "Email unavailable", message: "Email is already in use.", field: "email" };
    }

    if (code === "identity.auth.invalid-current-password") {
      return { title: "Password problem", message: "Current password is incorrect.", field: "currentPassword" };
    }

    if (code === "identity.validation.deactivation-confirmation-invalid") {
      return { title: "Confirmation required", message: "Enter DEACTIVATE exactly as shown.", field: "confirmationText" };
    }

    if (error.status === 429) {
      return { title: "Slow down", message: "Too many requests. Wait a moment and try again." };
    }

    return { title: "Account settings problem", message: detail ?? "The account settings request could not be completed." };
  }

  if (error instanceof TypeError) {
    return { title: "Connection problem", message: "Unable to reach the backend API." };
  }

  return createAuthError("The account settings request could not be completed.", "toast", "Account settings problem");
}
