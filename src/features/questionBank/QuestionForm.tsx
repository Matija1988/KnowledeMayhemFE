import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import type { Category, Question, QuestionFormValue } from "../../domain/questionBank/questionBankTypes";
import {
  createEmptyQuestionForm,
  hasFormErrors,
  toQuestionFormValue,
  validateQuestionForm,
} from "../../domain/questionBank/questionBankTypes";
import { selectActiveCategories } from "../../stores/questionBankStore";
import { AnswerEditor } from "./AnswerEditor";

type QuestionFormProps = {
  question?: Question | null;
  categories: Category[];
  isPending?: boolean;
  onSubmit: (value: QuestionFormValue) => Promise<void> | void;
  onCancel?: () => void;
};

export function QuestionForm({ question, categories, isPending = false, onSubmit, onCancel }: QuestionFormProps) {
  const [value, setValue] = useState<QuestionFormValue>(createEmptyQuestionForm);
  const [errors, setErrors] = useState<ReturnType<typeof validateQuestionForm>>({});
  const activeCategories = selectActiveCategories(categories);

  useEffect(() => {
    setValue(question ? toQuestionFormValue(question) : createEmptyQuestionForm());
    setErrors({});
  }, [question]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateQuestionForm(value, activeCategories);
    setErrors(nextErrors);
    if (hasFormErrors(nextErrors)) {
      const firstInvalid = document.querySelector<HTMLElement>("[aria-invalid='true'], .ui-field-error");
      firstInvalid?.focus?.();
      return;
    }

    await onSubmit(value);
  }

  return (
    <form className="question-bank-form" onSubmit={submit}>
      <FormField id="question-category" label="Category" error={errors.categoryId}>
        <Select
          id="question-category"
          value={value.categoryId}
          aria-invalid={Boolean(errors.categoryId)}
          aria-describedby={errors.categoryId ? "question-category-error" : undefined}
          onChange={(event) => setValue((current) => ({ ...current, categoryId: event.target.value }))}
        >
          <option value="">Choose category</option>
          {activeCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="question-text" label="Question text" error={errors.text}>
        <Textarea
          id="question-text"
          value={value.text}
          rows={4}
          maxLength={1000}
          aria-invalid={Boolean(errors.text)}
          aria-describedby={errors.text ? "question-text-error" : undefined}
          onChange={(event) => setValue((current) => ({ ...current, text: event.target.value }))}
        />
      </FormField>
      <AnswerEditor
        answers={value.answers}
        errors={errors}
        onChange={(answers) => setValue((current) => ({ ...current, answers }))}
      />
      <div className="question-bank-actions">
        <Button type="submit" isLoading={isPending}>
          {question ? "Save question" : "Create question"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
