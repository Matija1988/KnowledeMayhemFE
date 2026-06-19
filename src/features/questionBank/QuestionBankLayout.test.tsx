import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { adminToken } from "../../tests/fixtures/questionBankFixtures";
import { QuestionBankLayout } from "./QuestionBankLayout";

describe("QuestionBankLayout", () => {
  it("renders management navigation with the current role", () => {
    useAuthStore.getState().login(adminToken);
    render(
      <MemoryRouter initialEntries={["/admin/question-bank"]}>
        <Routes>
          <Route path="/admin/question-bank" element={<QuestionBankLayout />}>
            <Route index element={<p>Dashboard</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Question bank" })).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Questions" })).toBeInTheDocument();
  });
});
