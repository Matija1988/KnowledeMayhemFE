import { describe, expect, it } from "vitest";
import { HttpError } from "./httpClient";
import {
  createCategory,
  createQuestion,
  deleteCategory,
  deleteQuestion,
  listCategories,
  importQuestions,
  listManagementQuestions,
  normalizeQuestionBankError,
  updateCategory,
  updateQuestion,
} from "./questionBankApi";
import { defaultQuestionFilter } from "../domain/questionBank/questionBankTypes";
import { server } from "../tests/setup";
import { http, HttpResponse } from "msw";
import { questionPageFixture } from "../tests/fixtures/questionBankFixtures";

describe("questionBankApi", () => {
  it("calls category endpoints and maps responses", async () => {
    await expect(listCategories({ accessToken: "token" })).resolves.toHaveLength(2);
    await expect(createCategory({ name: "Java", description: "Language", color: "#EA580C" }, { accessToken: "token" })).resolves.toMatchObject({
      name: "Java",
      color: "#EA580C",
    });
    await expect(updateCategory("cat-1", { name: "C#", description: "Updated", color: "#2563EB" }, { accessToken: "token" })).resolves.toMatchObject({
      description: "Updated",
      color: "#2563EB",
    });
    await expect(deleteCategory("cat-1", { accessToken: "token" })).resolves.toBeUndefined();
  });

  it("calls question endpoints and maps management correctness", async () => {
    await expect(listManagementQuestions(defaultQuestionFilter, { accessToken: "token" })).resolves.toMatchObject({
      totalCount: 1,
    });
    const value = {
      categoryId: "10000000-0000-0000-0000-000000000001",
      text: "Question?",
      answers: [
        { text: "A", isCorrect: true },
        { text: "B", isCorrect: false },
        { text: "C", isCorrect: false },
        { text: "D", isCorrect: false },
      ],
    };
    await expect(createQuestion(value, { accessToken: "token" })).resolves.toMatchObject({
      answers: expect.arrayContaining([expect.objectContaining({ isCorrect: true })]),
    });
    await expect(updateQuestion("q-1", value, { accessToken: "token" })).resolves.toMatchObject({ text: "What is C#?" });
    await expect(deleteQuestion("q-1", { accessToken: "token" })).resolves.toBeUndefined();
    await expect(importQuestions(value.categoryId, [value], { accessToken: "token" })).resolves.toMatchObject({
      categoryId: value.categoryId,
      importedCount: 1,
    });
  });

  it("sends management category filters as backend category names", async () => {
    let requestedCategory: string | null = null;
    server.use(
      http.get("**/api/question-bank/management/questions", ({ request }) => {
        requestedCategory = new URL(request.url).searchParams.get("category");
        return HttpResponse.json(questionPageFixture);
      }),
    );

    await listManagementQuestions({ ...defaultQuestionFilter, category: "C#" }, { accessToken: "token" });

    expect(requestedCategory).toBe("C#");
  });

  it("normalizes authorization, conflict, and network errors", () => {
    expect(normalizeQuestionBankError(new HttpError(403, null)).displayMode).toBe("modal");
    expect(normalizeQuestionBankError(new HttpError(409, { detail: "Conflict" })).isConflict).toBe(true);
    expect(normalizeQuestionBankError(new TypeError("Failed to fetch")).message).toContain("VITE_API_BASE_URL");
  });
});
