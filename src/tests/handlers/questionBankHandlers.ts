import { http, HttpResponse } from "msw";
import {
  categoryFixture,
  conflictProblem,
  inactiveCategoryFixture,
  managementQuestionFixture,
  questionPageFixture,
} from "../fixtures/questionBankFixtures";

export const questionBankHandlers = [
  http.get("**/api/question-bank/categories", () => HttpResponse.json([categoryFixture, inactiveCategoryFixture])),
  http.post("**/api/question-bank/categories", async ({ request }) => {
    const body = (await request.json()) as { name?: string; description?: string; color?: string };
    if (body.name === "Conflict") {
      return HttpResponse.json(conflictProblem, { status: 409 });
    }
    return HttpResponse.json({ ...categoryFixture, name: body.name, description: body.description, color: body.color }, { status: 201 });
  }),
  http.put("**/api/question-bank/categories/:categoryId", async ({ request }) => {
    const body = (await request.json()) as { name?: string; description?: string; color?: string };
    return HttpResponse.json({ ...categoryFixture, name: body.name, description: body.description, color: body.color });
  }),
  http.delete("**/api/question-bank/categories/:categoryId", () => new HttpResponse(null, { status: 200 })),
  http.get("**/api/question-bank/management/questions", () => HttpResponse.json(questionPageFixture)),
  http.post("**/api/question-bank/questions", () => HttpResponse.json(managementQuestionFixture, { status: 201 })),
  http.get("**/api/question-bank/questions/:questionId", () => HttpResponse.json(managementQuestionFixture)),
  http.put("**/api/question-bank/questions/:questionId", () => HttpResponse.json(managementQuestionFixture)),
  http.delete("**/api/question-bank/questions/:questionId", () => new HttpResponse(null, { status: 200 })),
];
