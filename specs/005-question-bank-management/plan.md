# Implementation Plan: Question Bank Management

**Branch**: `005-question-bank-management` | **Date**: 2026-06-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-question-bank-management/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement the frontend question bank management area for moderators and admins. The plan adds role-aware post-login routing, protected management routes, category administration for admins, question and answer management for moderators/admins, paginated and filtered question lists, soft-delete confirmation flows, backend-reported stale-save conflict handling, centralized API/error/loading behavior, accessible dark blue/white management UI, and focused automated coverage. The implementation will extend the existing frontend architecture with question-bank API wrappers, DTO-to-domain mappers, a question-bank store/hook layer, management routes, reusable form/table/dialog controls, and MSW-backed tests.

## Technical Context

**Language/Version**: TypeScript 6.0.3 with React 19.2.7, matching the current Vite project

**Primary Dependencies**: Existing React, React Router, Vite, Zustand, Tailwind CSS, Vitest, React Testing Library, Playwright, and MSW. `@microsoft/signalr` remains in the app but is not needed for this management feature. No new runtime package is planned.

**Storage**: Existing auth token storage remains in localStorage through `authStore`. Question bank data is backend-authoritative and is loaded through REST wrappers. Client state stores filters, pagination, currently loaded form data, pending operations, conflict/blocking state, and transient validation errors only.

**Testing**: Vitest, React Testing Library, MSW, and Playwright where useful. Coverage must include role routing, protected routes, category CRUD authorization, question list filters/pagination, question form validation, answer single-correct behavior, soft delete confirmations, backend-reported stale-save conflict feedback, loading/pending state, centralized errors, and accessibility expectations.

**Target Platform**: Browser frontend

**Project Type**: Single-page frontend application

**Performance Goals**: Management list interactions show loading feedback within 500 ms; role redirects and protected-route decisions happen before restricted content renders; question list pagination/filter changes avoid unnecessary app-wide rerenders; forms remain responsive while editing four answers.

**Constraints**: Backend remains authoritative for question bank persistence, authorization, duplicate category names, soft deletion, stale/conflict detection, and validation. Frontend must map backend DTOs into domain models before UI use. Management screens must use the shared dark blue/white visual system, keyboard-accessible controls, labeled fields, meaningful table headers, focus-managed dialogs, non-color-only state indicators, and centralized API base URL/auth headers with `credentials: "omit"`.

**Scale/Scope**: One management area with category list/form, question list, question create/edit form, answer editor, filters, pagination, route protection, and role-aware login redirect. Question import/export, bulk edit, restore, difficulty, media attachments, audit log UI, public browsing, and separate moderator dashboard are out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Server-authoritative gameplay**: Pass. This feature does not change gameplay state. It explicitly preserves gameplay answer secrecy and keeps question-bank persistence backend-authoritative. The frontend only stores transient management UI state and reconciles durable data from REST responses.
- **Typed contracts and domain boundaries**: Pass with explicit sync task. Backend QuestionBank DTOs must be verified against the backend OpenAPI contract before implementation. If backend OpenAPI generation is available, the REST DTO types must be generated or refreshed from that source; otherwise the frontend planning contract in `contracts/question-bank.openapi.yaml` must be manually reconciled against backend DTOs and endpoints before wrappers are implemented. UI components consume mapped frontend domain models only, and public gameplay/read responses remain distinct from management responses so correct answers are not leaked into gameplay.
- **Accessible multiplayer interaction**: Pass. The management feature is not multiplayer gameplay, but it follows the same accessibility baseline: keyboard-operable forms/tables/dialogs, labeled inputs, associated validation errors, focus management, and non-color-only active/inactive/correct indicators.
- **Testable realtime behavior**: Pass. No SignalR or realtime behavior is added. Required coverage focuses on REST-backed role routing, protected routes, forms, filters, conflicts, error/loading behavior, and accessibility. Existing realtime behavior is untouched.
- **Secure, performant frontend delivery**: Pass. No new package is planned. The implementation will use existing wrappers/stores/components, keep DTOs out of UI, prevent duplicate submits, review lockfile/audit status, and use scoped store subscriptions for filters/forms.
- **Approved stack alignment**: Pass. Uses approved React, TypeScript, Vite, Zustand, Tailwind CSS, Vitest, React Testing Library, Playwright, and MSW. `dnd-kit` and SignalR are not used by this feature because no drag-and-drop or realtime management behavior is required.

## Project Structure

### Documentation (this feature)

```text
specs/005-question-bank-management/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- question-bank.openapi.yaml
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- api/
|   |-- apiConfig.ts
|   |-- httpClient.ts
|   `-- questionBankApi.ts
|-- domain/
|   |-- auth.ts
|   `-- questionBank/
|       |-- questionBankTypes.ts
|       `-- questionBankMappers.ts
|-- stores/
|   |-- authStore.ts
|   `-- questionBankStore.ts
|-- routes/
|   |-- ProtectedRoute.tsx
|   `-- RoleProtectedRoute.tsx
|-- features/
|   |-- auth/
|   `-- questionBank/
|       |-- QuestionBankLayout.tsx
|       |-- QuestionBankDashboard.tsx
|       |-- CategoryListPage.tsx
|       |-- CategoryForm.tsx
|       |-- QuestionListPage.tsx
|       |-- QuestionFilters.tsx
|       |-- QuestionTable.tsx
|       |-- QuestionFormPage.tsx
|       |-- QuestionForm.tsx
|       |-- AnswerEditor.tsx
|       `-- useQuestionBankActions.ts
|-- components/
|   |-- ErrorModal.tsx
|   |-- LoadingSpinner.tsx
|   |-- ToastProvider.tsx
|   `-- ui/
|       |-- Button.tsx
|       |-- Input.tsx
|       |-- Textarea.tsx
|       |-- Select.tsx
|       |-- Checkbox.tsx
|       |-- Card.tsx
|       |-- FormField.tsx
|       |-- FormError.tsx
|       |-- LoadingSpinner.tsx
|       |-- Toast.tsx
|       |-- Table.tsx
|       |-- Pagination.tsx
|       |-- Modal.tsx
|       `-- Badge.tsx
`-- tests/
    |-- fixtures/
    |-- handlers/
    `-- e2e/
```

**Structure Decision**: Extend existing feature-first architecture. API wrappers stay in `src/api`, DTO/domain mapping in `src/domain/questionBank`, transient management state in `src/stores/questionBankStore.ts`, route protection in `src/routes`, and UI/hook code under `src/features/questionBank`. Shared form/table/dialog primitives live under `src/components/ui` only where repetition appears across management screens.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Research Summary

See [research.md](research.md). All planning decisions are resolved:

- Use project-owned REST wrappers and explicit DTO mappers.
- Derive user roles from JWT claims and apply highest recognized role.
- Implement role-protected routes before rendering management content.
- Keep question bank state backend-authoritative with transient client filters/forms.
- Use fixed four-answer editor with radio-style correct answer selection.
- Treat backend-reported stale saves as conflicts that block overwrite and require reload.
- Reuse global loading/error patterns plus local pending flags.
- Add no new runtime dependency.

## Phase 1: Design Summary

See [data-model.md](data-model.md), [contracts/question-bank.openapi.yaml](contracts/question-bank.openapi.yaml), and [quickstart.md](quickstart.md).

Post-design Constitution Check remains passing:

- Backend authority is preserved for category/question persistence, soft delete, validation, authorization, and conflict detection.
- REST contracts are verified against backend OpenAPI/DTOs, documented, and mapped before UI consumption.
- Accessibility expectations are represented in form, table, pagination, dialog, badge, and validation behavior.
- Test coverage is planned for route/role behavior, API mapping, stores/hooks, forms, list interactions, conflicts, soft delete, loading/errors, and a focused e2e staff workflow.
- No new dependency is introduced; security checks remain implementation gates.
