import { http, HttpResponse } from "msw";
import { gameActionResultFixture, gameCompletionSummaryFixture, gameSessionFixture, malformedGameSessionFixture } from "../fixtures/gameFixtures";

export const gameHandlers = [
  http.get("**/api/game-sessions/malformed", () => HttpResponse.json(malformedGameSessionFixture())),
  http.get("**/api/game-sessions/completed", () => HttpResponse.json(gameSessionFixture({ id: "completed", status: "Completed", endedAtUtc: "2026-06-16T10:30:00.000Z" }))),
  http.get("**/api/game-sessions/cancelled", () => HttpResponse.json(gameSessionFixture({ id: "cancelled", status: "Cancelled", endedAtUtc: "2026-06-16T10:30:00.000Z" }))),
  http.get("**/api/game-sessions/missing", () => HttpResponse.json({ title: "Not found", status: 404 }, { status: 404 })),
  http.get("**/api/game-sessions/:gameSessionId/completion-summary", ({ params }) =>
    HttpResponse.json(gameCompletionSummaryFixture(String(params.gameSessionId))),
  ),
  http.get("**/api/game-sessions/:gameSessionId", ({ params }) =>
    HttpResponse.json(gameSessionFixture({ id: String(params.gameSessionId) })),
  ),
  http.get("**/api/game-sessions/:gameSessionId/turn", ({ params }) =>
    HttpResponse.json({
      gameSessionId: String(params.gameSessionId),
      currentTurnPlayerId: "player-1",
      turnNumber: 1,
      status: null,
    }),
  ),
  http.post("**/api/game-sessions/:gameSessionId/moves", async ({ request }) => {
    const body = (await request.json()) as { pieceId?: string; targetX?: number; targetY?: number };
    if (body.targetX === 2 && body.targetY === 0) {
      return HttpResponse.json({ title: "Illegal move", detail: "That tile is occupied.", status: 409 }, { status: 409 });
    }
    return HttpResponse.json(gameActionResultFixture({ pieceId: body.pieceId, targetX: body.targetX, targetY: body.targetY }));
  }),
];
