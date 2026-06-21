import { describe, expect, it } from "vitest";
import { mapConquestResult, mapGameplayQuestion } from "./conquestMappers";
import { conquestResultFixture, gameplayQuestionFixture } from "../../tests/fixtures/conquestFixtures";

describe("conquestMappers", () => {
  it("maps valid gameplay questions with exactly four answer options", () => {
    expect(mapGameplayQuestion(gameplayQuestionFixture()).answerOptions).toHaveLength(4);
  });

  it("maps backend gameplay questions that omit attempt context and use answerId", () => {
    const question = mapGameplayQuestion(
      {
        questionAttemptId: "attempt-backend",
        questionId: "question-1",
        categoryId: "category-1",
        categoryName: "C#",
        questionText: "C# seeded question 1?",
        answerOptions: [
          { answerId: "answer-1", text: "A" },
          { answerId: "answer-2", text: "B" },
          { answerId: "answer-3", text: "C" },
          { answerId: "answer-4", text: "D" },
        ],
      },
      {
        gameSessionId: "session-1",
        playerId: "player-1",
        pieceId: "piece-1",
        sourceTileId: "tile-0-0",
        targetTileId: "tile-1-0",
      },
    );

    expect(question).toMatchObject({
      questionAttemptId: "attempt-backend",
      gameSessionId: "session-1",
      playerId: "player-1",
      pieceId: "piece-1",
      targetTileId: "tile-1-0",
      answerOptions: [{ id: "answer-1", text: "A" }, { id: "answer-2", text: "B" }, { id: "answer-3", text: "C" }, { id: "answer-4", text: "D" }],
    });
  });

  it("rejects malformed questions and answer correctness leakage", () => {
    expect(() => mapGameplayQuestion({ ...gameplayQuestionFixture(), answerOptions: [] })).toThrow(/exactly four/i);
    expect(() =>
      mapGameplayQuestion({
        ...gameplayQuestionFixture(),
        answerOptions: [{ id: "a", text: "A", isCorrect: true }, ...gameplayQuestionFixture().answerOptions.slice(1)],
      }),
    ).toThrow(/correctness/i);
  });

  it("maps resolved conquest results and rejects pending results", () => {
    expect(mapConquestResult(conquestResultFixture()).resultStatus).toBe("Succeeded");
    expect(() => mapConquestResult({ ...conquestResultFixture(), resultStatus: "Pending" })).toThrow(/resolved/i);
  });

  it("maps backend conquest results that use status and pieceTileId", () => {
    const result = mapConquestResult(
      {
        questionAttemptId: "attempt-1",
        gameSessionId: "session-1",
        status: "Succeeded",
        wasAnswerCorrect: true,
        pieceTileId: "tile-1-0",
        updatedOwnerPlayerId: "player-1",
        nextTurnPlayerId: "player-2",
        turnNumber: 2,
      },
      {
        pieceId: "piece-1",
        sourceTileId: "tile-0-0",
        targetTileId: "tile-1-0",
      },
    );

    expect(result).toMatchObject({
      resultStatus: "Succeeded",
      isCorrect: true,
      currentTileId: "tile-1-0",
      ownerPlayerId: "player-1",
      pieceId: "piece-1",
    });
  });

  it("maps realtime backend conquest success events that use from/to tile ids", () => {
    const result = mapConquestResult({
      questionAttemptId: "attempt-1",
      gameSessionId: "session-1",
      playerId: "player-1",
      pieceId: "piece-1",
      fromTileId: "tile-0-0",
      toTileId: "tile-1-0",
      ownerPlayerId: "player-1",
      turnNumber: 2,
    });

    expect(result).toMatchObject({
      resultStatus: "Succeeded",
      isCorrect: true,
      sourceTileId: "tile-0-0",
      targetTileId: "tile-1-0",
      currentTileId: "tile-1-0",
      ownerPlayerId: "player-1",
    });
  });
});
