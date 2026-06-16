import { renderHook, act } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { useLoadingStore } from "../../stores/loadingStore";
import { useLobbyStore } from "../../stores/lobbyStore";
import { lobbyWithGuest } from "../../tests/fixtures/lobbyFixtures";
import { useLobbyActions } from "./useLobbyActions";

let currentPath = "/";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <LocationProbe />
    {children}
  </MemoryRouter>
);

function LocationProbe() {
  currentPath = useLocation().pathname;
  return null;
}

describe("useLobbyActions", () => {
  it("creates a lobby and stores it", async () => {
    useAuthStore.getState().login("token");
    const { result } = renderHook(() => useLobbyActions(), { wrapper });

    await act(async () => {
      await result.current.create(4);
    });

    expect(useLobbyStore.getState().currentLobby?.id).toBe("lobby-1");
  });

  it("shows loading feedback immediately for create actions", async () => {
    useAuthStore.getState().login("token");
    const { result } = renderHook(() => useLobbyActions(), { wrapper });

    const action = act(async () => {
      const pending = result.current.create(4);
      expect(useLoadingStore.getState()).toMatchObject({ isLoading: true, operation: "createLobby" });
      await pending;
    });

    await action;
  });

  it("blocks empty join codes", async () => {
    useAuthStore.getState().login("token");
    const { result } = renderHook(() => useLobbyActions(), { wrapper });

    await act(async () => {
      await result.current.join(" ");
    });

    expect(result.current.joinCodeError).toBe("Enter a lobby code.");
  });

  it("joins with a normalized code", async () => {
    useAuthStore.getState().login("token");
    const { result } = renderHook(() => useLobbyActions(), { wrapper });

    await act(async () => {
      await result.current.join(" abc123 ");
    });

    expect(useLobbyStore.getState().currentLobby?.code).toBe("ABC123");
  });

  it("leaves, cancels, and starts with the expected state changes", async () => {
    useAuthStore.getState().login("token");
    useLobbyStore.getState().setCurrentLobby(lobbyWithGuest());
    const { result } = renderHook(() => useLobbyActions(), { wrapper });

    await act(async () => {
      await result.current.start("lobby-1");
    });
    expect(useLobbyStore.getState().lastStartResult?.sessionId).toBe("session-1");
    expect(currentPath).toBe("/game/session-1");

    await act(async () => {
      await result.current.leave("lobby-1");
    });
    expect(useLobbyStore.getState().currentLobby).toBeNull();

    useLobbyStore.getState().setCurrentLobby(lobbyWithGuest());
    await act(async () => {
      await result.current.cancel("lobby-1");
    });
    expect(useLobbyStore.getState().currentLobby).toBeNull();
  });
});
