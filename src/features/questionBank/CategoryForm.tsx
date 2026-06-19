import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { hasFormErrors, validateCategoryForm, type Category, type CategoryFormValue } from "../../domain/questionBank/questionBankTypes";

type CategoryFormProps = {
  category?: Category | null;
  isPending?: boolean;
  onSubmit: (value: CategoryFormValue) => Promise<void> | void;
  onCancel?: () => void;
};

export function CategoryForm({ category, isPending = false, onSubmit, onCancel }: CategoryFormProps) {
  const [value, setValue] = useState<CategoryFormValue>({ name: "", description: "" });
  const [errors, setErrors] = useState<ReturnType<typeof validateCategoryForm>>({});

  useEffect(() => {
    setValue({ name: category?.name ?? "", description: category?.description ?? "" });
    setErrors({});
  }, [category]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateCategoryForm(value);
    setErrors(nextErrors);
    if (hasFormErrors(nextErrors)) {
      return;
    }

    await onSubmit(value);
  }

  return (
    <form className="question-bank-form" onSubmit={submit}>
      <FormField id="category-name" label="Name" error={errors.name}>
        <Input
          id="category-name"
          value={value.name}
          maxLength={40}
          aria-describedby={errors.name ? "category-name-error" : undefined}
          onChange={(event) => setValue((current) => ({ ...current, name: event.target.value }))}
        />
      </FormField>
      <FormField id="category-description" label="Description" error={errors.description}>
        <Textarea
          id="category-description"
          value={value.description}
          maxLength={300}
          rows={3}
          aria-describedby={errors.description ? "category-description-error" : undefined}
          onChange={(event) => setValue((current) => ({ ...current, description: event.target.value }))}
        />
      </FormField>
      <div className="question-bank-actions">
        <Button type="submit" isLoading={isPending}>
          {category ? "Save category" : "Create category"}
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
