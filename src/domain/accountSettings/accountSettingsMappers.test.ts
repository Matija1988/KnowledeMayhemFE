import { describe, expect, it } from "vitest";
import {
  mapCurrentUserProfile,
  toChangePasswordDto,
  toDeactivateAccountDto,
  toUpdateAccountIdentityDto,
} from "./accountSettingsMappers";

describe("accountSettingsMappers", () => {
  it("maps sanitized current-user profile fields and drops sensitive extras", () => {
    const profile = mapCurrentUserProfile({
      id: "user-1",
      username: "alice",
      email: "alice@example.com",
      roleId: "role-1",
      role: "Player",
      createdAt: "2026-06-23T09:00:00Z",
      updatedAt: null,
      isActive: true,
      deactivatedAt: null,
      passwordHash: "do-not-render",
      accessToken: "do-not-render",
    });

    expect(profile).toEqual({
      id: "user-1",
      username: "alice",
      email: "alice@example.com",
      roleId: "role-1",
      role: "Player",
      createdAt: "2026-06-23T09:00:00Z",
      updatedAt: null,
      isActive: true,
      deactivatedAt: null,
    });
    expect(profile).not.toHaveProperty("passwordHash");
    expect(profile).not.toHaveProperty("accessToken");
  });

  it("normalizes outgoing request DTOs", () => {
    expect(toUpdateAccountIdentityDto({ username: " alice ", email: " alice@example.com " })).toEqual({
      username: "alice",
      email: "alice@example.com",
    });
    expect(
      toChangePasswordDto({
        currentPassword: "OldP@ss1",
        newPassword: "NewP@ss1",
        confirmNewPassword: "NewP@ss1",
      }),
    ).toEqual({
      currentPassword: "OldP@ss1",
      newPassword: "NewP@ss1",
      confirmNewPassword: "NewP@ss1",
    });
    expect(toDeactivateAccountDto({ password: "P@ssword1!", confirmationText: "DEACTIVATE" })).toEqual({
      password: "P@ssword1!",
      confirmationText: "DEACTIVATE",
    });
  });
});
