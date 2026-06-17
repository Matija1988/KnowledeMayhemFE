import { http, HttpResponse } from "msw";
import { conquestResultFixture, gameplayQuestionFixture } from "../fixtures/conquestFixtures";

export const conquestHandlers = [
  http.post("**/api/game-sessions/:gameSessionId/conquest-attempts", async ({ params, request }) => {
    const body = (await request.json()) as { pieceId?: string; targetTileId?: string };
    if (body.targetTileId === "tile-2-0") {
      return HttpResponse.json({ title: "Invalid target", detail: "That tile is occupied.", status: 409 }, { status: 409 });
    }
    return HttpResponse.json(
      gameplayQuestionFixture({
        gameSessionId: String(params.gameSessionId),
        pieceId: body.pieceId ?? "piece-1",
        targetTileId: body.targetTileId ?? "tile-1-0",
      }),
    );
  }),
  http.post("**/api/question-attempts/:questionAttemptId/answer", async ({ params, request }) => {
    const body = (await request.json()) as { answerId?: string };
    const correct = body.answerId === "answer-1";
    return HttpResponse.json(
      conquestResultFixture({
        questionAttemptId: String(params.questionAttemptId),
        resultStatus: correct ? "Succeeded" : "Failed",
        isCorrect: correct,
        currentTileId: correct ? "tile-1-0" : "tile-0-0",
        ownerPlayerId: correct ? "player-1" : null,
      }),
    );
  }),
];

