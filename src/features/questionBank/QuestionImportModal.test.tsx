import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { mapCategory } from "../../domain/questionBank/questionBankMappers";
import { categoryFixture } from "../../tests/fixtures/questionBankFixtures";
import { QuestionImportModal } from "./QuestionImportModal";

describe("QuestionImportModal", () => {
  it("reads a JSON file and imports its questions into the selected category", async () => {
    const user = userEvent.setup();
    const onImport = vi.fn().mockResolvedValue(true);
    const contents = JSON.stringify({
      questions: [
        {
          text: "Imported question",
          answers: [
            { text: "A", isCorrect: true },
            { text: "B", isCorrect: false },
            { text: "C", isCorrect: false },
            { text: "D", isCorrect: false },
          ],
        },
      ],
    });
    const file = new File([contents], "questions.json", { type: "application/json" });
    Object.defineProperty(file, "text", { value: async () => contents });

    render(
      <QuestionImportModal
        categories={[mapCategory(categoryFixture)]}
        isPending={false}
        onImport={onImport}
        onClose={vi.fn()}
      />,
    );

    await user.upload(screen.getByLabelText("JSON file"), file);
    await user.click(screen.getByRole("button", { name: "Import questions" }));

    expect(onImport).toHaveBeenCalledWith(
      categoryFixture.id,
      expect.arrayContaining([expect.objectContaining({ text: "Imported question" })]),
    );
  });
});
