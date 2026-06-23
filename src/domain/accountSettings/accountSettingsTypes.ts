import type { LogoutGameOutcome, LogoutLobbyOutcome } from "../auth";

export type CurrentUserProfile = {
  id: string;
  username: string;
  email: string;
  roleId: string;
  role: string;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  deactivatedAt: string | null;
};

export type UpdateAccountIdentityRequest = {
  username: string;
  email: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type DeactivateAccountRequest = {
  password: string;
  confirmationText: string;
};

export type PasswordChangeResult = {
  status: string;
  changedAtUtc: string;
  otherSessionsRevoked: boolean;
};

export type AccountDeactivationResult = {
  status: string;
  deactivatedAtUtc: string;
  sessionInvalidated: boolean;
  lobby: LogoutLobbyOutcome | null;
  game: LogoutGameOutcome | null;
};

export type AccountSettingsError = {
  title: string;
  message: string;
  field?: "username" | "email" | "currentPassword" | "newPassword" | "confirmNewPassword" | "password" | "confirmationText";
  isSessionInvalid?: boolean;
};
