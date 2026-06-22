import { describe, expect, it } from "vitest";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { getBattleRequiredCorrectAnswers, getNextPieceLevel, isEnemyOccupiedTile, isSpecialTile, MAX_PIECE_LEVEL } from "./battleRules";

describe("battleRules", () => {
  it("starts pieces at level one, caps progression at level three, and scales defender difficulty by level plus one", () => {
    expect(getNextPieceLevel(0)).toBe(2);
    expect(getNextPieceLevel(1)).toBe(2);
    expect(getNextPieceLevel(MAX_PIECE_LEVEL)).toBe(3);
    expect(getBattleRequiredCorrectAnswers(1)).toBe(2);
    expect(getBattleRequiredCorrectAnswers(2)).toBe(3);
    expect(getBattleRequiredCorrectAnswers(99)).toBe(4);
  });

  it("identifies special and enemy-occupied target tiles", () => {
    const session = gameSessionFixture({
      tiles: gameSessionFixture().tiles.map((tile) =>
        tile.id === "tile-1-0"
          ? { ...tile, tileType: "Special", occupyingPieceId: "piece-2" }
          : tile.id === "tile-2-1"
            ? { ...tile, occupyingPieceId: null }
            : tile,
      ),
      pieces: gameSessionFixture().pieces.map((piece) => (piece.id === "piece-2" ? { ...piece, currentTileId: "tile-1-0" } : piece)),
    });

    expect(isSpecialTile(session.tiles.find((tile) => tile.id === "tile-1-0"))).toBe(true);
    expect(isEnemyOccupiedTile(session, session.tiles.find((tile) => tile.id === "tile-1-0")!, session.pieces[0])).toBe(true);
    expect(isEnemyOccupiedTile(session, session.tiles[0], session.pieces[0])).toBe(false);
  });
});
