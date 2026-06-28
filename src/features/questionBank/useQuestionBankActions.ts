import {
  createCategory,
  createQuestion,
  deleteCategory,
  deleteQuestion,
  listCategories,
  listManagementQuestions,
  importQuestions as importQuestionsApi,
  normalizeQuestionBankError,
  updateCategory,
  updateQuestion,
} from "../../api/questionBankApi";
import type { CategoryFormValue, QuestionFilter, QuestionFormValue, QuestionImportItem } from "../../domain/questionBank/questionBankTypes";
import { useAuthStore } from "../../stores/authStore";
import { useErrorStore } from "../../stores/errorStore";
import { useLoadingStore } from "../../stores/loadingStore";
import { useQuestionBankStore } from "../../stores/questionBankStore";

export function useQuestionBankActions() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const showError = useErrorStore((state) => state.showError);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const store = useQuestionBankStore();

  const requireToken = () => {
    if (!accessToken) {
      throw new Error("Missing access token.");
    }
    return accessToken;
  };

  async function run<T>(
    operation: Parameters<typeof showLoading>[0],
    pendingOperation: Parameters<typeof store.startPending>[0],
    action: (token: string) => Promise<T>,
  ): Promise<T | null> {
    if (store.pendingOperations.includes(pendingOperation)) {
      return null;
    }

    store.startPending(pendingOperation);
    showLoading(operation);
    try {
      store.setConflict(null);
      return await action(requireToken());
    } catch (error) {
      const normalized = normalizeQuestionBankError(error);
      if (normalized.isConflict) {
        store.setConflict(normalized.message);
      }
      showError(normalized);
      return null;
    } finally {
      store.stopPending(pendingOperation);
      hideLoading();
    }
  }

  return {
    loadCategories: () =>
      run("listCategories", "loadCategories", async (token) => {
        const categories = await listCategories({ accessToken: token });
        store.setCategories(categories);
        return categories;
      }),
    saveCategory: (value: CategoryFormValue, categoryId?: string) =>
      run(categoryId ? "updateCategory" : "createCategory", categoryId ? "updateCategory" : "createCategory", async (token) => {
        const category = categoryId
          ? await updateCategory(categoryId, value, { accessToken: token })
          : await createCategory(value, { accessToken: token });
        store.upsertCategory(category);
        return category;
      }),
    removeCategory: (categoryId: string) =>
      run("deleteCategory", "deleteCategory", async (token) => {
        await deleteCategory(categoryId, { accessToken: token });
        return true;
      }),
    loadQuestions: (filter: QuestionFilter = store.filters) =>
      run("listQuestions", "loadQuestions", async (token) => {
        const questions = await listManagementQuestions(filter, { accessToken: token });
        store.setQuestions(questions);
        return questions;
      }),
    saveQuestion: (value: QuestionFormValue, questionId?: string) =>
      run(questionId ? "updateQuestion" : "createQuestion", questionId ? "updateQuestion" : "createQuestion", async (token) => {
        const question = questionId
          ? await updateQuestion(questionId, value, { accessToken: token })
          : await createQuestion(value, { accessToken: token });
        store.upsertQuestion(question);
        return question;
      }),
    removeQuestion: (questionId: string) =>
      run("deleteQuestion", "deleteQuestion", async (token) => {
        await deleteQuestion(questionId, { accessToken: token });
        return true;
      }),
    importQuestions: (categoryId: string, questions: QuestionImportItem[]) =>
      run("importQuestions", "importQuestions", (token) =>
        importQuestionsApi(categoryId, questions, { accessToken: token }),
      ),
  };
}
