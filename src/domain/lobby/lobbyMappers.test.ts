import { describe, expect, it } from "vitest";
import { lobbyFixture } from "../../tests/fixtures/lobbyFixtures";
import { isLobbyExpired, mapLobby, mapStartLobbyResult, normalizeJoinCode } from "./lobbyMappers";

describe("lobbyMappers", () => {
  it("maps lobby DTOs into domain models", () => {
    const lobby = mapLobby(
      lobbyFixture({
        selectedCategoryIds: ["cat-1"],
        setupStatus: "Ready",
        setupVersion: 3,
        updatedAtUtc: "2026-06-16T10:02:00.000Z",
        players: [{ userId: "user-1", joinedAtUtc: "2026-06-16T10:00:00.000Z", selectedPieceColor: "Red", isReady: true }],
      }),
    );

    expect(lobby.players).toHaveLength(1);
    expect(lobby).toMatchObject({
      selectedCategoryIds: ["cat-1"],
      setupStatus: "Ready",
      setupVersion: 3,
      updatedAtUtc: "2026-06-16T10:02:00.000Z",
    });
    expect(lobby.players[0]).toMatchObject({ selectedPieceColor: "Red", isReady: true });
  });

  it("rejects unsupported statuses and player limits", () => {
    expect(() => mapLobby({ ...lobbyFixture(), status: "Paused" as never })).toThrow(/Unsupported lobby status/);
    expect(() => mapLobby({ ...lobbyFixture(), maxPlayers: 8 })).toThrow(/maxPlayers/);
    expect(() => mapLobby({ ...lobbyFixture(), setupStatus: "Done" as never })).toThrow(/setup status/);
  });

  it("maps start handoff data", () => {
    const lobby = lobbyFixture({
      players: [{ userId: "user-1", joinedAtUtc: "2026-06-16T10:00:00.000Z", selectedPieceColor: null, isReady: false }],
    });

    expect(
      mapStartLobbyResult({
        sessionId: "session-1",
        initialState: {
          lobbyId: lobby.id,
          orderedPlayerIds: ["user-1"],
          createdAtUtc: "2026-06-16T10:01:00.000Z",
          selectedCategoryIds: [],
          playerColors: {},
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
