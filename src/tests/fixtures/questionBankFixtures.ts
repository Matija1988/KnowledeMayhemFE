import type { CategoryDto, PagedQuestionDto, QuestionDto } from "../../domain/questionBank/questionBankMappers";

export function createRoleJwt(role: "Player" | "Moderator" | "Admin"): string {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ role, exp: 4_102_444_800 })}.`;
}

export const playerToken = createRoleJwt("Player");
export const moderatorToken = createRoleJwt("Moderator");
export const adminToken = createRoleJwt("Admin");

export const categoryFixture: CategoryDto = {
  id: "10000000-0000-0000-0000-000000000001",
  name: "C#",
  description: "C# language questions",
  createdAt: "2026-06-18T10:00:00Z",
  updatedAt: null,
  isActive: true,
  deletedAt: null,
};

export const inactiveCategoryFixture: CategoryDto = {
  id: "10000000-0000-0000-0000-000000000002",
  name: "Legacy",
  description: "Inactive category",
  createdAt: "2026-06-18T10:00:00Z",
  updatedAt: null,
  isActive: false,
  deletedAt: "2026-06-18T11:00:00Z",
};

export const managementQuestionFixture: QuestionDto = {
  id: "20000000-0000-0000-0000-000000000001",
  categoryId: categoryFixture.id,
  categoryName: categoryFixture.name,
  text: "What is C#?",
  createdAt: "2026-06-18T10:00:00Z",
  updatedAt: null,
  isActive: true,
  answers: [
    { id: "30000000-0000-0000-0000-000000000001", text: "A programming language", isCorrect: true },
    { id: "30000000-0000-0000-0000-000000000002", text: "A database", isCorrect: false },
    { id: "30000000-0000-0000-0000-000000000003", text: "A markup language", isCorrect: false },
    { id: "30000000-0000-0000-0000-000000000004", text: "A protocol", isCorrect: false },
  ],
};

export const questionPageFixture: PagedQuestionDto = {
  items: [managementQuestionFixture],
  pageNumber: 1,
  pageSize: 10,
  totalCount: 1,
};

export const conflictProblem = {
  title: "Conflicting change",
  detail: "Another staff user changed this item.",
  status: 409,
  code: "question-bank.conflict",
};
