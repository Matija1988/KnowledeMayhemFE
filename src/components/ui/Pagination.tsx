import { Button } from "./Button";

type PaginationProps = {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (pageNumber: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
};

export function Pagination({
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const canGoPrevious = pageNumber > 1;
  const canGoNext = pageNumber < pageCount;

  return (
    <nav className="ui-pagination" aria-label="Pagination">
      <Button type="button" variant="secondary" disabled={!canGoPrevious} onClick={() => onPageChange(pageNumber - 1)}>
        Previous
      </Button>
      <span aria-live="polite">
        Page {pageNumber} of {pageCount}
      </span>
      <Button type="button" variant="secondary" disabled={!canGoNext} onClick={() => onPageChange(pageNumber + 1)}>
        Next
      </Button>
      <label>
        Page size
        <select
          className="ui-input"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </nav>
  );
}
