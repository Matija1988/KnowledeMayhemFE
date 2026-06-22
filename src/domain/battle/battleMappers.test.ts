import { describe, expect, it } from "vitest";
import { mapBattleQuestion, mapBattleResult } from "./battleMappers";
import { battleQuestionFixture, battleResultFixture } from "../../tests/fixtures/battleFixtures";

describe("battleMappers", () => {
  it("maps safe battle questions and preserves progress", () => {
    const question = battleQuestionFixture();

    expect(
      mapBattleQuestion(
        {
          battleAttemptId: question.attemptId,
          questionAttemptId: question.questionAttemptId,
          questionId: question.questionId,
          gameSessionId: question.gameSessionId,
          actingPlayerId: question.actingPlayerId,
          pieceId: question.pieceId,
          sourceTileId: question.sourceTileId,
          targetTileId: question.targetTileId,
          categoryId: question.categoryId,
          categoryName: question.categoryName,
          questionText: question.questionText,
          answerOptions: question.answerOptions.map((option) => ({ answerId: option.id, text: option.text })),
          progress: question.progress,
        },
        { attemptKind: "Battle" },
      ),
    ).toMatchObject({ attemptId: "battle-1", progress: { requiredCorrectAnswers: 2 } });
  });

  it("rejects hidden correctness metadata", () => {
    const question = battleQuestionFixture();

    expect(() =>
      mapBattleQuestion(
        {
          battleAttemptId: question.attemptId,
          questionAttemptId: question.questionAttemptId,
          questionId: question.questionId,
          gameSessionId: question.gameSessionId,
          actingPlayerId: question.actingPlayerId,
          pieceId: question.pieceId,
          sourceTileId: question.sourceTileId,
          targetTileId: question.targetTileId,
          categoryId: question.categoryId,
          questionText: question.questionText,
          answerOptions: [
            { answerId: "answer-1", text: "Alpha", isCorrect: true },
            { answerId: "answer-2", text: "Beta" },
          ],
          progress: question.progress,
        },
        { attemptKind: "Battle" },
      ),
    ).toThrow(/correctness/);
  });

  it("maps battle results", () => {
    const result = battleResultFixture();

    expect(
      mapBattleResult(
        {
          battleAttemptId: result.attemptId,
          gameSessionId: result.gameSessionId,
          status: result.status,
          movedPieceId: result.movedPieceId ?? undefined,
          capturedPieceId: result.capturedPieceId ?? undefined,
          sourceTileId: result.sourceTileId ?? undefined,
          targetTileId: result.targetTileId ?? undefined,
          sequence: result.sequence ?? undefined,
        },
        { attemptKind: "Battle" },
      ),
    ).toMatchObject({ attemptId: "battle-1", status: "Succeeded", capturedPieceId: "piece-2" });
  });
});
