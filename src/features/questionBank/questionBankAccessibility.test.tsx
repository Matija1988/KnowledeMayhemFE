import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Modal } from "../../components/ui/Modal";
import { mapManagementQuestion } from "../../domain/questionBank/questionBankMappers";
import { managementQuestionFixture } from "../../tests/fixtures/questionBankFixtures";
import { QuestionTable } from "./QuestionTable";

describe("question bank accessibility", () => {
  it("uses dialog semantics, table headers, and non-color-only state labels", () => {
    render(
      <>
        <Modal title="Confirm delete">Confirm body</Modal>
        <MemoryRouter>
          <QuestionTable questions={[mapManagementQuestion(managementQuestionFixture)]} onDelete={() => undefined} />
        </MemoryRouter>
      </>,
    );

    expect(screen.getByRole("dialog", { name: "Confirm delete" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("A programming language")).toBeInTheDocument();
  });
});
