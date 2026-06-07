import { describe, expect, it } from "vitest";
import {
  createLoggedOutSession,
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

  it("creates logged-out sessions with invalid reasons", () => {
    expect(createLoggedOutSession("invalid-saved-session")).toEqual({
      accessToken: null,
      isAuthenticated: false,
      invalidReason: "invalid-saved-session",
    });
  });
});
