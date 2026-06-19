# Quickstart: Question Bank Management

## Prerequisites

- Backend is running with the Question Bank module enabled.
- Frontend `.env` points `VITE_API_BASE_URL` to the backend origin.
- Test users or JWT fixtures are available for Player, Moderator, and Admin roles.
- Seeded categories/questions are available, or an admin can create them during validation.

## Commands

```powershell
npm test
npm run build
npm audit --audit-level=low
```

Optional e2e validation when the app and backend are running:

```powershell
npm run test:e2e
```

## Manual Validation Scenarios

### Role-Based Login Redirect

1. Sign in as a Player.
2. Confirm the first screen is `/lobby`.
3. Sign out and sign in as a Moderator.
4. Confirm the first screen is `/admin/question-bank`.
5. Sign out and sign in as an Admin.
6. Confirm the first screen is `/admin/question-bank`.

Expected result: players never see management content; moderators/admins enter the management shell.

### Protected Management Routes

1. Sign in as Player.
2. Navigate directly to `/admin/question-bank/questions`.
3. Confirm the management page is blocked with a permission message.
4. Sign in as Moderator and repeat.
5. Confirm question management is available but category create/update/delete actions are not.
6. Sign in as Admin and repeat.
7. Confirm category and question management are available.

Expected result: route and action access match role rules, and backend 403 responses show centralized errors.

### Admin Category Management

1. Sign in as Admin.
2. Open category management.
3. Create a category with a unique name and description.
4. Edit the category name or description.
5. Deactivate the category after confirming the dialog.

Expected result: the category list updates from authoritative responses, inactive state is visible without color alone, and deactivated categories are not selectable for new questions by default.

### Question Creation And Validation

1. Sign in as Moderator or Admin.
2. Open the new question form.
3. Confirm exactly four answer rows are shown.
4. Try saving with no category, no text, empty answer text, no correct answer, and more than one correct answer.
5. Fill a valid active category, question text, four answer texts, and one correct answer.
6. Save the question.

Expected result: invalid states are blocked with associated field errors; valid save creates the question and returns to a useful management state.

### Question List Browsing

1. Open the question list with enough seeded or created questions for multiple pages.
2. Change page and page size.
3. Apply a category filter; the request should send the category name in the `category` query parameter.
4. Apply active-status filter.
5. Search by text.
6. Open edit from a row action.

Expected result: filters and pagination produce matching results, empty states are understandable, and table headers/actions are keyboard accessible.

### Question Update And Soft Delete

1. Open an existing question as Moderator or Admin.
2. Change text and replace answer text/correct answer.
3. Save.
4. Reopen and verify the full answer set was replaced.
5. Deactivate the question after confirmation.

Expected result: updates persist from backend responses, exactly four answers remain, and deactivated questions are hidden from default active lists.

### Stale Save Conflict

1. Open the same category or question in two staff sessions.
2. Save changes in session A.
3. Attempt to save older data in session B.

Expected result: when the backend reports a stale or conflicting save, the save is blocked, a conflict message appears, and session B must reload before retrying.

### Accessibility Pass

1. Complete category and question form flows with keyboard only.
2. Confirm focus is visible and logical.
3. Confirm dialogs trap focus and return focus after close.
4. Confirm validation errors are announced or associated with fields.
5. Confirm active/inactive/correct states use text/icons in addition to color.

Expected result: the primary management flows are operable and understandable without a mouse or color-only cues.

## Contract References

- Backend API contract: [contracts/question-bank.openapi.yaml](contracts/question-bank.openapi.yaml)
- Domain model: [data-model.md](data-model.md)

## Expected Automated Coverage

- Role derivation and post-login redirect tests.
- `RoleProtectedRoute` tests for Player, Moderator, Admin, unauthenticated, and invalid session states.
- Question bank mapper tests for category, public question, management question, paged response, and malformed payloads.
- API wrapper tests for `VITE_API_BASE_URL` resolution, omitted browser credentials, auth headers, query parameters, payloads, error normalization, and conflict handling.
- Store/hook tests for filters, pagination, pending flags, field errors, duplicate-submit prevention, reload after conflict, and delete confirmation state.
- Component tests for category form, question form, answer editor, filters, table, pagination, badges, and modals.
- Focused Playwright flow for admin category management and moderator question creation.

## Implementation Notes

- REST DTO generation from backend OpenAPI was not available inside this frontend workspace; `contracts/question-bank.openapi.yaml` was used as the reconciled planning contract and mapped through `src/domain/questionBank/questionBankMappers.ts`.
- `npm test` completed successfully: 60 test files, 176 tests.
- `npm run build` completed successfully outside the sandbox after the sandboxed Vite build hit `spawn EPERM`; Rolldown emitted non-blocking `/*#__PURE__*/` annotation warnings from `@microsoft/signalr`.
- `npm audit --audit-level=low` completed with 0 vulnerabilities.
- Focused Playwright coverage in `src/tests/e2e/question-bank-management.spec.ts` completed successfully: 2 tests passed.
- `package-lock.json` was reviewed for newly added package entries; no new runtime or dev dependency was introduced by this feature.
