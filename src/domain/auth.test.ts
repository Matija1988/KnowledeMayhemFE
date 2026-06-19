import { describe, expect, it } from "vitest";
import {
  canAccessQuestionBank,
  canManageCategories,
  createLoggedOutSession,
  getDefaultAuthenticatedPath,
  getHighestRecognizedRole,
  getUserRoleFromJwt,
  getUserIdFromJwt,
  hasLoginFieldErrors,
  isJwtExpired,
  mapLoginResponse,
  validateLoginCredentials,
} from "./auth";
import { expiredJwt, loginResponse, validCredentials } from "../tests/fixtures/authFixtures";

describe("auth domain", () => {
  it("maps a login response into an authenticated session", () => {
    expect(mapLoginResponse(loginResponse)).toEqual({
      accessToken: "test-access-token",
      isAuthenticated: true,
      invalidReason: null,
    });
  });

  it("validates required credentials", () => {
    expect(hasLoginFieldErrors(validateLoginCredentials({ usernameOrEmail: "", password: "" }))).toBe(true);
    expect(validateLoginCredentials(validCredentials)).toEqual({});
  });

  it("detects expired JWT payloads without rejecting opaque test tokens", () => {
    expect(isJwtExpired(expiredJwt())).toBe(true);
    expect(isJwtExpired("opaque-token")).toBe(false);
  });

  it("extracts a stable user id from common JWT claims", () => {
    const payload = btoa(JSON.stringify({ sub: "user-1" })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    expect(getUserIdFromJwt(`header.${payload}.signature`)).toBe("user-1");
    expect(getUserIdFromJwt("opaque-token")).toBeNull();
  });

  it("prefers explicit user id claims over subject display claims", () => {
    const payload = btoa(
      JSON.stringify({
        sub: "player2@example.test",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier":
          "3865bd26-00ce-4da1-abbf-e6c49a4f8782",
      }),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    expect(getUserIdFromJwt(`header.${payload}.signature`)).toBe("3865bd26-00ce-4da1-abbf-e6c49a4f8782");
  });

  it("extracts the highest recognized management role from JWT claims", () => {
    expect(getUserRoleFromJwt(jwtWithPayload({ role: "player" }))).toBe("Player");
    expect(getUserRoleFromJwt(jwtWithPayload({ roles: ["Player", "Moderator"] }))).toBe("Moderator");
    expect(getUserRoleFromJwt(jwtWithPayload({ role: "Admin" }))).toBe("Admin");
    expect(getUserRoleFromJwt(jwtWithPayload({ role: "Player Admin" }))).toBe("Admin");
    expect(getUserRoleFromJwt(jwtWithPayload({ role: "Player,Admin" }))).toBe("Admin");
    expect(getUserRoleFromJwt(jwtWithPayload({ authorities: [{ authority: "Admin" }] }))).toBe("Admin");
    expect(
      getUserRoleFromJwt(
        jwtWithPayload({
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": ["Player", "Admin"],
        }),
      ),
    ).toBe("Admin");
    expect(getHighestRecognizedRole(["unknown"])).toBe("Player");
  });

  it("derives management capabilities from roles", () => {
    expect(canAccessQuestionBank("Moderator")).toBe(true);
    expect(canAccessQuestionBank("Player")).toBe(false);
    expect(canManageCategories("Admin")).toBe(true);
    expect(canManageCategories("Moderator")).toBe(false);
  });

  it("selects the default authenticated destination from the token role", () => {
    expect(getDefaultAuthenticatedPath(jwtWithPayload({ role: "Admin" }))).toBe("/admin/question-bank");
    expect(getDefaultAuthenticatedPath(jwtWithPayload({ role: "Moderator" }))).toBe("/admin/question-bank");
    expect(getDefaultAuthenticatedPath(jwtWithPayload({ role: "Player" }))).toBe("/lobby");
  });

  it("creates logged-out sessions with invalid reasons", () => {
    expect(createLoggedOutSession("invalid-saved-session")).toEqual({
      accessToken: null,
      isAuthenticated: false,
      invalidReason: "invalid-saved-session",
    });
  });
});

function jwtWithPayload(payload: Record<string, unknown>): string {
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `header.${encodedPayload}.signature`;
}
