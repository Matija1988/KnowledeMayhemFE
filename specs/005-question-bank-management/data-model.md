# Data Model: Question Bank Management

## UserRole

Represents the effective role used for post-login routing and management authorization.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `role` | `"Player" \| "Moderator" \| "Admin"` | Yes | Highest recognized role wins when multiple are present. |

### Validation Rules

- Unknown or missing roles are treated as `Player`.
- `Admin` grants category and question management.
- `Moderator` grants question management and category read access.
- `Player` grants no management route access.

## Category

Represents a question grouping used for browsing and authoring questions.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable category identifier. |
| `name` | string | Yes | Required, max 40 characters, unique among usable categories. |
| `description` | string | Yes | Required by current backend contract, max 300 characters. |
| `createdAtUtc` | string | Yes | Displayed in management history where useful. |
| `updatedAtUtc` | string or null | No | Optional because current category contract may omit it; used for stale-edit awareness when available. |
| `isActive` | boolean | Yes | Inactive categories cannot be selected for new/changed questions. |
| `deletedAtUtc` | string or null | No | Optional because current category contract may omit it; null when present and not soft-deleted. |

### State Transitions

```text
Active -> Updated
Active -> SoftDeleted
SoftDeleted -> Restored (out of scope unless backend supports it)
```

### Validation Rules

- Name is trimmed before validation and submission.
- Description is trimmed before validation and submission.
- Duplicate-name conflicts show a field or toast error without committing local state.
- Soft-deleted categories are hidden from default selectable options.

## Answer

Represents one answer option inside a managed question.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string or null | No | Existing answers have IDs; new form rows may not. |
| `questionId` | string or null | No | Present for persisted answers where available. |
| `text` | string | Yes | Required, max 1000 characters. |
| `isCorrect` | boolean | Yes | Exactly one answer in the set must be true. |
| `createdAtUtc` | string or null | No | Optional because current management answer contract omits it. |
| `updatedAtUtc` | string or null | No | Optional because current management answer contract omits it. |
| `isActive` | boolean | Yes | Defaults true for active question answers. |
| `deletedAtUtc` | string or null | No | Optional; answer restore/delete is not managed independently. |

### Validation Rules

- A question form always contains exactly four answers.
- Every answer text is required.
- Exactly one answer is marked correct.
- Correct answer selection is single-choice behavior.

## Question

Represents a managed question and its answer set.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable question identifier. |
| `categoryId` | string | Yes | Must reference an active category for create/update. |
| `categoryName` | string | Yes | Displayed in list and form context. |
| `text` | string | Yes | Required, max 1000 characters. |
| `createdAtUtc` | string | Yes | Displayed in list. |
| `updatedAtUtc` | string or null | No | Optional because current question management contract may omit it; displayed in list and used for stale-edit awareness when available. |
| `isActive` | boolean | Yes | False after soft delete or inactive state. |
| `deletedAtUtc` | string or null | No | Optional because current question management contract may omit it. |
| `answers` | Answer[] | Yes | Exactly four answers for management forms. |

### State Transitions

```text
Active -> Updated
Active -> SoftDeleted
SoftDeleted -> Restored (out of scope unless backend supports it)
```

### Validation Rules

- Category is required.
- Question text is trimmed before validation and submission.
- Updates replace the full answer set.
- Backend-reported stale-save conflicts block submit and require reload before retry.

## QuestionFormValue

Represents editable values before submission.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `categoryId` | string | Yes | Empty value is invalid. |
| `text` | string | Yes | Empty after trimming is invalid. |
| `answers` | `{ text: string; isCorrect: boolean }[]` | Yes | Exactly four entries. |
| `isActive` | boolean | No | Present only if backend supports explicit active updates; soft delete remains confirmation-based. |
| `version` | string or null | No | Reserved for future backend concurrency metadata; current stale-save handling depends on backend 409/conflict responses. |

## QuestionFilter

Represents question-list browsing criteria.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `pageNumber` | number | Yes | Defaults to 1. |
| `pageSize` | number | Yes | Constrained to backend-supported page sizes. |
| `category` | string or null | No | Category ID or backend category filter value. |
| `isActive` | boolean or null | No | Null means all allowed by selected filter mode. |
| `text` | string or null | No | Optional search text. |
| `orderBy` | string | Yes | Defaults to created-date ordering. |

## PaginatedResult

Represents a page of question-list results.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `items` | Question[] | Yes | Current page items. |
| `pageNumber` | number | Yes | Current page. |
| `pageSize` | number | Yes | Current page size. |
| `totalCount` | number | Yes | Total matching questions. |

## Relationships

- A category has many questions.
- A question belongs to one category.
- A question has exactly four answers in management forms.
- User role controls which actions are visible and permitted, but backend authorization remains final.
