import { describe, expect, it } from "vitest";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { mapGameActionResult, mapGameSession } from "./gameMappers";

describe("gameMappers", () => {
  it("maps valid game sessions into domain models", () => {
    const session = mapGameSession(gameSessionFixture());

    expect(session.tiles).toHaveLength(session.boardWidth * session.boardHeight);
    expect(session.players[0]?.displayName).toBe("Alice");
  });

  it("rejects unsupported statuses and tile types", () => {
    expect(() => mapGameSession(gameSessionFixture({ status: "Paused" as never }))).toThrow(/Unsupported/);
    expect(() =>
      mapGameSession({
        ...gameSessionFixture(),
        tiles: [{ ...gameSessionFixture().tiles[0], tileType: "Water" as never }, ...gameSessionFixture().tiles.slice(1)],
      }),
    ).toThrow(/Unsupported tile type/);
  });

  it("blocks malformed board snapshots", () => {
    const session = gameSessionFixture();
    expect(() => mapGameSession({ ...session, tiles: session.tiles.slice(1) })).toThrow(/missing board tiles/);
    expect(() =>
      mapGameSession({ ...session, tiles: [{ ...session.tiles[0], x: 99 }, ...session.tiles.slice(1)] }),
    ).toThrow(/out-of-bounds/);
    expect(() =>
      mapGameSession({
        ...session,
        pieces: session.pieces.map((piece) =>
          piece.id === "piece-1" ? { ...piece, currentTileId: "missing-tile" } : piece,
        ),
      }),
    ).toThrow(/unknown piece tile/);
  });

  it("maps game action results with turn state", () => {
    const session = gameSessionFixture();

    expect(mapGameActionResult({ session, turn: { gameSessionId: session.id, currentTurnPlayerId: "player-1", turnNumber: 2, status: null } }).turn.turnNumber).toBe(2);
  });
});
