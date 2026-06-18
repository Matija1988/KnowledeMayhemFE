import { http, HttpResponse } from "msw";
import { conquestResultFixture, gameplayQuestionFixture } from "../fixtures/conquestFixtures";

export const conquestHandlers = [
  http.post("**/api/game-sessions/:gameSessionId/conquest-attempts", async ({ params, request }) => {
    const body = (await request.json()) as { pieceId?: string; targetX?: number; targetY?: number };
    const targetTileId = `tile-${body.targetX ?? 1}-${body.targetY ?? 0}`;
    if (body.targetX === 2 && body.targetY === 0) {
      return HttpResponse.json({ title: "Invalid target", detail: "That tile is occupied.", status: 409 }, { status: 409 });
    }
    return HttpResponse.json(
      gameplayQuestionFixture({
        gameSessionId: String(params.gameSessionId),
        pieceId: body.pieceId ?? "piece-1",
        targetTileId,
      }),
    );
  }),
  http.post("**/api/game-sessions/:gameSessionId/question-attempts/:questionAttemptId/answers", async ({ params, request }) => {
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
