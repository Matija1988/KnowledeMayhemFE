import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { gameSessionFixture } from "../tests/fixtures/gameFixtures";
import { conquestResultFixture } from "../tests/fixtures/conquestFixtures";
import { battleResultFixture } from "../tests/fixtures/battleFixtures";
import {
  resetGameStoreForTests,
  selectBoardCells,
  selectCurrentUserPlayer,
  selectIsCurrentTurn,
  selectPieceOnTile,
  selectPlayerDisplayName,
  selectSelectablePieces,
  useGameStore,
} from "./gameStore";

describe("gameStore", () => {
  beforeEach(() => resetGameStoreForTests());

  it("stores authoritative sessions as normalized lookup data", () => {
    const session = gameSessionFixture();

    act(() => useGameStore.getState().setSession(session));

    expect(useGameStore.getState().session?.id).toBe("session-1");
    expect(useGameStore.getState().tilesById["tile-0-0"]).toMatchObject({ x: 0, y: 0 });
    expect(useGameStore.getState().piecesById["piece-1"]).toMatchObject({ ownerPlayerId: "player-1" });
  });

  it("tracks transient selection, pending state, connection state, and reset behavior", () => {
    act(() => {
      useGameStore.getState().selectPiece("piece-1", [{ x: 1, y: 0 }]);
      useGameStore.getState().beginMove("piece-1", { x: 1, y: 0 });
      useGameStore.getState().setConnection({ status: "connected" });
    });

    expect(useGameStore.getState().pendingMove?.pieceId).toBe("piece-1");
    expect(useGameStore.getState().connection.status).toBe("connected");

    act(() => useGameStore.getState().resetGame());

    expect(useGameStore.getState().session).toBeNull();
  });

  it("applies successful move reconciliation and clears selection", () => {
    const session = gameSessionFixture();
    const movedSession = {
      ...session,
      currentTurnPlayerId: "player-2",
      turnNumber: 2,
      pieces: session.pieces.map((piece) => (piece.id === "piece-1" ? { ...piece, currentTileId: "tile-1-0" } : piece)),
    };

    act(() => {
      useGameStore.getState().setSession(session);
      useGameStore.getState().selectPiece("piece-1", [{ x: 1, y: 0 }]);
      useGameStore.getState().beginMove("piece-1", { x: 1, y: 0 });
      useGameStore.getState().applyMoveResult(movedSession);
    });

    expect(useGameStore.getState().pendingMove).toBeNull();
    expect(useGameStore.getState().selectedPieceId).toBeNull();
    expect(useGameStore.getState().session?.turnNumber).toBe(2);
  });

  it("applies realtime move and turn patches without requiring a manual refresh", () => {
    const session = gameSessionFixture();

    act(() => {
      useGameStore.getState().setSession(session);
      useGameStore.getState().selectPiece("piece-1", [{ x: 1, y: 0 }]);
      useGameStore.getState().beginMove("piece-1", { x: 1, y: 0 });
      useGameStore.getState().applyMovePatch("session-1", "piece-1", "tile-0-0", "tile-1-0", 2);
      useGameStore.getState().applyTurnPatch("session-1", "player-2", 2);
    });

    expect(useGameStore.getState().piecesById["piece-1"].currentTileId).toBe("tile-1-0");
    expect(useGameStore.getState().tilesById["tile-0-0"].occupyingPieceId).toBeNull();
    expect(useGameStore.getState().tilesById["tile-1-0"].occupyingPieceId).toBe("piece-1");
    expect(useGameStore.getState().session?.currentTurnPlayerId).toBe("player-2");
    expect(selectIsCurrentTurn(useGameStore.getState().session, "user-2")).toBe(true);
    expect(useGameStore.getState().pendingOperation).toBeNull();
  });

  it("applies realtime snapshots and patch refresh requests", () => {
    const session = gameSessionFixture();

    act(() => {
      useGameStore.getState().applyGameSnapshot(session, "Game updated.");
      useGameStore.getState().requestSnapshotRefresh("Refresh required.");
    });

    expect(useGameStore.getState().session?.id).toBe("session-1");
    expect(useGameStore.getState().pendingOperation).toBe("reconnectGame");
    expect(useGameStore.getState().liveMessage).toBe("Refresh required.");
  });

  it("applies authoritative conquest results and suppresses stale result patches", () => {
    const session = gameSessionFixture();

    act(() => {
      useGameStore.getState().setSession(session);
      useGameStore.getState().applyConquestResult(conquestResultFixture({ session: null }));
    });

    expect(useGameStore.getState().piecesById["piece-1"].currentTileId).toBe("tile-1-0");
    expect(useGameStore.getState().tilesById["tile-1-0"].ownerPlayerId).toBe("player-1");
    expect(useGameStore.getState().session?.turnNumber).toBe(2);

    act(() => {
      useGameStore.getState().applyConquestResult(conquestResultFixture({ session: null, turnNumber: 1 }));
    });

    expect(useGameStore.getState().session?.turnNumber).toBe(2);
  });

  it("applies battle result patches for capture, level, ownership, and turn state", () => {
    const session = gameSessionFixture();

    act(() => {
      useGameStore.getState().setSession(session);
      useGameStore.getState().applyBattleResult(battleResultFixture({ session: null }));
    });

    expect(useGameStore.getState().piecesById["piece-1"]).toMatchObject({ currentTileId: "tile-1-0", level: 2 });
    expect(useGameStore.getState().piecesById["piece-2"]).toMatchObject({ currentTileId: null, isCaptured: true });
    expect(useGameStore.getState().tilesById["tile-0-0"].occupyingPieceId).toBeNull();
    expect(useGameStore.getState().tilesById["tile-1-0"]).toMatchObject({
      occupyingPieceId: "piece-1",
      ownerPlayerId: "player-1",
    });
    expect(useGameStore.getState().session?.currentTurnPlayerId).toBe("player-2");
    expect(useGameStore.getState().session?.turnNumber).toBe(2);
  });

  it("ignores out-of-order battle and piece patch events", () => {
    const session = gameSessionFixture();

    act(() => {
      useGameStore.getState().setSession(session);
      useGameStore.getState().applyBattleResult(battleResultFixture({ session: null, sequence: 5 }));
      useGameStore.getState().applyBattleResult(
        battleResultFixture({
          session: null,
          sequence: 4,
          movedPieceId: "piece-1",
          sourceTileId: "tile-1-0",
          targetTileId: "tile-2-0",
          newLevel: 3,
          turnNumber: 3,
        }),
      );
      useGameStore.getState().applyPieceLeveledPatch("session-1", "piece-1", 3, 4);
      useGameStore.getState().applyPieceCapturedPatch("session-1", "piece-1", "tile-1-0", 4);
    });

    expect(useGameStore.getState().piecesById["piece-1"]).toMatchObject({ currentTileId: "tile-1-0", level: 2, isCaptured: false });
    expect(useGameStore.getState().lastSequence).toBe(5);
  });

  it("applies standalone captured and leveled realtime patches", () => {
    const session = gameSessionFixture();

    act(() => {
      useGameStore.getState().setSession(session);
      useGameStore.getState().applyPieceCapturedPatch("session-1", "piece-2", "tile-2-1", 2);
      useGameStore.getState().applyPieceLeveledPatch("session-1", "piece-1", 3, 3);
    });

    expect(useGameStore.getState().piecesById["piece-2"]).toMatchObject({ currentTileId: null, isCaptured: true });
    expect(useGameStore.getState().tilesById["tile-2-1"].occupyingPieceId).toBeNull();
    expect(useGameStore.getState().piecesById["piece-1"].level).toBe(3);
    expect(useGameStore.getState().lastSequence).toBe(3);
  });

  it("derives current player, turn state, piece-on-tile, and board cells", () => {
    const session = gameSessionFixture();

    expect(selectCurrentUserPlayer(session, "user-1")?.id).toBe("player-1");
    expect(selectIsCurrentTurn(session, "user-1")).toBe(true);
    expect(selectPieceOnTile(session, "tile-0-0")?.id).toBe("piece-1");
    expect(selectBoardCells(session)[0]).toMatchObject({ x: 0, y: 0 });
    expect(selectPlayerDisplayName(session.players[0])).toBe("Alice");
    expect(selectPlayerDisplayName({ ...session.players[0], displayName: null })).toBe("Player 1");
    expect(selectSelectablePieces(session, "user-1")).toHaveLength(1);
  });

  it("sets blocking state for completed and cancelled sessions", () => {
    act(() => useGameStore.getState().setSession(gameSessionFixture({ status: "Completed" })));

    expect(useGameStore.getState().blockingError?.reason).toBe("completed");
  });

  it("returns no selectable pieces when unauthorized or blocked", () => {
    const session = gameSessionFixture();

    expect(selectSelectablePieces(session, "user-2")).toHaveLength(0);
    expect(selectSelectablePieces(gameSessionFixture({ status: "Cancelled" }), "user-1")).toHaveLength(0);
    expect(
      selectSelectablePieces(gameSessionFixture({ pieces: [{ ...session.pieces[0], isCaptured: true }, session.pieces[1]] }), "user-1"),
    ).toHaveLength(0);
  });
});
