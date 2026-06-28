import type { Category, PaginatedResult, Question } from "./questionBankTypes";

export type CategoryDto = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  color?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  isActive?: unknown;
  deletedAt?: unknown;
};

export type QuestionAnswerWriteDto = {
  text: string;
  isCorrect: boolean;
};

export type QuestionAnswerDto = {
  id?: unknown;
  questionId?: unknown;
  text?: unknown;
  isCorrect?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  isActive?: unknown;
  deletedAt?: unknown;
};

export type QuestionDto = {
  id?: unknown;
  categoryId?: unknown;
  categoryName?: unknown;
  text?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  isActive?: unknown;
  deletedAt?: unknown;
  answers?: unknown;
};

export type PagedQuestionDto = {
  items?: unknown;
  pageNumber?: unknown;
  pageSize?: unknown;
  totalCount?: unknown;
};

export function mapCategory(dto: CategoryDto): Category {
  return {
    id: requiredString(dto.id, "Category id"),
    name: requiredString(dto.name, "Category name"),
    description: requiredString(dto.description, "Category description"),
    color: requiredHexColor(dto.color),
    createdAtUtc: requiredString(dto.createdAt, "Category createdAt"),
    updatedAtUtc: optionalString(dto.updatedAt),
    isActive: requiredBoolean(dto.isActive, "Category isActive"),
    deletedAtUtc: optionalString(dto.deletedAt),
  };
}

export function mapCategories(dto: unknown): Category[] {
  if (!Array.isArray(dto)) {
    throw new Error("Categories response was not an array.");
  }

  return dto.map((item) => mapCategory(item as CategoryDto));
}

export function mapPublicQuestion(dto: QuestionDto): Question {
  return mapQuestion(dto, false);
}

export function mapManagementQuestion(dto: QuestionDto): Question {
  return mapQuestion(dto, true);
}

export function mapPagedQuestions(dto: PagedQuestionDto): PaginatedResult<Question> {
  if (!Array.isArray(dto.items)) {
    throw new Error("Question page items were not an array.");
  }

  return {
    items: dto.items.map((item) => mapManagementQuestion(item as QuestionDto)),
    pageNumber: requiredNumber(dto.pageNumber, "Page number"),
    pageSize: requiredNumber(dto.pageSize, "Page size"),
    totalCount: requiredNumber(dto.totalCount, "Total count"),
  };
}

export function toCategoryWriteDto(value: { name: string; description: string; color: string }) {
  return {
    name: value.name.trim(),
    description: value.description.trim(),
    color: value.color.trim().toUpperCase(),
  };
}

export function toQuestionWriteDto(value: {
  categoryId: string;
  text: string;
  answers: Array<{ text: string; isCorrect: boolean }>;
}) {
  return {
    categoryId: value.categoryId,
    text: value.text.trim(),
    answers: value.answers.map((answer): QuestionAnswerWriteDto => ({
      text: answer.text.trim(),
      isCorrect: answer.isCorrect,
    })),
  };
}

function mapQuestion(dto: QuestionDto, includeCorrectness: boolean): Question {
  if (!Array.isArray(dto.answers)) {
    throw new Error("Question answers were not an array.");
  }

  return {
    id: requiredString(dto.id, "Question id"),
    categoryId: requiredString(dto.categoryId, "Question categoryId"),
    categoryName: requiredString(dto.categoryName, "Question categoryName"),
    text: requiredString(dto.text, "Question text"),
    createdAtUtc: requiredString(dto.createdAt, "Question createdAt"),
    updatedAtUtc: optionalString(dto.updatedAt),
    isActive: requiredBoolean(dto.isActive, "Question isActive"),
    deletedAtUtc: optionalString(dto.deletedAt),
    answers: dto.answers.map((item) => mapAnswer(item as QuestionAnswerDto, includeCorrectness)),
  };
}

function mapAnswer(dto: QuestionAnswerDto, includeCorrectness: boolean) {
  return {
    id: optionalString(dto.id),
    questionId: optionalString(dto.questionId),
    text: requiredString(dto.text, "Answer text"),
    isCorrect: includeCorrectness ? requiredBoolean(dto.isCorrect, "Answer isCorrect") : false,
    createdAtUtc: optionalString(dto.createdAt),
    updatedAtUtc: optionalString(dto.updatedAt),
    isActive: typeof dto.isActive === "boolean" ? dto.isActive : true,
    deletedAtUtc: optionalString(dto.deletedAt),
  };
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} was missing.`);
  }

  return value;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function requiredBoolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${label} was missing.`);
  }

  return value;
}

function requiredNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} was missing.`);
  }

  return value;
}

function requiredHexColor(value: unknown): string {
  const color = requiredString(value, "Category color").toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(color)) {
    throw new Error("Category color was invalid.");
  }
  return color;
}
