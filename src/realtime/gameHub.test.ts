import { describe, expect, it, vi } from "vitest";
import { getGameHubUrl, registerGameHubHandlers } from "./gameHub";
import { gameActionResultFixture, gameSessionFixture } from "../tests/fixtures/gameFixtures";

describe("gameHub", () => {
  it("derives the game hub URL from the API base URL", () => {
    expect(getGameHubUrl("https://localhost:5001/")).toBe("https://localhost:5001/hubs/game");
  });

  it("registers game event and reconnect handlers", () => {
    const callbacks = new Map<string, (...args: unknown[]) => void>();
    const connection = {
      on: vi.fn((name: string, callback: (...args: unknown[]) => void) => callbacks.set(name, callback)),
      onreconnecting: vi.fn(),
      onreconnected: vi.fn(),
      onclose: vi.fn(),
    };
    const handlers = {
      onSession: vi.fn(),
      onActionResult: vi.fn(),
      onPatchNeedsRefresh: vi.fn(),
      onConnectionStatus: vi.fn(),
    };

    registerGameHubHandlers(connection, handlers);
    callbacks.get("GameStarted")?.(gameSessionFixture());
    callbacks.get("GameMoveExecuted")?.(gameActionResultFixture());

    expect(handlers.onSession).toHaveBeenCalledWith(expect.objectContaining({ id: "session-1" }));
    expect(handlers.onActionResult).toHaveBeenCalledWith(expect.objectContaining({ turn: expect.objectContaining({ turnNumber: 2 }) }));
    expect(connection.onreconnecting).toHaveBeenCalled();
  });
});
