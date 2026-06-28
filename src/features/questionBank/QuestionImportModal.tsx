import { useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { Modal } from "../../components/ui/Modal";
import { parseQuestionImportJson, type Category, type QuestionImportItem } from "../../domain/questionBank/questionBankTypes";

type QuestionImportModalProps = {
  categories: Category[];
  isPending: boolean;
  onImport: (categoryId: string, questions: QuestionImportItem[]) => Promise<boolean>;
  onClose: () => void;
};

export function QuestionImportModal({ categories, isPending, onImport, onClose }: QuestionImportModalProps) {
  const activeCategories = useMemo(() => categories.filter((category) => category.isActive && !category.deletedAtUtc), [categories]);
  const [categoryId, setCategoryId] = useState(activeCategories[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryId) {
      setError("Choose an active category.");
      return;
    }
    if (!file) {
      setError("Choose a JSON file.");
      return;
    }

    try {
      const questions = parseQuestionImportJson(await file.text());
      setError(null);
      await onImport(categoryId, questions);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The selected file could not be read.");
    }
  }

  return (
    <Modal title="Import questions from JSON" onClose={onClose}>
      <form onSubmit={submit}>
        <FormField id="question-import-category" label="Category">
          <select
            id="question-import-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            disabled={isPending}
          >
            <option value="">Select category</option>
            {activeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="question-import-file" label="JSON file" error={error ?? undefined}>
          <input
            id="question-import-file"
            type="file"
            accept=".json,application/json"
            disabled={isPending}
            aria-describedby={error ? "question-import-file-error" : "question-import-help"}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setError(null);
            }}
          />
        </FormField>
        <p id="question-import-help">Maximum 500 questions. Every question needs four answers and exactly one correct answer.</p>
        <details className="question-import-format">
          <summary>Expected JSON format</summary>
          <pre>{`{
  "questions": [
    {
      "text": "What does CLR stand for?",
      "answers": [
        { "text": "Common Language Runtime", "isCorrect": true },
        { "text": "Code Library Registry", "isCorrect": false },
        { "text": "Common Logic Reader", "isCorrect": false },
        { "text": "Compiled Language Runner", "isCorrect": false }
      ]
    }
  ]
}`}</pre>
        </details>
        <div className="question-bank-actions">
          <Button type="submit" isLoading={isPending} disabled={!activeCategories.length}>
            Import questions
          </Button>
          <Button type="button" variant="secondary" disabled={isPending} onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
