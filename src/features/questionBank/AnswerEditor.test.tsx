import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createEmptyQuestionForm } from "../../domain/questionBank/questionBankTypes";
import { AnswerEditor } from "./AnswerEditor";

describe("AnswerEditor", () => {
  it("shows exactly four rows and behaves like single-correct radio selection", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AnswerEditor answers={createEmptyQuestionForm().answers} onChange={onChange} />);

    expect(screen.getAllByRole("radio")).toHaveLength(4);
    await user.click(screen.getAllByRole("radio")[2]);
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ isCorrect: true })]));
  });
});
