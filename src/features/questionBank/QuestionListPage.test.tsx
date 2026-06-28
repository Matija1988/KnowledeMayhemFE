import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { adminToken } from "../../tests/fixtures/questionBankFixtures";
import { QuestionListPage } from "./QuestionListPage";

describe("QuestionListPage", () => {
  it("loads questions, filters, pagination, and row actions", async () => {
    useAuthStore.getState().login(adminToken);
    render(
      <MemoryRouter>
        <QuestionListPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("What is C#?")).toBeInTheDocument();
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import JSON" })).toBeInTheDocument();
  });
});
