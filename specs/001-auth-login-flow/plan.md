# Implementation Plan: Authentication Foundation - Login Flow

**Branch**: `001-auth-login-flow` | **Date**: 2026-06-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-auth-login-flow/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build the first authenticated frontend slice: a login experience that validates credentials,
shows global loading and centralized errors, persists successful sign-in state across normal
refreshes, redirects authenticated users to the lobby entry point, clears invalid saved
sessions, and protects authenticated routes. Because the repository is currently an early
Vite shell, this feature also establishes the React + TypeScript application foundation and
the initial auth-oriented source layout.

## Technical Context

**Language/Version**: TypeScript 5.x with React 19.x target; exact patch versions determined during dependency installation

**Primary Dependencies**: React, Vite, Zustand, React Router, Tailwind CSS, CSS Modules, Vitest, React Testing Library, Playwright, MSW. Denied package scopes and malware-advised packages MUST NOT be installed.

**Storage**: Browser-local auth persistence for the access token and minimal authenticated session state; no refresh-token storage in this feature

**Testing**: Vitest, React Testing Library, Playwright, MSW, plus package-lock review, package manager audit, and active malware advisory checks before accepting newly installed packages

**Target Platform**: Browser frontend

**Project Type**: Single-page frontend application

**Performance Goals**: Login interaction responds immediately to typing and submit actions; loading/error feedback appears within 500 ms of state changes under normal client conditions; route guards must not visibly flash protected content for logged-out or invalid-session users

**Constraints**: Authentication state must remain distinct from gameplay, quiz, and multiplayer state; common auth errors are non-blocking; invalid saved sessions are cleared before protected content is shown; login must be keyboard-accessible and assistive-technology-friendly; no vulnerable, compromised, malware-advised, or constitution-denied packages may be introduced

**Scale/Scope**: One login flow, one protected-route boundary, one post-login lobby destination placeholder/route target, shared auth/loading/error state primitives for later auth slices

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Server-authoritative gameplay**: Pass. Feature does not alter gameplay, quiz, turn, piece, or multiplayer state. Auth state is explicitly separate from gameplay/session state.
- **Typed contracts and domain boundaries**: Pass. Login request/response and error outcomes are modeled in `src/api/`, mapped into `src/domain/auth.ts`, and consumed through feature hooks/state rather than directly by presentational UI.
- **Accessible multiplayer interaction**: Pass. Although this is not board gameplay, login is an interactive entry surface. Plan requires labels, keyboard completion, focus states, and assistive-technology-friendly loading/error updates.
- **Testable realtime behavior**: Pass. No SignalR or realtime gameplay behavior is touched. Required tests cover auth submission, loading cleanup, errors, persistence, invalid saved session handling, and route guards.
- **Secure, performant frontend delivery**: Pass. Plan requires package-lock review, package manager audit, and active malware advisory checks before accepting dependency changes; denied scopes and malware-advised packages are prohibited. Protected content must not flash during guard evaluation.
- **Approved stack alignment**: Pass with scoped additions. React, TypeScript, Vite, Zustand, Tailwind CSS, CSS Modules, Vitest, React Testing Library, Playwright, and MSW align with the constitution. React Router is added as a necessary routing dependency for authenticated-route readiness. SignalR and dnd-kit are not used in this feature because realtime gameplay and drag-and-drop are out of scope.

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-login-flow/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- auth-login.openapi.yaml
`-- checklists/
    `-- requirements.md
```

### Source Code (repository root)

```text
src/
|-- api/
|   `-- identityApi.ts
|-- domain/
|   `-- auth.ts
|-- stores/
|   |-- authStore.ts
|   |-- errorStore.ts
|   `-- loadingStore.ts
|-- features/
|   `-- auth/
|       |-- LoginPage.tsx
|       |-- LoginForm.tsx
|       `-- useLogin.ts
|-- components/
|   |-- ErrorModal.tsx
|   |-- LoadingSpinner.tsx
|   `-- ToastProvider.tsx
|-- hooks/
|   `-- useAuthSession.ts
|-- routes/
|   `-- ProtectedRoute.tsx
|-- tests/
|   |-- e2e/
|   |-- handlers/
|   |-- fixtures/
|   `-- setup.ts
|-- App.tsx
`-- main.tsx
```

**Structure Decision**: Use the constitution's root-level `src/` layout and add `routes/`
for route-boundary components. Authentication uses Zustand stores for auth/loading/error UI
state. REST request lifecycle for this feature uses project-owned API wrappers and feature
hooks so denied package scopes are not introduced.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Research Summary

See [research.md](research.md). All planning unknowns are resolved:

- React Router is selected for route guarding.
- Zustand is selected for minimal auth/loading/error UI state.
- Project-owned API wrappers and feature hooks are selected for auth request lifecycle to
  avoid denied package scopes.
- Browser-local persistence is accepted for the first access-token implementation, with invalid-session clearing required.
- MSW-backed tests cover login outcomes without relying on a live backend.

## Phase 1: Design Summary

See [data-model.md](data-model.md), [contracts/auth-login.openapi.yaml](contracts/auth-login.openapi.yaml), and [quickstart.md](quickstart.md).

Post-design Constitution Check remains passing:

- Auth state and gameplay state remain separate.
- DTOs are mapped into domain session/error models before UI consumption.
- Accessibility requirements are represented in user flows and quickstart validation.
- Tests are planned for the risk-bearing behavior introduced by this feature.
- The only new runtime architecture addition outside the constitution list is React Router, justified by authenticated-route readiness.
