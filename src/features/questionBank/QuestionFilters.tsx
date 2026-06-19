import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import type { Category, QuestionFilter } from "../../domain/questionBank/questionBankTypes";
import { selectActiveCategories } from "../../stores/questionBankStore";

type QuestionFiltersProps = {
  categories: Category[];
  filters: QuestionFilter;
  onChange: (filters: Partial<QuestionFilter>) => void;
  onReset: () => void;
};

export function QuestionFilters({ categories, filters, onChange, onReset }: QuestionFiltersProps) {
  return (
    <form className="question-filters" onSubmit={(event) => event.preventDefault()}>
      <label>
        Category
        <Select value={filters.category ?? ""} onChange={(event) => onChange({ category: event.target.value || null })}>
          <option value="">All categories</option>
          {selectActiveCategories(categories).map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </Select>
      </label>
      <label>
        Status
        <Select
          value={filters.isActive === null ? "all" : String(filters.isActive)}
          onChange={(event) =>
            onChange({ isActive: event.target.value === "all" ? null : event.target.value === "true" })
          }
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
          <option value="all">All</option>
        </Select>
      </label>
      <label>
        Search
        <Input
          value={filters.text ?? ""}
          placeholder="Question text"
          onChange={(event) => onChange({ text: event.target.value || null })}
        />
      </label>
      <label>
        Order
        <Select value={filters.orderBy} onChange={(event) => onChange({ orderBy: event.target.value })}>
          <option value="createdAt">Created date</option>
          <option value="updatedAt">Updated date</option>
          <option value="text">Question text</option>
        </Select>
      </label>
      <Button type="button" variant="secondary" onClick={onReset}>
        Reset
      </Button>
    </form>
  );
}
