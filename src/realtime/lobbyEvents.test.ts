import { describe, expect, it } from "vitest";
import { lobbyFixture, startLobbyResultFixture } from "../tests/fixtures/lobbyFixtures";
import { isHostChangedEvent, isLobbyPlayerEvent, toLobbyEvent, toStartLobbyEvent } from "./lobbyEvents";

describe("lobbyEvents", () => {
  it("maps lobby and start event payloads", () => {
    expect(toLobbyEvent(lobbyFixture()).id).toBe("lobby-1");
    expect(toStartLobbyEvent(startLobbyResultFixture()).sessionId).toBe("session-1");
  });

  it("guards host changed payloads", () => {
    expect(isHostChangedEvent({ lobbyId: "lobby-1", hostUserId: "user-2" })).toBe(true);
    expect(isHostChangedEvent({ lobbyId: "lobby-1" })).toBe(false);
  });

  it("maps lightweight lobby started and player events", () => {
    expect(toStartLobbyEvent({ lobbyId: "lobby-1", sessionId: "session-1" })).toMatchObject({
      lobbyId: "lobby-1",
      sessionId: "session-1",
      lobby: null,
    });
    expect(isLobbyPlayerEvent({ lobbyId: "lobby-1", player: { userId: "user-2", joinedAtUtc: "now" } })).toBe(true);
  });
});
