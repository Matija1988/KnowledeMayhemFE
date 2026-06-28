import { create } from "zustand";
import type { Category, PaginatedResult, Question, QuestionFilter } from "../domain/questionBank/questionBankTypes";
import { defaultQuestionFilter } from "../domain/questionBank/questionBankTypes";

type QuestionBankPendingOperation =
  | "loadCategories"
  | "createCategory"
  | "updateCategory"
  | "deleteCategory"
  | "loadQuestions"
  | "loadQuestion"
  | "createQuestion"
  | "importQuestions"
  | "updateQuestion"
  | "deleteQuestion";

type QuestionBankStore = {
  categories: Category[];
  questions: PaginatedResult<Question>;
  selectedCategory: Category | null;
  selectedQuestion: Question | null;
  filters: QuestionFilter;
  pendingOperations: QuestionBankPendingOperation[];
  conflictMessage: string | null;
  setCategories: (categories: Category[]) => void;
  upsertCategory: (category: Category) => void;
  setQuestions: (questions: PaginatedResult<Question>) => void;
  upsertQuestion: (question: Question) => void;
  setSelectedCategory: (category: Category | null) => void;
  setSelectedQuestion: (question: Question | null) => void;
  setFilters: (filters: Partial<QuestionFilter>) => void;
  resetFilters: () => void;
  startPending: (operation: QuestionBankPendingOperation) => void;
  stopPending: (operation: QuestionBankPendingOperation) => void;
  setConflict: (message: string | null) => void;
  reset: () => void;
};

const emptyQuestions: PaginatedResult<Question> = {
  items: [],
  pageNumber: 1,
  pageSize: defaultQuestionFilter.pageSize,
  totalCount: 0,
};

export const useQuestionBankStore = create<QuestionBankStore>((set) => ({
  categories: [],
  questions: emptyQuestions,
  selectedCategory: null,
  selectedQuestion: null,
  filters: defaultQuestionFilter,
  pendingOperations: [],
  conflictMessage: null,
  setCategories: (categories) => set({ categories }),
  upsertCategory: (category) =>
    set((state) => ({
      categories: upsertById(state.categories, category),
      selectedCategory: state.selectedCategory?.id === category.id ? category : state.selectedCategory,
    })),
  setQuestions: (questions) => set({ questions }),
  upsertQuestion: (question) =>
    set((state) => ({
      questions: {
        ...state.questions,
        items: upsertById(state.questions.items, question),
      },
      selectedQuestion: state.selectedQuestion?.id === question.id ? question : state.selectedQuestion,
    })),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedQuestion: (question) => set({ selectedQuestion: question }),
  setFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
        pageNumber:
          filters.category !== undefined || filters.isActive !== undefined || filters.text !== undefined || filters.pageSize
            ? 1
            : filters.pageNumber ?? state.filters.pageNumber,
      },
    })),
  resetFilters: () => set({ filters: defaultQuestionFilter }),
  startPending: (operation) =>
    set((state) => ({
      pendingOperations: state.pendingOperations.includes(operation)
        ? state.pendingOperations
        : [...state.pendingOperations, operation],
    })),
  stopPending: (operation) =>
    set((state) => ({
      pendingOperations: state.pendingOperations.filter((item) => item !== operation),
    })),
  setConflict: (message) => set({ conflictMessage: message }),
  reset: () =>
    set({
      categories: [],
      questions: emptyQuestions,
      selectedCategory: null,
      selectedQuestion: null,
      filters: defaultQuestionFilter,
      pendingOperations: [],
      conflictMessage: null,
    }),
}));

export function selectActiveCategories(categories: Category[]): Category[] {
  return categories.filter((category) => category.isActive && !category.deletedAtUtc);
}

export function isQuestionBankPending(operation: QuestionBankPendingOperation): boolean {
  return useQuestionBankStore.getState().pendingOperations.includes(operation);
}

export function resetQuestionBankStoreForTests(): void {
  useQuestionBankStore.getState().reset();
}

function upsertById<T extends { id: string }>(items: T[], next: T): T[] {
  const index = items.findIndex((item) => item.id === next.id);
  if (index === -1) {
    return [next, ...items];
  }

  return items.map((item) => (item.id === next.id ? next : item));
}
