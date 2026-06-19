import type { AuthError } from "../auth";

export type Category = {
  id: string;
  name: string;
  description: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  isActive: boolean;
  deletedAtUtc: string | null;
};

export type Answer = {
  id: string | null;
  questionId: string | null;
  text: string;
  isCorrect: boolean;
  createdAtUtc: string | null;
  updatedAtUtc: string | null;
  isActive: boolean;
  deletedAtUtc: string | null;
};

export type Question = {
  id: string;
  categoryId: string;
  categoryName: string;
  text: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  isActive: boolean;
  deletedAtUtc: string | null;
  answers: Answer[];
};

export type QuestionFormValue = {
  categoryId: string;
  text: string;
  answers: Array<{ text: string; isCorrect: boolean }>;
  isActive?: boolean;
  version?: string | null;
};

export type QuestionFilter = {
  pageNumber: number;
  pageSize: number;
  category: string | null;
  isActive: boolean | null;
  text: string | null;
  orderBy: string;
};

export type PaginatedResult<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
};

export type CategoryFormValue = {
  name: string;
  description: string;
};

export type CategoryFieldErrors = Partial<Record<keyof CategoryFormValue, string>>;
export type QuestionFieldErrors = Partial<Record<"categoryId" | "text" | "answers" | `answer-${number}`, string>>;

export type QuestionBankActionError = AuthError & {
  code?: string;
  isConflict?: boolean;
};

export const defaultQuestionFilter: QuestionFilter = {
  pageNumber: 1,
  pageSize: 10,
  category: null,
  isActive: true,
  text: null,
  orderBy: "createdAt",
};

export function createEmptyQuestionForm(): QuestionFormValue {
  return {
    categoryId: "",
    text: "",
    answers: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  };
}

export function toQuestionFormValue(question: Question): QuestionFormValue {
  const answers = question.answers.slice(0, 4).map((answer) => ({
    text: answer.text,
    isCorrect: answer.isCorrect,
  }));

  while (answers.length < 4) {
    answers.push({ text: "", isCorrect: false });
  }

  if (!answers.some((answer) => answer.isCorrect)) {
    answers[0].isCorrect = true;
  }

  return {
    categoryId: question.categoryId,
    text: question.text,
    answers,
    isActive: question.isActive,
    version: question.updatedAtUtc,
  };
}

export function validateCategoryForm(value: CategoryFormValue): CategoryFieldErrors {
  const errors: CategoryFieldErrors = {};
  const name = value.name.trim();
  const description = value.description.trim();

  if (!name) {
    errors.name = "Enter a category name.";
  } else if (name.length > 40) {
    errors.name = "Category name must be 40 characters or fewer.";
  }

  if (!description) {
    errors.description = "Enter a category description.";
  } else if (description.length > 300) {
    errors.description = "Category description must be 300 characters or fewer.";
  }

  return errors;
}

export function validateQuestionForm(value: QuestionFormValue, activeCategories: Category[]): QuestionFieldErrors {
  const errors: QuestionFieldErrors = {};
  const activeCategoryIds = new Set(activeCategories.filter((category) => category.isActive).map((category) => category.id));

  if (!value.categoryId) {
    errors.categoryId = "Choose a category.";
  } else if (!activeCategoryIds.has(value.categoryId)) {
    errors.categoryId = "Choose an active category.";
  }

  if (!value.text.trim()) {
    errors.text = "Enter question text.";
  } else if (value.text.trim().length > 1000) {
    errors.text = "Question text must be 1000 characters or fewer.";
  }

  if (value.answers.length !== 4) {
    errors.answers = "A question must have exactly four answers.";
  }

  const correctCount = value.answers.filter((answer) => answer.isCorrect).length;
  if (correctCount !== 1) {
    errors.answers = "Choose exactly one correct answer.";
  }

  value.answers.forEach((answer, index) => {
    const key = `answer-${index}` as const;
    if (!answer.text.trim()) {
      errors[key] = "Enter answer text.";
    } else if (answer.text.trim().length > 1000) {
      errors[key] = "Answer text must be 1000 characters or fewer.";
    }
  });

  return errors;
}

export function hasFormErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
