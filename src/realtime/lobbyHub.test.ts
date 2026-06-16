import { describe, expect, it, vi } from "vitest";
import { lobbyFixture, startLobbyResultFixture } from "../tests/fixtures/lobbyFixtures";
import { getLobbyHubUrl, registerLobbyHubHandlers, type LobbyHubHandlers } from "./lobbyHub";

describe("lobbyHub", () => {
  it("derives hub URL from the API base URL", () => {
    expect(getLobbyHubUrl("https://localhost:5001/")).toBe("https://localhost:5001/hubs/lobbies");
  });

  it("registers typed event handlers", () => {
    const callbacks = new Map<string, (...args: unknown[]) => void>();
    const handlers: LobbyHubHandlers = {
      onSnapshot: vi.fn(),
      onPlayerJoined: vi.fn(),
      onPlayerLeft: vi.fn(),
      onHostChanged: vi.fn(),
      onStarted: vi.fn(),
      onClosed: vi.fn(),
      onCancelled: vi.fn(),
      onConnectionStatus: vi.fn(),
    };

    registerLobbyHubHandlers({ on: (event, callback) => callbacks.set(event, callback) }, handlers);
    callbacks.get("LobbySnapshot")?.(lobbyFixture());
    callbacks.get("HostChanged")?.({ lobbyId: "lobby-1", hostUserId: "user-2" });
    callbacks.get("LobbyStarted")?.(startLobbyResultFixture());

    expect(handlers.onSnapshot).toHaveBeenCalledWith(expect.objectContaining({ id: "lobby-1" }));
    expect(handlers.onHostChanged).toHaveBeenCalledWith("user-2");
    expect(handlers.onStarted).toHaveBeenCalledWith(expect.objectContaining({ sessionId: "session-1" }));
  });
});
