import { describe, expect, it } from "vitest";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { validateConquestTarget } from "./conquestRules";

describe("conquestRules", () => {
  it("accepts an own uncaptured piece and adjacent empty target on the current turn", () => {
    expect(validateConquestTarget(gameSessionFixture(), "user-1", "piece-1", { x: 1, y: 0 }, false)).toEqual({
      ok: true,
      sourceTileId: "tile-0-0",
      targetTileId: "tile-1-0",
    });
  });

  it("rejects invalid local conquest conditions", () => {
    expect(validateConquestTarget(null, "user-1", "piece-1", { x: 1, y: 0 }, false)).toMatchObject({ ok: false });
    expect(validateConquestTarget(gameSessionFixture(), "user-2", "piece-1", { x: 1, y: 0 }, false)).toMatchObject({
      ok: false,
      message: "That piece belongs to another player.",
    });
    expect(validateConquestTarget(gameSessionFixture(), "user-1", "piece-1", { x: 1, y: 0 }, true)).toMatchObject({
      ok: false,
      message: "A question attempt is already in progress.",
    });
    expect(validateConquestTarget(gameSessionFixture(), "user-1", "piece-1", { x: 1, y: 1 }, false)).toMatchObject({
      ok: false,
      message: "That target tile is not adjacent to this piece.",
    });
  });
});

