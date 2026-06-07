import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "@testing-library/react";
import { authStorageKey, resetAuthStoreForTests, useAuthStore } from "./authStore";
import { expiredJwt } from "../tests/fixtures/authFixtures";

describe("authStore", () => {
  beforeEach(() => {
    resetAuthStoreForTests();
  });

  it("stores authenticated state and persists it", () => {
    act(() => useAuthStore.getState().login("token"));

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(window.localStorage.getItem(authStorageKey)).toContain("token");
  });

  it("supports unavailable browser persistence without losing in-memory sign-in", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    act(() => useAuthStore.getState().login("token"));

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().storageAvailable).toBe(false);
    spy.mockRestore();
  });

  it("clears invalid saved sessions on restore", () => {
    window.localStorage.setItem(authStorageKey, JSON.stringify({ accessToken: expiredJwt() }));

    act(() => useAuthStore.getState().restoreFromStorage());

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().invalidReason).toBe("invalid-saved-session");
  });

  it("logs out and removes persisted state", () => {
    act(() => useAuthStore.getState().login("token"));
    act(() => useAuthStore.getState().logout());

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(window.localStorage.getItem(authStorageKey)).toBeNull();
  });
});
