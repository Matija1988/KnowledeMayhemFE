import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { login, normalizeIdentityError } from "./identityApi";
import { HttpError } from "./httpClient";
import { server } from "../tests/setup";
import { validCredentials } from "../tests/fixtures/authFixtures";

describe("identityApi", () => {
  it("normalizes invalid credentials", () => {
    expect(normalizeIdentityError(new HttpError(401, null)).message).toBe("Invalid username/email or password.");
  });

  it.each([
    [400, "Check your username/email and password, then try again."],
    [429, "Too many sign-in attempts. Wait a moment and try again."],
    [500, "Sign-in is temporarily unavailable. Try again shortly."],
  ])("normalizes HTTP %s", (status, message) => {
    expect(normalizeIdentityError(new HttpError(status, null)).message).toBe(message);
  });

  it("normalizes network failures", () => {
    expect(normalizeIdentityError(new TypeError("Failed to fetch")).message).toContain("Check your connection");
  });

  it("sends login requests through the identity endpoint", async () => {
    await expect(login(validCredentials)).resolves.toEqual({ accessToken: "test-access-token" });
  });

  it("throws for rejected login requests", async () => {
    server.use(http.post("/api/identity/login", () => HttpResponse.json({ title: "No" }, { status: 401 })));
    await expect(login(validCredentials)).rejects.toBeInstanceOf(HttpError);
  });
});
