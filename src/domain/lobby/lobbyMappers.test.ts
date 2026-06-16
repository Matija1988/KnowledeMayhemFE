import { describe, expect, it } from "vitest";
import { lobbyFixture } from "../../tests/fixtures/lobbyFixtures";
import { isLobbyExpired, mapLobby, mapStartLobbyResult, normalizeJoinCode } from "./lobbyMappers";

describe("lobbyMappers", () => {
  it("maps lobby DTOs into domain models", () => {
    expect(mapLobby(lobbyFixture()).players).toHaveLength(1);
  });

  it("rejects unsupported statuses and player limits", () => {
    expect(() => mapLobby({ ...lobbyFixture(), status: "Paused" as never })).toThrow(/Unsupported lobby status/);
    expect(() => mapLobby({ ...lobbyFixture(), maxPlayers: 8 })).toThrow(/maxPlayers/);
  });

  it("maps start handoff data", () => {
    const lobby = lobbyFixture({ players: [{ userId: "user-1", joinedAtUtc: "2026-06-16T10:00:00.000Z" }] });

    expect(
      mapStartLobbyResult({
        sessionId: "session-1",
        initialState: {
          lobbyId: lobby.id,
          orderedPlayerIds: ["user-1"],
          createdAtUtc: "2026-06-16T10:01:00.000Z",
        },
        lobby,
      }).sessionId,
    ).toBe("session-1");
  });

  it("normalizes join codes and detects expiration", () => {
    expect(normalizeJoinCode(" abc123 ")).toBe("ABC123");
    expect(isLobbyExpired(lobbyFixture({ expiresAtUtc: "2020-01-01T00:00:00.000Z" }))).toBe(true);
  });
});
