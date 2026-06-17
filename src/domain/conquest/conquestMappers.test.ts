import { describe, expect, it } from "vitest";
import { mapConquestResult, mapGameplayQuestion } from "./conquestMappers";
import { conquestResultFixture, gameplayQuestionFixture } from "../../tests/fixtures/conquestFixtures";

describe("conquestMappers", () => {
  it("maps valid gameplay questions with exactly four answer options", () => {
    expect(mapGameplayQuestion(gameplayQuestionFixture()).answerOptions).toHaveLength(4);
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
});

