import { describe, expect, it } from "vitest";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { getOrthogonalCandidateTargets, getPieceDisabledReason, isCandidateTarget } from "./gameMovement";

describe("gameMovement", () => {
  it("calculates only orthogonal unblocked and unoccupied targets", () => {
    const session = gameSessionFixture();

    expect(getOrthogonalCandidateTargets(session, "piece-1")).toEqual([{ x: 1, y: 0 }, { x: 0, y: 1 }]);
  });

  it("rejects diagonal, multi-tile, blocked, occupied, and missing targets", () => {
    const session = gameSessionFixture();

    expect(isCandidateTarget(session, "piece-1", { x: 1, y: 1 })).toBe(false);
    expect(isCandidateTarget(session, "piece-1", { x: 2, y: 0 })).toBe(false);
    expect(isCandidateTarget(session, "piece-1", { x: 2, y: 1 })).toBe(false);
    expect(isCandidateTarget(session, "piece-1", { x: 9, y: 9 })).toBe(false);
  });

  it("explains why pieces are not selectable", () => {
    const session = gameSessionFixture();

    expect(getPieceDisabledReason(session, "piece-2", "user-1")).toBe("That piece belongs to another player.");
    expect(getPieceDisabledReason(gameSessionFixture({ currentTurnPlayerId: "player-2" }), "piece-1", "user-1")).toBe(
      "It is not your turn.",
    );
    expect(
      getPieceDisabledReason(
        gameSessionFixture({ pieces: [{ ...session.pieces[0], isCaptured: true }, session.pieces[1]] }),
        "piece-1",
        "user-1",
      ),
    ).toBe("That piece has been captured.");
  });
});
