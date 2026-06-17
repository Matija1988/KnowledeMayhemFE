import { describe, expect, it } from "vitest";
import { HttpError } from "./httpClient";
import { normalizeConquestError, startConquestAttempt, submitConquestAnswer } from "./conquestApi";

describe("conquestApi", () => {
  it("starts conquest attempts and maps returned questions", async () => {
    await expect(
      startConquestAttempt("session-1", { pieceId: "piece-1", targetTileId: "tile-1-0" }, { accessToken: "token" }),
    ).resolves.toMatchObject({ questionAttemptId: "attempt-1", answerOptions: expect.any(Array) });
  });

  it("submits answers and maps authoritative results", async () => {
    await expect(submitConquestAnswer("attempt-1", { answerId: "answer-1" }, { accessToken: "token" })).resolves.toMatchObject({
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

