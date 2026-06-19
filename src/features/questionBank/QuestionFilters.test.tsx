import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { mapCategory } from "../../domain/questionBank/questionBankMappers";
import { defaultQuestionFilter } from "../../domain/questionBank/questionBankTypes";
import { categoryFixture } from "../../tests/fixtures/questionBankFixtures";
import { QuestionFilters } from "./QuestionFilters";

describe("QuestionFilters", () => {
  it("emits filter changes and reset actions", async () => {
    const onChange = vi.fn();
    const onReset = vi.fn();
    const user = userEvent.setup();
    const category = mapCategory(categoryFixture);
    render(
      <QuestionFilters
        categories={[category]}
        filters={defaultQuestionFilter}
        onChange={onChange}
        onReset={onReset}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Category"), category.name);
    expect(onChange).toHaveBeenCalledWith({ category: category.name });
    await user.type(screen.getByLabelText("Search"), "C#");
    expect(onChange).toHaveBeenCalledWith({ text: "C" });
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalled();
  });
});
