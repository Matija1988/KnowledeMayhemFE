import { apiBaseUrl } from "./apiConfig";
import { authenticatedRequestJson, authenticatedRequestNoContent, HttpError } from "./httpClient";
import {
  mapCategories,
  mapCategory,
  mapManagementQuestion,
  mapPagedQuestions,
  mapPublicQuestion,
  toCategoryWriteDto,
  toQuestionWriteDto,
  type CategoryDto,
  type PagedQuestionDto,
  type QuestionDto,
} from "../domain/questionBank/questionBankMappers";
import type {
  Category,
  CategoryFormValue,
  PaginatedResult,
  Question,
  QuestionBankActionError,
  QuestionFilter,
  QuestionFormValue,
} from "../domain/questionBank/questionBankTypes";

type QuestionBankRequestOptions = {
  accessToken: string;
};

export async function listCategories(options: QuestionBankRequestOptions): Promise<Category[]> {
  const response = await authenticatedRequestJson<unknown>(`${apiBaseUrl}/api/question-bank/categories`, {
    accessToken: options.accessToken,
  });
  return mapCategories(response);
}

export async function createCategory(value: CategoryFormValue, options: QuestionBankRequestOptions): Promise<Category> {
  const response = await authenticatedRequestJson<CategoryDto, ReturnType<typeof toCategoryWriteDto>>(
    `${apiBaseUrl}/api/question-bank/categories`,
    {
      method: "POST",
      accessToken: options.accessToken,
      body: toCategoryWriteDto(value),
    },
  );
  return mapCategory(response);
}

export async function updateCategory(
  categoryId: string,
  value: CategoryFormValue,
  options: QuestionBankRequestOptions,
): Promise<Category> {
  const response = await authenticatedRequestJson<CategoryDto, ReturnType<typeof toCategoryWriteDto>>(
    `${apiBaseUrl}/api/question-bank/categories/${categoryId}`,
    {
      method: "PUT",
      accessToken: options.accessToken,
      body: toCategoryWriteDto(value),
    },
  );
  return mapCategory(response);
}

export async function deleteCategory(categoryId: string, options: QuestionBankRequestOptions): Promise<void> {
  await authenticatedRequestNoContent(
    `${apiBaseUrl}/api/question-bank/categories/${categoryId}`,
    {
      method: "DELETE",
      accessToken: options.accessToken,
    },
  );
}

export async function createQuestion(value: QuestionFormValue, options: QuestionBankRequestOptions): Promise<Question> {
  const response = await authenticatedRequestJson<QuestionDto, ReturnType<typeof toQuestionWriteDto>>(
    `${apiBaseUrl}/api/question-bank/questions`,
    {
      method: "POST",
      accessToken: options.accessToken,
      body: toQuestionWriteDto(value),
    },
  );
  return mapManagementQuestion(response);
}

export async function getQuestion(questionId: string, options: QuestionBankRequestOptions): Promise<Question> {
  const response = await authenticatedRequestJson<QuestionDto>(`${apiBaseUrl}/api/question-bank/questions/${questionId}`, {
    accessToken: options.accessToken,
  });
  return mapPublicQuestion(response);
}

export async function updateQuestion(
  questionId: string,
  value: QuestionFormValue,
  options: QuestionBankRequestOptions,
): Promise<Question> {
  const response = await authenticatedRequestJson<QuestionDto, ReturnType<typeof toQuestionWriteDto>>(
    `${apiBaseUrl}/api/question-bank/questions/${questionId}`,
    {
      method: "PUT",
      accessToken: options.accessToken,
      body: toQuestionWriteDto(value),
    },
  );
  return mapManagementQuestion(response);
}

export async function deleteQuestion(questionId: string, options: QuestionBankRequestOptions): Promise<void> {
  await authenticatedRequestNoContent(
    `${apiBaseUrl}/api/question-bank/questions/${questionId}`,
    {
      method: "DELETE",
      accessToken: options.accessToken,
    },
  );
}

export async function listManagementQuestions(
  filter: QuestionFilter,
  options: QuestionBankRequestOptions,
): Promise<PaginatedResult<Question>> {
  const params = new URLSearchParams();
  params.set("pageNumber", String(filter.pageNumber));
  params.set("pageSize", String(filter.pageSize));
  if (filter.category) params.set("category", filter.category);
  if (filter.isActive !== null) params.set("isActive", String(filter.isActive));
  if (filter.text) params.set("text", filter.text);
  if (filter.orderBy) params.set("orderBy", filter.orderBy);

  const response = await authenticatedRequestJson<PagedQuestionDto>(
    `${apiBaseUrl}/api/question-bank/management/questions?${params.toString()}`,
    {
      accessToken: options.accessToken,
    },
  );
  return mapPagedQuestions(response);
}

export function normalizeQuestionBankError(error: unknown): QuestionBankActionError {
  if (error instanceof HttpError) {
    const detail = error.problem?.detail ?? error.problem?.title;
    if (error.status === 401) {
      return createQuestionBankError("Please sign in again.", "Session expired", "toast", error.problem?.code);
    }
    if (error.status === 403) {
      return createQuestionBankError("You do not have permission to manage the question bank.", "Permission denied", "modal", error.problem?.code);
    }
    if (error.status === 404) {
      return createQuestionBankError("The requested question bank item was not found.", "Not found", "toast", error.problem?.code);
    }
    if (error.status === 409) {
      return {
        ...createQuestionBankError(
          detail ?? "Another staff user changed this item. Reload the latest version before saving again.",
          "Conflicting change",
          "modal",
          error.problem?.code,
        ),
        isConflict: true,
      };
    }
    if (error.status === 400) {
      return createQuestionBankError(detail ?? "Check the form values and try again.", "Validation problem", "toast", error.problem?.code);
    }
    if (error.status === 429) {
      return createQuestionBankError("Too many requests. Wait a moment and try again.", "Slow down", "toast", error.problem?.code);
    }
    if (error.status >= 500) {
      return createQuestionBankError("Question bank service is temporarily unavailable.", "Question bank unavailable", "modal", error.problem?.code);
    }
  }

  if (error instanceof TypeError) {
    return createQuestionBankError(
      "Unable to reach the backend API. Check VITE_API_BASE_URL and backend CORS configuration.",
      "Question bank problem",
    );
  }

  return createQuestionBankError("We could not complete that question bank action. Try again.", "Question bank problem");
}

function createQuestionBankError(
  message: string,
  title = "Question bank problem",
  displayMode: QuestionBankActionError["displayMode"] = "toast",
  code?: string,
): QuestionBankActionError {
  return { title, message, displayMode, code };
}
