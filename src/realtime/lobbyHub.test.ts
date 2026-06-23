import { describe, expect, it, vi } from "vitest";
import { lobbyFixture } from "../tests/fixtures/lobbyFixtures";
import { getLobbyHubUrl, joinLobbyHubGroup, registerLobbyHubHandlers, type LobbyHubHandlers } from "./lobbyHub";

describe("lobbyHub", () => {
  it("derives hub URL from the API base URL", () => {
    expect(getLobbyHubUrl("https://localhost:5001/")).toBe("https://localhost:5001/hubs/lobbies");
  });

  it("registers typed event handlers", () => {
    const callbacks = new Map<string, (...args: unknown[]) => void>();
    const handlers: LobbyHubHandlers = {
      onSnapshot: vi.fn(),
      onSetupChanged: vi.fn(),
      onPlayerJoined: vi.fn(),
      onPlayerJoinedPatch: vi.fn(),
      onPlayerLeft: vi.fn(),
      onPlayerLeftPatch: vi.fn(),
      onHostChanged: vi.fn(),
      onStarted: vi.fn(),
      onClosed: vi.fn(),
      onCancelled: vi.fn(),
      onConnectionStatus: vi.fn(),
    };

    registerLobbyHubHandlers({ on: (event, callback) => callbacks.set(event, callback) }, handlers);
    callbacks.get("LobbySnapshot")?.(lobbyFixture());
    callbacks.get("LobbySetupChanged")?.({ lobby: lobbyFixture({ setupVersion: 2 }), reason: "PlayerReadyChanged" });
    callbacks.get("LobbyPlayerJoinedEvent")?.({
      lobbyId: "lobby-1",
      player: { userId: "user-2", joinedAtUtc: "now" },
    });
    callbacks.get("HostChanged")?.({ lobbyId: "lobby-1", hostUserId: "user-2" });
    callbacks.get("LobbyStartedEvent")?.({ lobbyId: "lobby-1", sessionId: "session-1" });

    expect(handlers.onSnapshot).toHaveBeenCalledWith(expect.objectContaining({ id: "lobby-1" }));
    expect(handlers.onSetupChanged).toHaveBeenCalledWith(expect.objectContaining({ setupVersion: 2 }), "PlayerReadyChanged");
    expect(handlers.onPlayerJoinedPatch).toHaveBeenCalledWith("lobby-1", "user-2", "now");
    expect(handlers.onHostChanged).toHaveBeenCalledWith("user-2");
    expect(handlers.onStarted).toHaveBeenCalledWith(expect.objectContaining({ sessionId: "session-1" }));
  });

  it("routes malformed setup changed payloads to the fallback handler", () => {
    const callbacks = new Map<string, (...args: unknown[]) => void>();
    const handlers: LobbyHubHandlers = {
      onSnapshot: vi.fn(),
      onSetupChanged: vi.fn(),
      onSetupChangedMalformed: vi.fn(),
      onPlayerJoined: vi.fn(),
      onPlayerJoinedPatch: vi.fn(),
      onPlayerLeft: vi.fn(),
      onPlayerLeftPatch: vi.fn(),
      onHostChanged: vi.fn(),
      onStarted: vi.fn(),
      onClosed: vi.fn(),
      onCancelled: vi.fn(),
      onConnectionStatus: vi.fn(),
    };

    registerLobbyHubHandlers({ on: (event, callback) => callbacks.set(event, callback) }, handlers);
    callbacks.get("LobbySetupChanged")?.({ lobby: { id: null }, reason: "CategoriesUpdated" });

    expect(handlers.onSetupChanged).not.toHaveBeenCalled();
    expect(handlers.onSetupChangedMalformed).toHaveBeenCalledOnce();
  });

  it("joins a lobby update group", async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);

    await joinLobbyHubGroup({ invoke }, "lobby-1");

    expect(invoke).toHaveBeenCalledWith("SubscribeLobby", { lobbyId: "lobby-1" });
  });
});
