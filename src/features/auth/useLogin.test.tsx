import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { useLogin } from "./useLogin";
import { useAuthStore } from "../../stores/authStore";
import { useErrorStore } from "../../stores/errorStore";
import { useLoadingStore } from "../../stores/loadingStore";
import { server } from "../../tests/setup";
import { invalidCredentials, validCredentials } from "../../tests/fixtures/authFixtures";

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("useLogin", () => {
  it("updates auth state and clears loading after success", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.submit(validCredentials);
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });

  it("routes failures through centralized errors and clears loading", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.submit(invalidCredentials);
    });

    await waitFor(() => expect(useErrorStore.getState().toast?.message).toBe("Invalid username/email or password."));
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });

  it("handles service failures as blocking errors", async () => {
    server.use(http.post("**/api/identity/login", () => HttpResponse.json({ title: "Down" }, { status: 500 })));
    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.submit(validCredentials);
    });

    expect(useErrorStore.getState().modal?.message).toContain("temporarily unavailable");
  });
});
