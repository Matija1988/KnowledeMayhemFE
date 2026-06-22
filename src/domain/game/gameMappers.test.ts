import { describe, expect, it } from "vitest";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { mapGameActionResult, mapGameSession, type GameSessionDto } from "./gameMappers";

describe("gameMappers", () => {
  it("maps valid game sessions into domain models", () => {
    const session = mapGameSession(gameSessionFixture());

    expect(session.tiles).toHaveLength(session.boardWidth * session.boardHeight);
    expect(session.players[0]?.displayName).toBe("Alice");
  });

  it("maps backend game session DTO identifiers into frontend domain identifiers", () => {
    const backendDto: GameSessionDto = {
      sessionId: "session-backend",
      lobbyId: "lobby-1",
      status: "InProgress",
      boardSeed: 59374893,
      boardWidth: 2,
      boardHeight: 2,
      currentTurnPlayerId: "player-1",
      turnNumber: 1,
      startedAtUtc: "2026-05-16T16:57:05.331495Z",
      endedAtUtc: null,
      winnerPlayerId: null,
      players: [
        {
          playerId: "player-1",
          userId: "user-1",
          playerOrder: 1,
          displayName: "Player 1",
          isEliminated: false,
        },
        {
          playerId: "player-2",
          userId: "user-2",
          playerOrder: 2,
          displayName: "Player 2",
          isEliminated: false,
        },
      ],
      tiles: [
        {
          tileId: "tile-0-0",
          x: 0,
          y: 0,
          categoryId: "category-1",
          ownerPlayerId: "player-1",
          occupyingPieceId: "piece-1",
          tileType: "Normal",
        },
        {
          tileId: "tile-1-0",
          x: 1,
          y: 0,
          categoryId: "category-2",
          ownerPlayerId: null,
          occupyingPieceId: null,
          tileType: "Normal",
        },
        {
          tileId: "tile-0-1",
          x: 0,
          y: 1,
          categoryId: "category-3",
          ownerPlayerId: null,
          occupyingPieceId: null,
          tileType: "Normal",
        },
        {
          tileId: "tile-1-1",
          x: 1,
          y: 1,
          categoryId: "category-4",
          ownerPlayerId: "player-2",
          occupyingPieceId: "piece-2",
          tileType: "Normal",
        },
      ],
      pieces: [
        {
          pieceId: "piece-1",
          ownerPlayerId: "player-1",
          currentTileId: "tile-0-0",
          level: 1,
          isCaptured: false,
        },
        {
          pieceId: "piece-2",
          ownerPlayerId: "player-2",
          currentTileId: "tile-1-1",
          level: 1,
          isCaptured: false,
        },
      ],
    };

    const session = mapGameSession(backendDto);

    expect(session).toMatchObject({
      id: "session-backend",
      createdAtUtc: "2026-05-16T16:57:05.331495Z",
      currentTurnPlayerId: "player-1",
    });
    expect(session.players[0]).toMatchObject({ id: "player-1", gameSessionId: "session-backend" });
    expect(session.tiles[0]).toMatchObject({ id: "tile-0-0", gameSessionId: "session-backend" });
    expect(session.pieces[0]).toMatchObject({ id: "piece-1", gameSessionId: "session-backend" });
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

  it("maps special tiles, captured pieces, and default piece levels safely", () => {
    const dto: GameSessionDto = {
      ...gameSessionFixture(),
      tiles: gameSessionFixture().tiles.map((tile) =>
        tile.id === "tile-1-0" ? { ...tile, tileType: "special" as never, occupyingPieceId: null } : tile,
      ),
      pieces: gameSessionFixture().pieces.map((piece) =>
        piece.id === "piece-2"
          ? { ...piece, currentTileId: null, isCaptured: true, capturedAtUtc: "2026-06-21T10:00:00.000Z", level: 0 }
          : piece,
      ),
    };

    const session = mapGameSession(dto);

    expect(session.tiles.find((tile) => tile.id === "tile-1-0")?.tileType).toBe("Special");
    expect(session.pieces.find((piece) => piece.id === "piece-2")).toMatchObject({
      currentTileId: null,
      isCaptured: true,
      level: 1,
      capturedAtUtc: "2026-06-21T10:00:00.000Z",
    });
  });

  it("rejects active pieces that have no occupied tile while allowing captured pieces off-board", () => {
    const session = gameSessionFixture();

    expect(() =>
      mapGameSession({
        ...session,
        pieces: session.pieces.map((piece) =>
          piece.id === "piece-1" ? { ...piece, currentTileId: null, isCaptured: false } : piece,
        ),
      }),
    ).toThrow(/Piece response is missing required fields/);
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
