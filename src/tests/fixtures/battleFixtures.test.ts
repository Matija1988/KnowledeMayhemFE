import { describe, expect, it } from "vitest";
import { battleAuditExpectations } from "./battleFixtures";

describe("battle audit fixture expectations", () => {
  it("documents required audit correlation fields without frontend correctness leakage", () => {
    expect(battleAuditExpectations.map((expectation) => expectation.event)).toEqual([
      "battle-start",
      "answer-submission",
      "battle-result",
      "special-field-result",
      "piece-capture",
      "piece-level-up",
      "turn-advanced",
    ]);

    expect(battleAuditExpectations.every((expectation) => expectation.requiredFields.length > 0)).toBe(true);
    expect(
      battleAuditExpectations.flatMap((expectation) => expectation.forbiddenFrontendFields),
    ).toEqual(expect.arrayContaining(["correctAnswerId", "isCorrect"]));
  });
});
