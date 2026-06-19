import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { mapCategory } from "../../domain/questionBank/questionBankMappers";
import { categoryFixture } from "../../tests/fixtures/questionBankFixtures";
import { QuestionForm } from "./QuestionForm";

describe("QuestionForm", () => {
  it("requires category, question text, four answers, and one correct answer", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<QuestionForm categories={[mapCategory(categoryFixture)]} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /create question/i }));
    expect(await screen.findByText("Choose a category.")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Category"), String(categoryFixture.id));
    await user.type(screen.getByLabelText("Question text"), "What is C#?");
    for (const input of screen.getAllByLabelText(/Answer \d/)) {
      await user.type(input, "Answer");
    }
    await user.click(screen.getByRole("button", { name: /create question/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
