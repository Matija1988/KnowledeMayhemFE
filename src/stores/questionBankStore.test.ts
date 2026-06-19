import { describe, expect, it } from "vitest";
import { categoryFixture, managementQuestionFixture, questionPageFixture } from "../tests/fixtures/questionBankFixtures";
import { mapCategory, mapManagementQuestion, mapPagedQuestions } from "../domain/questionBank/questionBankMappers";
import { selectActiveCategories, useQuestionBankStore } from "./questionBankStore";

describe("questionBankStore", () => {
  it("tracks categories, active selectors, questions, filters, pending state, and conflicts", () => {
    const category = mapCategory(categoryFixture);
    const question = mapManagementQuestion(managementQuestionFixture);
    useQuestionBankStore.getState().setCategories([category]);
    useQuestionBankStore.getState().setQuestions(mapPagedQuestions(questionPageFixture));
    useQuestionBankStore.getState().upsertQuestion({ ...question, text: "Updated?" });
    useQuestionBankStore.getState().setFilters({ text: "Updated" });
    useQuestionBankStore.getState().startPending("loadQuestions");
    useQuestionBankStore.getState().setConflict("Conflict");

    expect(selectActiveCategories(useQuestionBankStore.getState().categories)).toHaveLength(1);
    expect(useQuestionBankStore.getState().questions.items[0].text).toBe("Updated?");
    expect(useQuestionBankStore.getState().filters.pageNumber).toBe(1);
    expect(useQuestionBankStore.getState().pendingOperations).toContain("loadQuestions");
    expect(useQuestionBankStore.getState().conflictMessage).toBe("Conflict");
  });
});
