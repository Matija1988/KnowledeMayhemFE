import type {
  AccountDeactivationResult,
  ChangePasswordRequest,
  CurrentUserProfile,
  DeactivateAccountRequest,
  PasswordChangeResult,
  UpdateAccountIdentityRequest,
} from "./accountSettingsTypes";

export type CurrentUserProfileDto = CurrentUserProfile & {
  password?: unknown;
  passwordHash?: unknown;
  accessToken?: unknown;
  token?: unknown;
};

export type UpdateAccountIdentityRequestDto = UpdateAccountIdentityRequest;
export type ChangePasswordRequestDto = ChangePasswordRequest;
export type DeactivateAccountRequestDto = DeactivateAccountRequest;
export type PasswordChangeResponseDto = PasswordChangeResult;
export type AccountDeactivationResponseDto = AccountDeactivationResult;

export function mapCurrentUserProfile(dto: CurrentUserProfileDto): CurrentUserProfile {
  if (!dto.id || !dto.username || !dto.email || !dto.roleId || !dto.role || !dto.createdAt) {
    throw new Error("Current user profile response was incomplete.");
  }

  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    roleId: dto.roleId,
    role: dto.role,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? null,
    isActive: Boolean(dto.isActive),
    deactivatedAt: dto.deactivatedAt ?? null,
  };
}

export function toUpdateAccountIdentityDto(request: UpdateAccountIdentityRequest): UpdateAccountIdentityRequestDto {
  return {
    username: request.username.trim(),
    email: request.email.trim(),
  };
}

export function toChangePasswordDto(request: ChangePasswordRequest): ChangePasswordRequestDto {
  return {
    currentPassword: request.currentPassword,
    newPassword: request.newPassword,
    confirmNewPassword: request.confirmNewPassword,
  };
}

export function toDeactivateAccountDto(request: DeactivateAccountRequest): DeactivateAccountRequestDto {
  return {
    password: request.password,
    confirmationText: request.confirmationText,
  };
}
