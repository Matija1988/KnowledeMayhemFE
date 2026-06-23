import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import {
  changeCurrentUserPassword,
  deactivateCurrentUser,
  getCurrentUserProfile,
  normalizeAccountSettingsError,
  updateAccountIdentity,
} from "./accountSettingsApi";
import { HttpError } from "./httpClient";
import { server } from "../tests/setup";

const profileResponse = {
  id: "user-1",
  username: "alice",
  email: "alice@example.com",
  roleId: "role-1",
  role: "Player",
  createdAt: "2026-06-23T09:00:00Z",
  updatedAt: null,
  isActive: true,
  deactivatedAt: null,
};

describe("accountSettingsApi", () => {
  it("calls account settings endpoints with bearer auth", async () => {
    const requested: string[] = [];
    server.use(
      http.get("**/api/identity/users/me", ({ request }) => {
        requested.push(request.headers.get("Authorization") ?? "");
        return HttpResponse.json(profileResponse);
      }),
      http.put("**/api/identity/users/me", async ({ request }) => {
        requested.push(request.headers.get("Authorization") ?? "");
        expect(await request.json()).toEqual({ username: "alice-updated", email: "alice.updated@example.com" });
        return HttpResponse.json({ ...profileResponse, username: "alice-updated", email: "alice.updated@example.com" });
      }),
      http.put("**/api/identity/users/me/password", async ({ request }) => {
        requested.push(request.headers.get("Authorization") ?? "");
        expect(await request.json()).toEqual({
          currentPassword: "OldP@ss1",
          newPassword: "NewP@ss1",
          confirmNewPassword: "NewP@ss1",
        });
        return HttpResponse.json({ status: "changed", changedAtUtc: "2026-06-23T09:05:00Z", otherSessionsRevoked: true });
      }),
      http.post("**/api/identity/users/me/deactivation", async ({ request }) => {
        requested.push(request.headers.get("Authorization") ?? "");
        expect(await request.json()).toEqual({ password: "P@ssword1!", confirmationText: "DEACTIVATE" });
        return HttpResponse.json({
          status: "deactivated",
          deactivatedAtUtc: "2026-06-23T09:10:00Z",
          sessionInvalidated: true,
          lobby: null,
          game: null,
        });
      }),
    );

    await expect(getCurrentUserProfile("token")).resolves.toMatchObject({ username: "alice" });
    await expect(
      updateAccountIdentity("token", { username: " alice-updated ", email: " alice.updated@example.com " }),
    ).resolves.toMatchObject({ username: "alice-updated" });
    await expect(
      changeCurrentUserPassword("token", {
        currentPassword: "OldP@ss1",
        newPassword: "NewP@ss1",
        confirmNewPassword: "NewP@ss1",
      }),
    ).resolves.toMatchObject({ otherSessionsRevoked: true });
    await expect(deactivateCurrentUser("token", { password: "P@ssword1!", confirmationText: "DEACTIVATE" })).resolves.toMatchObject({
      sessionInvalidated: true,
    });
    expect(requested).toEqual(["Bearer token", "Bearer token", "Bearer token", "Bearer token"]);
  });

  it("normalizes account settings errors", () => {
    expect(normalizeAccountSettingsError(new HttpError(401, null)).isSessionInvalid).toBe(true);
    expect(normalizeAccountSettingsError(new HttpError(409, { code: "identity.user.duplicate-username" })).message).toBe(
      "Username is already taken.",
    );
    expect(normalizeAccountSettingsError(new HttpError(400, { code: "identity.auth.invalid-current-password" })).field).toBe(
      "currentPassword",
    );
    expect(normalizeAccountSettingsError(new HttpError(400, { code: "identity.validation.deactivation-confirmation-invalid" })).field).toBe(
      "confirmationText",
    );
  });
});
