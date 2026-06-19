import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { adminToken } from "../../tests/fixtures/questionBankFixtures";
import { QuestionFormPage } from "./QuestionFormPage";

describe("QuestionFormPage", () => {
  it("loads category options for create flow", async () => {
    useAuthStore.getState().login(adminToken);
    render(
      <MemoryRouter initialEntries={["/admin/question-bank/questions/new"]}>
        <Routes>
          <Route path="/admin/question-bank/questions/new" element={<QuestionFormPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "New question" })).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "C#" })).toBeInTheDocument();
  });
});
