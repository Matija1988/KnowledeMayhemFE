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
  const [value, setValue] = useState<CategoryFormValue>({ name: "", description: "", color: "#3B82F6" });
  const [errors, setErrors] = useState<ReturnType<typeof validateCategoryForm>>({});

  useEffect(() => {
    setValue({ name: category?.name ?? "", description: category?.description ?? "", color: category?.color ?? "#3B82F6" });
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
      <FormField id="category-color" label="Color" error={errors.color}>
        <div className="category-color-field">
          <Input
            id="category-color"
            type="color"
            value={value.color}
            aria-describedby={errors.color ? "category-color-error" : "category-color-value"}
            onChange={(event) => setValue((current) => ({ ...current, color: event.target.value.toUpperCase() }))}
          />
          <output id="category-color-value" htmlFor="category-color">{value.color.toUpperCase()}</output>
        </div>
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
