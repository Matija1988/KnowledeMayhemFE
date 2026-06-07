# Tasks: Authentication Foundation - Login Flow

**Input**: Design documents from `/specs/001-auth-login-flow/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-login.openapi.yaml, quickstart.md

**Tests**: Required by constitution and feature scope for authentication behavior, route guards, accessibility, and dependency-risk coverage. Write tests before implementation for each protected behavior.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently after shared foundation work is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on another incomplete task)
- **[Story]**: User story label for story phases only
- Every task includes at least one exact file path

## Path Conventions

- Frontend app: `src/`
- API wrappers: `src/api/`
- Domain models and mappers: `src/domain/`
- Client state stores: `src/stores/`
- Auth feature: `src/features/auth/`
- Shared UI components: `src/components/`
- Feature/domain hooks: `src/hooks/`
- Routes: `src/routes/`
- Test helpers and fixtures: `src/tests/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the React + TypeScript Vite app shell, source layout, scripts, and dependency safety baseline.

- [X] T001 Create source directories `src/api/`, `src/domain/`, `src/stores/`, `src/features/auth/`, `src/components/`, `src/hooks/`, `src/routes/`, `src/tests/handlers/`, `src/tests/fixtures/`, and `src/tests/e2e/`
- [X] T002 Verify planned dependencies against the constitution supply-chain denylist before editing `package.json` or `package-lock.json`, recording advisory sources and dates in `docs/dependency-security.md`
- [X] T003 Update `package.json` and `package-lock.json` only with dependencies accepted by the preflight review in `docs/dependency-security.md`
- [X] T004 [P] Create Vite React TypeScript entry files `src/main.tsx`, `src/App.tsx`, and `src/vite-env.d.ts`
- [X] T005 [P] Configure TypeScript in `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json`
- [X] T006 [P] Configure Vite and Vitest in `vite.config.ts` and `src/tests/setup.ts`
- [X] T007 [P] Configure Tailwind CSS and global styles in `tailwind.config.ts`, `postcss.config.js`, and `src/index.css`
- [X] T008 [P] Configure Playwright in `playwright.config.ts` and create placeholder e2e folder `src/tests/e2e/.gitkeep`
- [X] T009 Run `npm audit` after install and record package-lock review, advisory check results, and fallback decisions in `docs/dependency-security.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared contracts, domain types, stores, request helpers, and UI primitives required before any user story can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T010 [P] Create login API request and response types from `contracts/auth-login.openapi.yaml` in `src/api/identityApi.ts`
- [X] T011 [P] Create auth domain models and DTO mappers for LoginCredentials, LoginResult, AuthenticatedSession, AuthError, LoadingState, and ProtectedDestination in `src/domain/auth.ts`
- [X] T012 [P] Create project-owned API request helper with error normalization and retry guardrails in `src/api/httpClient.ts`
- [X] T013 Create identity login wrapper using the project-owned request helper in `src/api/identityApi.ts`
- [X] T014 [P] Create auth session store with persistence, login, logout, and invalid-session clearing in `src/stores/authStore.ts`
- [X] T015 [P] Create global loading store with login operation tracking in `src/stores/loadingStore.ts`
- [X] T016 [P] Create centralized error store supporting toast and modal display modes in `src/stores/errorStore.ts`
- [X] T017 [P] Create reusable loading spinner component in `src/components/LoadingSpinner.tsx`
- [X] T018 [P] Create reusable toast provider component in `src/components/ToastProvider.tsx`
- [X] T019 [P] Create reusable blocking error modal component in `src/components/ErrorModal.tsx`
- [X] T020 [P] Create MSW login handlers for success, validation failure, invalid credentials, throttling, and service failure in `src/tests/handlers/identityHandlers.ts`
- [X] T021 [P] Create auth test fixtures for valid credentials, invalid credentials, login response, and rejected problem payloads in `src/tests/fixtures/authFixtures.ts`
- [X] T022 Wire MSW and test setup into `src/tests/setup.ts`

**Checkpoint**: Foundation ready. User story work can now begin.

---

## Phase 3: User Story 1 - Sign In Successfully (Priority: P1) MVP

**Goal**: A returning player can enter valid credentials, see progress, establish authenticated state, preserve it across refresh, and reach the lobby entry point.

**Independent Test**: Start logged out, submit valid credentials, confirm loading appears and clears, confirm authenticated state persists across refresh, and confirm lobby redirect.

### Tests for User Story 1

- [X] T023 [P] [US1] Add domain mapper tests for successful LoginCredentials, LoginResult, and AuthenticatedSession handling in `src/domain/auth.test.ts`
- [X] T024 [P] [US1] Add auth store tests for login, persistence, unavailable browser persistence fallback, logout availability, and invalid saved session clearing in `src/stores/authStore.test.ts`
- [X] T025 [P] [US1] Add login hook success test covering loading cleanup and authenticated state update in `src/features/auth/useLogin.test.ts`
- [X] T026 [P] [US1] Add LoginForm success and required-field validation tests in `src/features/auth/LoginForm.test.tsx`
- [X] T027 [P] [US1] Add Playwright successful login and refresh persistence scenario with a 10-second login-to-lobby threshold assertion in `src/tests/e2e/auth-login-success.spec.ts`

### Implementation for User Story 1

- [X] T028 [US1] Implement `useAuthSession` hook for restored session, unavailable browser persistence fallback, sign-in state, sign-out, and invalid-session clearing in `src/hooks/useAuthSession.ts`
- [X] T029 [US1] Implement login submission hook with validation, loading store usage, identity API call, auth store update, and lobby redirect in `src/features/auth/useLogin.ts`
- [X] T030 [US1] Implement accessible login form with username/email, password, submit button, field validation, duplicate-submit prevention, and live loading state in `src/features/auth/LoginForm.tsx`
- [X] T031 [US1] Implement login page composition with shared loading, toast provider, modal provider, and lobby redirect handling in `src/features/auth/LoginPage.tsx`
- [X] T032 [US1] Implement app routes for login and lobby entry point in `src/App.tsx`
- [X] T033 [US1] Connect app shell providers and global UI components in `src/main.tsx`

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - Recover From Login Failure (Priority: P2)

**Goal**: A player who submits invalid credentials or hits an auth service failure sees a clear non-technical error and can retry without the page getting stuck.

**Independent Test**: Submit invalid credentials and service-failure responses, confirm loading clears, non-blocking errors appear, blocking error mode is available for severe failures, and the form remains editable.

### Tests for User Story 2

- [X] T034 [P] [US2] Add API error normalization tests for 400, 401, 429, 500, and network failure cases in `src/api/identityApi.test.ts`
- [X] T035 [P] [US2] Add error store tests for toast and modal display modes in `src/stores/errorStore.test.ts`
- [X] T036 [P] [US2] Add login hook failure tests covering centralized errors and loading cleanup in `src/features/auth/useLogin.test.ts`
- [X] T037 [P] [US2] Add LoginForm failure tests confirming non-technical error display and editable retry state in `src/features/auth/LoginForm.test.tsx`

### Implementation for User Story 2

- [X] T038 [US2] Complete error normalization and user-facing login failure messages in `src/api/identityApi.ts`
- [X] T039 [US2] Route login failures through centralized toast/modal handling in `src/features/auth/useLogin.ts`
- [X] T040 [US2] Render non-blocking login errors and severe blocking errors through shared components in `src/components/ToastProvider.tsx` and `src/components/ErrorModal.tsx`
- [X] T041 [US2] Ensure login loading clears on every failure path and keeps form inputs editable in `src/features/auth/LoginForm.tsx`

**Checkpoint**: US1 and US2 both work independently.

---

## Phase 5: User Story 3 - Prepare Authenticated Routing (Priority: P3)

**Goal**: Logged-out visitors are routed to login, signed-in users can access authenticated areas, invalid saved sessions are cleared before protected content appears, and signed-in users opening login are sent to the lobby entry point.

**Independent Test**: Attempt direct protected-route access while logged out, repeat while signed in, simulate invalid saved state, and open login while signed in.

### Tests for User Story 3

- [X] T042 [P] [US3] Add ProtectedRoute tests for logged-out redirect, signed-in access, invalid saved session clearing, and no protected-content flash in `src/routes/ProtectedRoute.test.tsx`
- [X] T043 [P] [US3] Add LoginPage signed-in redirect test in `src/features/auth/LoginPage.test.tsx`
- [X] T044 [P] [US3] Add Playwright route-boundary scenarios for logged-out protected access, signed-in login access, and invalid saved session in `src/tests/e2e/auth-route-boundaries.spec.ts`

### Implementation for User Story 3

- [X] T045 [US3] Implement protected route boundary with logged-out redirect and invalid saved session clearing in `src/routes/ProtectedRoute.tsx`
- [X] T046 [US3] Add authenticated route and login redirect behavior to app routing in `src/App.tsx`
- [X] T047 [US3] Add non-blocking "Please sign in again" prompt for invalid saved sessions in `src/stores/errorStore.ts` and `src/routes/ProtectedRoute.tsx`
- [X] T048 [US3] Ensure route guard evaluation prevents protected content flash in `src/routes/ProtectedRoute.tsx`

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate security, accessibility, performance, documentation, and quickstart coverage across the full auth slice.

- [X] T049 [P] Add accessibility assertions for labels, focus, keyboard flow, and loading/error announcements in `src/features/auth/LoginForm.test.tsx`
- [X] T050 [P] Add package denylist regression check documentation with required advisory source URL, source date, package-lock review result, and fallback decision fields in `docs/dependency-security.md`
- [X] T051 Run package safety validation and record `npm audit` output, package-lock review, advisory source URLs, source dates, and accepted/denied dependency decisions for `package.json` and `package-lock.json` in `docs/dependency-security.md`
- [X] T052 Run unit and integration tests with `npm run test` and address failures in `src/`
- [X] T053 Run end-to-end tests with `npm run test:e2e` and address failures in `src/tests/e2e/`
- [X] T054 Run production build with `npm run build` and address failures in `src/`
- [X] T055 Validate quickstart scenarios from `specs/001-auth-login-flow/quickstart.md`, including the SC-001 10-second login-to-lobby threshold
- [X] T056 Update `README.md` with auth-login setup, run, test, and security-audit commands

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 completion.
- **Phase 3 US1**: Depends on Phase 2 completion.
- **Phase 4 US2**: Depends on Phase 2 completion and reuses US1 login flow surfaces.
- **Phase 5 US3**: Depends on Phase 2 completion and integrates with US1 authenticated state.
- **Phase 6 Polish**: Depends on the selected user stories being complete.

### User Story Dependencies

- **US1 Sign In Successfully**: MVP. Can be delivered first after foundation.
- **US2 Recover From Login Failure**: Can be developed after foundation, but final integration depends on US1 login form and hook surfaces.
- **US3 Prepare Authenticated Routing**: Can be developed after foundation, but final route behavior depends on US1 auth session state.

### Within Each User Story

- Tests must be written first and fail for the intended missing behavior.
- Domain/store/API behavior before feature hooks.
- Feature hooks before presentational components.
- Components before app route wiring.
- Route guard behavior before e2e route-boundary validation.

## Parallel Opportunities

- T004-T008 can run in parallel after T001.
- T010-T012 and T014-T021 can run in parallel after setup.
- US1 tests T023-T027 can run in parallel.
- US2 tests T034-T037 can run in parallel.
- US3 tests T042-T044 can run in parallel.
- Polish documentation T050 can run in parallel with final validation tasks once implementation behavior is stable.

## Parallel Example: User Story 1

```powershell
# Launch independent US1 tests/tasks in parallel:
Task: "T023 [P] [US1] Add domain mapper tests in src/domain/auth.test.ts"
Task: "T024 [P] [US1] Add auth store tests in src/stores/authStore.test.ts"
Task: "T026 [P] [US1] Add LoginForm tests in src/features/auth/LoginForm.test.tsx"
Task: "T027 [P] [US1] Add Playwright success scenario in src/tests/e2e/auth-login-success.spec.ts"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete Phase 3 US1.
4. Run US1 unit/integration/e2e checks.
5. Stop and validate successful login, refresh persistence, and lobby redirect.

### Incremental Delivery

1. Deliver US1 for successful sign-in.
2. Add US2 for failure recovery and centralized errors.
3. Add US3 for authenticated route readiness and invalid-session behavior.
4. Finish Phase 6 cross-cutting validation.

### Security Gate

Before installing or updating packages, validate that `package.json` and `package-lock.json`
do not introduce vulnerable, compromised, malware-advised, or constitution-denied packages.
If a dependency is denied, replace it with project-owned code or a separately approved safe
alternative before continuing.

## Notes

- [P] tasks use different files and have no dependency on another incomplete task.
- Every user story has tests and can be validated independently.
- No task uses a denied third-party server-state package; API lifecycle stays in project-owned wrappers and hooks.
- Keep auth state separate from gameplay, quiz, and multiplayer session state throughout implementation.
