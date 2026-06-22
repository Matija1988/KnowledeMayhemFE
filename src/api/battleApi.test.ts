import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../tests/setup";
import { startBattleAttempt, startSpecialFieldAttempt, submitBattleAnswer } from "./battleApi";
import { battleQuestionFixture } from "../tests/fixtures/battleFixtures";
import { HttpError } from "./httpClient";

describe("battleApi", () => {
  it("starts battle attempts with piece id and target tile id", async () => {
    server.use(
      http.post("**/api/game-sessions/:gameSessionId/battle-attempts", async ({ request }) => {
        await expect(request.json()).resolves.toEqual({ attackingPieceId: "piece-1", targetTileId: "tile-1-0" });
        return HttpResponse.json({
          ...battleQuestionFixture(),
          battleAttemptId: "battle-1",
          answerOptions: battleQuestionFixture().answerOptions.map((option) => ({ answerId: option.id, text: option.text })),
        });
      }),
    );

    await expect(
      startBattleAttempt(
        "session-1",
        { attackingPieceId: "piece-1", targetTileId: "tile-1-0" },
        { accessToken: "token", questionFallback: { actingPlayerId: "player-1", pieceId: "piece-1", sourceTileId: "tile-0-0", targetTileId: "tile-1-0" } },
      ),
    ).resolves.toMatchObject({ attemptId: "battle-1" });
  });

  it("starts special field attempts", async () => {
    await expect(
      startSpecialFieldAttempt(
        "session-1",
        { pieceId: "piece-1", targetTileId: "tile-1-0" },
        { accessToken: "token", questionFallback: { actingPlayerId: "player-1", pieceId: "piece-1", sourceTileId: "tile-0-0", targetTileId: "tile-1-0" } },
      ),
    ).resolves.toMatchObject({ attemptKind: "SpecialField" });
  });

  it("submits battle answers and maps results", async () => {
    await expect(
      submitBattleAnswer(
        "session-1",
        "battle-1",
        { questionAttemptId: "battle-question-1", answerId: "answer-1" },
        { accessToken: "token", resultFallback: { actingPlayerId: "player-1", pieceId: "piece-1", sourceTileId: "tile-0-0", targetTileId: "tile-1-0" } },
      ),
    ).resolves.toMatchObject({ status: "Succeeded" });
  });

  it("surfaces backend problem details", async () => {
    server.use(
      http.post("**/api/game-sessions/:gameSessionId/battle-attempts", () => {
        return HttpResponse.json({ detail: "Tile is occupied" }, { status: 409 });
      }),
    );

    await expect(
      startBattleAttempt(
        "session-1",
        { attackingPieceId: "piece-1", targetTileId: "tile-1-0" },
        { accessToken: "token", questionFallback: { actingPlayerId: "player-1", pieceId: "piece-1", sourceTileId: "tile-0-0", targetTileId: "tile-1-0" } },
      ),
    ).rejects.toBeInstanceOf(HttpError);
  });
});
