import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { mapManagementQuestion } from "../../domain/questionBank/questionBankMappers";
import { managementQuestionFixture } from "../../tests/fixtures/questionBankFixtures";
import { QuestionTable } from "./QuestionTable";

describe("QuestionTable", () => {
  it("renders accessible columns, status, correct indicator, and row actions", () => {
    render(
      <MemoryRouter>
        <QuestionTable questions={[mapManagementQuestion(managementQuestionFixture)]} onDelete={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("columnheader", { name: "Question" })).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("A programming language")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toBeInTheDocument();
  });
});
