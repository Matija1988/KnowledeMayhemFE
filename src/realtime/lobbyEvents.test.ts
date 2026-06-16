import { describe, expect, it } from "vitest";
import { lobbyFixture, startLobbyResultFixture } from "../tests/fixtures/lobbyFixtures";
import { isHostChangedEvent, toLobbyEvent, toStartLobbyEvent } from "./lobbyEvents";

describe("lobbyEvents", () => {
  it("maps lobby and start event payloads", () => {
    expect(toLobbyEvent(lobbyFixture()).id).toBe("lobby-1");
    expect(toStartLobbyEvent(startLobbyResultFixture()).sessionId).toBe("session-1");
  });

  it("guards host changed payloads", () => {
    expect(isHostChangedEvent({ lobbyId: "lobby-1", hostUserId: "user-2" })).toBe(true);
    expect(isHostChangedEvent({ lobbyId: "lobby-1" })).toBe(false);
  });
});
