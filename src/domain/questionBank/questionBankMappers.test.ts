import { describe, expect, it } from "vitest";
import { categoryFixture, managementQuestionFixture, questionPageFixture } from "../../tests/fixtures/questionBankFixtures";
import {
  mapCategories,
  mapManagementQuestion,
  mapPagedQuestions,
  mapPublicQuestion,
  toCategoryWriteDto,
  toQuestionWriteDto,
} from "./questionBankMappers";

describe("questionBankMappers", () => {
  it("maps categories and trims write payloads", () => {
    expect(mapCategories([categoryFixture])[0]).toMatchObject({ name: "C#", isActive: true });
    expect(toCategoryWriteDto({ name: "  C#  ", description: "  Language  " })).toEqual({
      name: "C#",
      description: "Language",
    });
  });

  it("keeps answer correctness only for management question responses", () => {
    expect(mapManagementQuestion(managementQuestionFixture).answers[0].isCorrect).toBe(true);
    expect(mapPublicQuestion(managementQuestionFixture).answers[0].isCorrect).toBe(false);
  });

  it("maps paged management responses and write payloads", () => {
    expect(mapPagedQuestions(questionPageFixture)).toMatchObject({ totalCount: 1, items: [{ text: "What is C#?" }] });
    expect(toQuestionWriteDto({ categoryId: "cat", text: "  Q? ", answers: [{ text: " A ", isCorrect: true }] })).toEqual({
      categoryId: "cat",
      text: "Q?",
      answers: [{ text: "A", isCorrect: true }],
    });
  });

  it("rejects malformed payloads", () => {
    expect(() => mapCategories({})).toThrow(/array/i);
    expect(() => mapManagementQuestion({ ...managementQuestionFixture, answers: null })).toThrow(/answers/i);
  });
});
