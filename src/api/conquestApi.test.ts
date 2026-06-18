import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { gameplayQuestionFixture } from "../tests/fixtures/conquestFixtures";
import { server } from "../tests/setup";
import { HttpError } from "./httpClient";
import { normalizeConquestError, startConquestAttempt, submitConquestAnswer } from "./conquestApi";

describe("conquestApi", () => {
  it("starts conquest attempts and maps returned questions", async () => {
    await expect(
      startConquestAttempt("session-1", { pieceId: "piece-1", targetX: 1, targetY: 0 }, { accessToken: "token" }),
    ).resolves.toMatchObject({ questionAttemptId: "attempt-1", answerOptions: expect.any(Array) });
  });

  it("sends conquest start payload as piece id and target coordinates", async () => {
    server.use(
      http.post("**/api/game-sessions/:gameSessionId/conquest-attempts", async ({ request }) => {
        const body = (await request.json()) as { pieceId: string; targetX: number; targetY: number; targetTileId?: string };
        expect(body).toEqual({ pieceId: "piece-1", targetX: 1, targetY: 0 });
        expect(body.targetTileId).toBeUndefined();
        return HttpResponse.json(gameplayQuestionFixture());
      }),
    );

    await startConquestAttempt("session-1", { pieceId: "piece-1", targetX: 1, targetY: 0 }, { accessToken: "token" });
  });

  it("submits answers and maps authoritative results", async () => {
    await expect(submitConquestAnswer("session-1", "attempt-1", { answerId: "answer-1" }, { accessToken: "token" })).resolves.toMatchObject({
      resultStatus: "Succeeded",
      isCorrect: true,
    });
  });

  it("normalizes conquest errors", () => {
    expect(normalizeConquestError(new HttpError(409, { detail: "Attempt expired" })).message).toBe("Attempt expired");
    expect(normalizeConquestError(new Error("Gameplay question response must include exactly four answer options.")).displayMode).toBe("modal");
    expect(normalizeConquestError(new TypeError("Failed to fetch")).title).toBe("Network unavailable");
  });
});
