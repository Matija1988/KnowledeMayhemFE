import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { lobbyFixture, startLobbyResultFixture } from "../tests/fixtures/lobbyFixtures";
import { resetLobbyStoreForTests, selectIsHost, selectStartDisabledReason, useLobbyStore } from "./lobbyStore";

describe("lobbyStore", () => {
  beforeEach(() => resetLobbyStoreForTests());

  it("stores current lobby and pending operations", () => {
    act(() => {
      useLobbyStore.getState().beginOperation("createLobby");
      useLobbyStore.getState().setCurrentLobby(lobbyFixture());
    });

    expect(useLobbyStore.getState().pendingOperation).toBe("createLobby");
    expect(useLobbyStore.getState().currentLobby?.id).toBe("lobby-1");
  });

  it("derives host and start disabled reasons", () => {
    const lobby = lobbyFixture();

    expect(selectIsHost(lobby, "user-1")).toBe(true);
    expect(selectStartDisabledReason(lobby, "user-1", null)).toBe("At least 2 players are required to start.");
    expect(selectStartDisabledReason(lobby, "user-2", null)).toBe("Only the host can start this lobby.");
    expect(selectStartDisabledReason(lobbyFixture({ expiresAtUtc: "2020-01-01T00:00:00.000Z" }), "user-1", null)).toBe(
      "Lobby has expired.",
    );
  });

  it("stores start handoff data", () => {
    const result = startLobbyResultFixture();

    act(() => useLobbyStore.getState().applyLobbyStarted(result));

    expect(useLobbyStore.getState().lastStartResult?.sessionId).toBe("session-1");
  });

  it("applies realtime lobby events", () => {
    const lobby = lobbyFixture();

    act(() => {
      useLobbyStore.getState().applyPlayerJoined(lobby, "user-2");
      useLobbyStore.getState().applyHostChanged("user-2");
      useLobbyStore.getState().applyLobbyCancelled({ ...lobby, hostUserId: "user-2", status: "Cancelled" });
    });

    expect(useLobbyStore.getState().currentLobby?.status).toBe("Cancelled");
    expect(useLobbyStore.getState().currentLobby?.hostUserId).toBe("user-2");
    expect(useLobbyStore.getState().liveMessage).toBe("Lobby cancelled.");
  });
});
