import { describe, expect, it } from "vitest";
import { parseQuestionImportJson } from "./questionBankTypes";

const validQuestion = {
  text: "What is C#?",
  answers: [
    { text: "A language", isCorrect: true },
    { text: "A database", isCorrect: false },
    { text: "A protocol", isCorrect: false },
    { text: "An operating system", isCorrect: false },
  ],
};

describe("parseQuestionImportJson", () => {
  it("accepts wrapped and root-array import formats", () => {
    expect(parseQuestionImportJson(JSON.stringify({ questions: [validQuestion] }))).toEqual([validQuestion]);
    expect(parseQuestionImportJson(JSON.stringify([validQuestion]))).toEqual([validQuestion]);
  });

  it("rejects malformed questions before upload", () => {
    expect(() => parseQuestionImportJson("not-json")).toThrow(/not valid json/i);
    expect(() =>
      parseQuestionImportJson(JSON.stringify({ questions: [{ ...validQuestion, answers: validQuestion.answers.slice(0, 3) }] })),
    ).toThrow(/exactly four answers/i);
    expect(() =>
      parseQuestionImportJson(
        JSON.stringify({
          questions: [
            {
              ...validQuestion,
              answers: validQuestion.answers.map((answer) => ({ ...answer, isCorrect: true })),
            },
          ],
        }),
      ),
    ).toThrow(/exactly one correct answer/i);
  });
});
