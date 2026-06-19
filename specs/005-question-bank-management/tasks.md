# Tasks: Question Bank Management

**Input**: Design documents from `/specs/005-question-bank-management/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/question-bank.openapi.yaml, quickstart.md

**Tests**: Required by feature specification for role routing, protected routes, category management, question management, validation, errors, loading, accessibility, and focused e2e flows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish shared directories, fixtures, and UI primitives needed by the management feature.

- [X] T001 Create question bank source directories `src/domain/questionBank/`, `src/features/questionBank/`, and `src/components/ui/`
- [X] T002 [P] Add question bank test fixture skeletons in `src/tests/fixtures/questionBankFixtures.ts`
- [X] T003 [P] Add MSW question bank handler skeleton in `src/tests/handlers/questionBankHandlers.ts`
- [X] T004 Register question bank MSW handlers in `src/tests/setup.ts`
- [X] T005 [P] Create shared Button component with loading/disabled/focus states in `src/components/ui/Button.tsx`
- [X] T006 [P] Create shared Input/Textarea/Select/Checkbox form controls in `src/components/ui/Input.tsx`, `src/components/ui/Textarea.tsx`, `src/components/ui/Select.tsx`, and `src/components/ui/Checkbox.tsx`
- [X] T007 [P] Create shared Card, FormField, and FormError components in `src/components/ui/Card.tsx`, `src/components/ui/FormField.tsx`, and `src/components/ui/FormError.tsx`
- [X] T008 [P] Create shared LoadingSpinner and Toast components in `src/components/ui/LoadingSpinner.tsx` and `src/components/ui/Toast.tsx`
- [X] T009 [P] Create shared Modal, Badge, Table, and Pagination primitives in `src/components/ui/Modal.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/Table.tsx`, and `src/components/ui/Pagination.tsx`
- [X] T010 Extend global loading operation type with question bank operations in `src/domain/auth.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared domain, API, store, route, and style foundations required before user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T011 [P] Add role extraction tests for player/moderator/admin/multiple-role JWT claims in `src/domain/auth.test.ts`
- [X] T012 Implement `UserRole`, role parsing, and highest-role selection helpers in `src/domain/auth.ts`
- [X] T013 [P] Add question bank mapper tests for category/public question/management question/paged response/malformed payloads in `src/domain/questionBank/questionBankMappers.test.ts`
- [X] T014 Define question bank domain types and form/filter types in `src/domain/questionBank/questionBankTypes.ts`
- [X] T015 Implement question bank DTO mappers and validation guards in `src/domain/questionBank/questionBankMappers.ts`
- [X] T016 [P] Add question bank API wrapper tests for `VITE_API_BASE_URL` resolution, no hardcoded backend host URLs, auth headers, `credentials: "omit"`, query params, payloads, 403/409/network errors in `src/api/questionBankApi.test.ts`
- [X] T017 Implement question bank API wrappers with centralized base URL resolution, Authorization header handling, default `credentials: "omit"`, JSON handling, and error normalization in `src/api/questionBankApi.ts`
- [X] T018 Generate or refresh question-bank REST DTO types from backend OpenAPI when available; otherwise verify `contracts/question-bank.openapi.yaml` against backend OpenAPI/DTOs and document why generation is unavailable plus any intentional frontend-only planning assumptions in `specs/005-question-bank-management/quickstart.md`
- [X] T019 [P] Add question bank store tests for filters, pagination, selected records, pending operations, conflict state, and reset in `src/stores/questionBankStore.test.ts`
- [X] T020 Implement question bank Zustand store in `src/stores/questionBankStore.ts`
- [X] T021 [P] Add `RoleProtectedRoute` tests for unauthenticated/player/moderator/admin access in `src/routes/RoleProtectedRoute.test.tsx`
- [X] T022 Implement `RoleProtectedRoute` in `src/routes/RoleProtectedRoute.tsx`
- [X] T023 [P] Add shared UI primitive tests for Button, Input, Textarea, Select, Checkbox, Card, FormField, FormError, LoadingSpinner, Toast, Modal, Badge, Table, and Pagination in `src/components/ui/uiPrimitives.test.tsx`
- [X] T024 Style management shell and shared UI primitives in `src/index.css`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Reach The Right Post-Login Area (Priority: P1) MVP

**Goal**: Players land in lobby, moderators/admins land in question bank, and players cannot access management routes.

**Independent Test**: Sign in with Player, Moderator, and Admin roles; confirm redirects and direct management route denial.

### Tests for User Story 1

- [X] T025 [P] [US1] Add login redirect tests for player/moderator/admin roles in `src/features/auth/useLogin.test.tsx`
- [X] T026 [P] [US1] Add App route tests for management route denial and allowed role rendering in `src/App.test.tsx`
- [X] T027 [P] [US1] Add question bank layout access smoke test in `src/features/questionBank/QuestionBankLayout.test.tsx`

### Implementation for User Story 1

- [X] T028 [US1] Update login success navigation to route Player to `/lobby` and Moderator/Admin to `/admin/question-bank` in `src/features/auth/useLogin.ts`
- [X] T029 [US1] Add protected question bank routes for `/admin/question-bank`, `/admin/question-bank/categories`, `/admin/question-bank/questions`, `/admin/question-bank/questions/new`, and `/admin/question-bank/questions/:questionId/edit` in `src/App.tsx`
- [X] T030 [P] [US1] Implement management shell navigation and role badges in `src/features/questionBank/QuestionBankLayout.tsx`
- [X] T031 [P] [US1] Implement dashboard landing view in `src/features/questionBank/QuestionBankDashboard.tsx`
- [X] T032 [US1] Ensure permission-denied state uses blocking centralized error behavior in `src/routes/RoleProtectedRoute.tsx`
- [X] T033 [US1] Add keyboard-visible navigation and current-page indicators for management shell in `src/features/questionBank/QuestionBankLayout.tsx`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Admin Manages Categories (Priority: P1)

**Goal**: Admins can list, create, update, and deactivate categories; moderators can read but not manage categories.

**Independent Test**: Use Admin to create/update/deactivate a category and Moderator to verify category write controls are unavailable.

### Tests for User Story 2

- [X] T034 [P] [US2] Add category API contract tests for list/create/update/delete and duplicate/conflict errors in `src/api/questionBankApi.test.ts`
- [X] T035 [P] [US2] Add category action hook tests for load/create/update/delete, pending flags, errors, and conflict handling in `src/features/questionBank/useQuestionBankActions.test.tsx`
- [X] T036 [P] [US2] Add category form validation tests for required name/description and max lengths in `src/features/questionBank/CategoryForm.test.tsx`
- [X] T037 [P] [US2] Add category list page tests for admin controls, moderator read-only state, soft-delete confirmation, and inactive badges in `src/features/questionBank/CategoryListPage.test.tsx`

### Implementation for User Story 2

- [X] T038 [US2] Implement category list/create/update/delete actions in `src/features/questionBank/useQuestionBankActions.ts`
- [X] T039 [P] [US2] Implement category form with field errors and pending submit button in `src/features/questionBank/CategoryForm.tsx`
- [X] T040 [US2] Implement category list page with admin-only create/edit/deactivate controls in `src/features/questionBank/CategoryListPage.tsx`
- [X] T041 [US2] Implement category soft-delete confirmation using shared Modal in `src/features/questionBank/CategoryListPage.tsx`
- [X] T042 [US2] Map duplicate category and stale-save errors to user-facing messages in `src/api/questionBankApi.ts`
- [X] T043 [US2] Hide inactive/deleted categories from default selectable category collections in `src/stores/questionBankStore.ts`

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Moderator Or Admin Manages Questions And Answers (Priority: P1)

**Goal**: Moderators/admins can create, edit, validate, replace answers, and deactivate questions.

**Independent Test**: Create a question with exactly four answers and one correct answer, update the full answer set, and soft-delete the question.

### Tests for User Story 3

- [X] T044 [P] [US3] Add answer editor tests for exactly four rows, radio-style correct answer, labels, keyboard behavior, and validation messaging in `src/features/questionBank/AnswerEditor.test.tsx`
- [X] T045 [P] [US3] Add question form tests for required category/text, answer count, one correct answer, inactive category blocking, and unsaved-change warning in `src/features/questionBank/QuestionForm.test.tsx`
- [X] T046 [P] [US3] Add question form page tests for create/edit loading, save, update answer replacement, delete confirmation, and conflict reload state in `src/features/questionBank/QuestionFormPage.test.tsx`
- [X] T047 [P] [US3] Add question API contract tests for create/update/delete payloads and management response mapping in `src/api/questionBankApi.test.ts`

### Implementation for User Story 3

- [X] T048 [P] [US3] Implement fixed four-row answer editor in `src/features/questionBank/AnswerEditor.tsx`
- [X] T049 [US3] Implement question form validation and dirty-state tracking in `src/features/questionBank/QuestionForm.tsx`
- [X] T050 [US3] Implement question create/edit page with category loading and question loading in `src/features/questionBank/QuestionFormPage.tsx`
- [X] T051 [US3] Implement create/update/delete question actions and reload-after-conflict workflow in `src/features/questionBank/useQuestionBankActions.ts`
- [X] T052 [US3] Integrate question form routes with navigation after save/delete in `src/App.tsx` and `src/features/questionBank/QuestionFormPage.tsx`
- [X] T053 [US3] Ensure management question form never reuses gameplay question display components in `src/features/questionBank/QuestionForm.tsx`
- [X] T054 [US3] Add field-level error associations and focus recovery after validation failure in `src/features/questionBank/QuestionForm.tsx`

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: User Story 4 - Find And Review Questions Efficiently (Priority: P2)

**Goal**: Moderators/admins can browse, filter, search, paginate, inspect, and act on questions efficiently.

**Independent Test**: Load a populated question list, change page/page size, filter by category/status/search text, and open edit/deactivate from row actions.

### Tests for User Story 4

- [X] T055 [P] [US4] Add question filter tests for category/status/search/order/page reset behavior in `src/features/questionBank/QuestionFilters.test.tsx`
- [X] T056 [P] [US4] Add question table tests for displayed columns, row actions, non-color-only badges, and empty state in `src/features/questionBank/QuestionTable.test.tsx`
- [X] T057 [P] [US4] Add question list page tests for pagination, page size, filter query params, loading, and API error toasts in `src/features/questionBank/QuestionListPage.test.tsx`
- [X] T058 [P] [US4] Add Playwright staff browsing smoke test in `src/tests/e2e/question-bank-management.spec.ts`

### Implementation for User Story 4

- [X] T059 [P] [US4] Implement question filters with category/status/search/order controls in `src/features/questionBank/QuestionFilters.tsx`
- [X] T060 [P] [US4] Implement question table with accessible headers, status/correct indicators, and row actions in `src/features/questionBank/QuestionTable.tsx`
- [X] T061 [US4] Implement question list page with pagination, filters, loading, empty state, and error handling in `src/features/questionBank/QuestionListPage.tsx`
- [X] T062 [US4] Persist list filters and pagination in `src/stores/questionBankStore.ts`
- [X] T063 [US4] Wire edit and soft-delete row actions to routes/actions in `src/features/questionBank/QuestionListPage.tsx`

**Checkpoint**: User Story 4 is independently functional and testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verify quality gates and finish cross-story details.

- [X] T064 [P] Add question bank MSW fixture coverage for player/moderator/admin role tokens and conflict responses in `src/tests/fixtures/questionBankFixtures.ts`
- [X] T065 [P] Add accessibility regression tests for modal focus, form errors, table headers, and non-color-only status in `src/features/questionBank/questionBankAccessibility.test.tsx`
- [X] T066 Run `npm test` and fix any failing unit/integration tests
- [X] T067 Run `npm run build` and fix any TypeScript/build issues
- [X] T068 Run `npm audit --audit-level=low` and document zero new vulnerability/dependency risk in `specs/005-question-bank-management/quickstart.md`
- [X] T069 Run focused `npm run test:e2e -- question-bank-management` where environment supports it and document result in `specs/005-question-bank-management/quickstart.md`
- [X] T070 Review `package-lock.json` to confirm no new denied package scope or malware-advised dependency was introduced
- [X] T071 Validate manual quickstart scenarios and update `specs/005-question-bank-management/quickstart.md` with any environment-specific notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all stories.
- **US1 Role routing**: Depends on Phase 2 and is the MVP path.
- **US2 Category management**: Depends on Phase 2 and benefits from US1 route shell.
- **US3 Question management**: Depends on Phase 2 and category loading from US2 foundations; can start after category API/actions exist.
- **US4 Question browsing**: Depends on Phase 2 and question API/domain foundations; can proceed in parallel with late US3 UI once shared actions exist.
- **Phase 7 Polish**: Depends on implemented target stories.

### User Story Dependencies

- **US1**: Independent after Foundation.
- **US2**: Independent category workflow after Foundation; route shell from US1 improves demo but is not required for domain/API tests.
- **US3**: Requires category read support and question API/domain foundations.
- **US4**: Requires management question list API/domain foundations and integrates with US3 edit/delete routes.

### Within Each User Story

- Write tests before implementation tasks for the protected behavior.
- Domain/API/store tasks before hooks and pages.
- Hooks before presentational pages that consume them.
- Modal/focus behavior before final accessibility verification.
- Validate each story at its checkpoint before proceeding.

---

## Parallel Opportunities

- T002, T003, T005-T009 can run in parallel after T001.
- T013, T016, T019, T021, T023 can run in parallel in Phase 2.
- US2 tests T034-T037 can run in parallel once Foundation exists.
- US3 tests T044-T047 can run in parallel once Foundation exists.
- US4 tests T055-T058 can run in parallel once Foundation exists.
- UI primitives, domain mappers, API wrappers, and store tasks are mostly separate files and can be staffed independently.

## Parallel Example: User Story 3

```bash
Task: "T044 [P] [US3] Add answer editor tests in src/features/questionBank/AnswerEditor.test.tsx"
Task: "T045 [P] [US3] Add question form tests in src/features/questionBank/QuestionForm.test.tsx"
Task: "T046 [P] [US3] Add question form page tests in src/features/questionBank/QuestionFormPage.test.tsx"
Task: "T047 [P] [US3] Add question API contract tests in src/api/questionBankApi.test.ts"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundation.
3. Complete US1 role routing and protected management shell.
4. Validate Player/Moderator/Admin redirect and route access independently.

### Incremental Delivery

1. Add US1 for secure management entry.
2. Add US2 so Admin can manage categories and Moderator can read categories.
3. Add US3 so Moderator/Admin can create, update, and deactivate questions.
4. Add US4 so staff can browse and maintain larger question sets efficiently.
5. Finish Phase 7 quality gates.

### Notes

- Every task follows `- [ ] T### [P?] [US?] Description with file path`.
- Tests are intentionally included because the feature specification requires them.
- Avoid adding new runtime packages; use project-owned validation and accessible shared primitives.
