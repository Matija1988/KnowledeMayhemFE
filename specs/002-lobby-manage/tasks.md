# Tasks: Lobby View, Start, and Manage

**Input**: Design documents from `/specs/002-lobby-manage/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED because this feature touches authenticated session/lobby flows, SignalR, reconnect, synchronization, accessibility, and dependency-risk behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend app**: `src/` at repository root
- **REST wrappers**: `src/api/`
- **SignalR services and event contracts**: `src/realtime/`
- **Domain models and mappers**: `src/domain/`
- **Zustand stores**: `src/stores/`
- **Feature code**: `src/features/lobby/`
- **Shared components**: `src/components/`
- **Test helpers and fixtures**: `src/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install approved dependencies and prepare shared files for lobby implementation.

- [X] T001 Install `@microsoft/signalr` and update `package.json` and `package-lock.json`
- [X] T002 Run package-lock review for denied or malware-advised package scopes and record outcome in `specs/002-lobby-manage/quickstart.md`
- [X] T003 Run `npm audit --audit-level=low` and record the accepted result or remediation note in `specs/002-lobby-manage/quickstart.md`
- [X] T004 [P] Create lobby feature directory structure in `src/features/lobby/`
- [X] T005 [P] Create lobby domain directory structure in `src/domain/lobby/`
- [X] T006 [P] Create realtime directory structure in `src/realtime/`
- [X] T007 [P] Create shared UI directory structure in `src/components/ui/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models, API helpers, state, routing, UI primitives, and fixtures required by every lobby story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T008 [P] Add current-user id extraction helpers and tests in `src/domain/auth.ts` and `src/domain/auth.test.ts`
- [X] T009 [P] Define lobby domain types in `src/domain/lobby/lobbyTypes.ts`
- [X] T010 [P] Add lobby mapper tests for valid, invalid, and edge-case DTOs in `src/domain/lobby/lobbyMappers.test.ts`
- [X] T011 Implement lobby DTO-to-domain mappers in `src/domain/lobby/lobbyMappers.ts`
- [X] T012 [P] Add authenticated request helper tests for bearer auth, Accept header, JSON header, base URL, and `credentials: "omit"` in `src/api/httpClient.test.ts`
- [X] T013 Extend authenticated JSON request helpers in `src/api/httpClient.ts`
- [X] T014 [P] Define lobby API DTOs and error normalization contract tests in `src/api/lobbyApi.test.ts`
- [X] T015 Implement typed lobby API wrappers and lobby error normalization in `src/api/lobbyApi.ts`
- [X] T016 [P] Create lobby store transition tests for current lobby, pending operations, selectors, connection state, and reset behavior in `src/stores/lobbyStore.test.ts`
- [X] T017 Implement lobby Zustand store with selectors in `src/stores/lobbyStore.ts`
- [X] T018 [P] Add MSW lobby fixtures in `src/tests/fixtures/lobbyFixtures.ts`
- [X] T019 Add MSW lobby REST handlers for create, join, read, leave, cancel, start, active conflict, and errors in `src/tests/handlers/lobbyHandlers.ts`
- [X] T020 Register lobby MSW handlers in `src/tests/setup.ts`
- [X] T021 [P] Add shared Button tests for loading, disabled, focus, and accessible labels in `src/components/ui/Button.test.tsx`
- [X] T022 [P] Add shared form and feedback component tests in `src/components/ui/FormControls.test.tsx`
- [X] T023 Implement shared Button, Input, Card, FormField, FormError, Badge, Toast, and Modal components in `src/components/ui/`
- [X] T024 Integrate shared dark blue and white UI tokens, focus states, and layout utilities in `src/index.css`
- [X] T025 [P] Add protected lobby route tests in `src/routes/ProtectedRoute.test.tsx`
- [X] T026 Wire `/lobby`, `/lobby/:lobbyId`, and `/game/:sessionId` placeholder routes in `src/App.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Create Lobby as Authenticated User (Priority: P1) MVP

**Goal**: Authenticated users can create a lobby, enter the lobby room, see lobby details, and copy the invite code.

**Independent Test**: Sign in, create a lobby with an allowed max player count, land in `/lobby/:lobbyId`, and verify code, host identity, player count, status, expiration, and copy-code feedback.

### Tests for User Story 1

- [X] T027 [P] [US1] Add create lobby API success and active-lobby conflict tests in `src/api/lobbyApi.test.ts`
- [X] T028 [P] [US1] Add create lobby store and selector tests in `src/stores/lobbyStore.test.ts`
- [X] T029 [P] [US1] Add create lobby hook tests for loading, errors, duplicate submit prevention, and navigation in `src/features/lobby/useLobbyActions.test.tsx`
- [X] T030 [P] [US1] Add lobby landing create form tests in `src/features/lobby/CreateLobbyCard.test.tsx`
- [X] T031 [P] [US1] Add lobby room detail and copy-code tests in `src/features/lobby/LobbyRoomPage.test.tsx`
- [X] T032 [P] [US1] Add Playwright create lobby happy path in `src/tests/e2e/lobby-create.spec.ts`

### Implementation for User Story 1

- [X] T033 [US1] Implement create lobby action, active-lobby recovery, and loading/error integration in `src/features/lobby/useLobbyActions.ts`
- [X] T034 [US1] Implement lobby landing page shell in `src/features/lobby/LobbyLandingPage.tsx`
- [X] T035 [US1] Implement create lobby card with max players selector defaulting to 4 in `src/features/lobby/CreateLobbyCard.tsx`
- [X] T036 [US1] Implement lobby room page data load and protected-state handling in `src/features/lobby/LobbyRoomPage.tsx`
- [X] T037 [US1] Implement lobby code display and copy feedback in `src/features/lobby/LobbyCodePanel.tsx`
- [X] T038 [US1] Implement lobby player list with host and current-player indicators in `src/features/lobby/LobbyPlayerList.tsx`
- [X] T039 [US1] Connect create success and active-lobby conflict navigation in `src/App.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Join Lobby by Code (Priority: P2)

**Goal**: Authenticated users can join a lobby by normalized invite code and non-host users see read-only lobby status with leave available.

**Independent Test**: Sign in as a non-host, enter a mixed-case code with whitespace, verify normalization, join the lobby room, and confirm start/cancel are unavailable.

### Tests for User Story 2

- [X] T040 [P] [US2] Add join lobby API tests for uppercase normalization, empty-code blocking, not found, full, expired, and active-lobby conflict in `src/api/lobbyApi.test.ts`
- [X] T041 [P] [US2] Add join lobby hook tests for validation, loading cleanup, active-lobby recovery, and navigation in `src/features/lobby/useLobbyActions.test.tsx`
- [X] T042 [P] [US2] Add join form validation and normalization tests in `src/features/lobby/JoinLobbyCard.test.tsx`
- [X] T043 [P] [US2] Add non-host lobby room action visibility tests in `src/features/lobby/LobbyActions.test.tsx`
- [X] T044 [P] [US2] Add Playwright join lobby and empty-code validation flow in `src/tests/e2e/lobby-join.spec.ts`

### Implementation for User Story 2

- [X] T045 [US2] Implement join lobby action, code normalization, empty-code validation, and active-lobby recovery in `src/features/lobby/useLobbyActions.ts`
- [X] T046 [US2] Implement join lobby card with accessible label and field-level validation in `src/features/lobby/JoinLobbyCard.tsx`
- [X] T047 [US2] Implement non-host lobby action rendering and leave availability in `src/features/lobby/LobbyActions.tsx`
- [X] T048 [US2] Add join, not-found, full, expired, and already-active error mapping in `src/api/lobbyApi.ts`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Manage Lobby as Host (Priority: P3)

**Goal**: Hosts can leave, cancel, and start lobbies only when backend-authoritative rules allow, with automatic game navigation after start.

**Independent Test**: Sign in as host, verify start disabled with fewer than two players, enabled with two to four players in an open unexpired lobby, start into `/game/:sessionId`, and cancel returns to `/lobby` with feedback.

### Tests for User Story 3

- [X] T049 [P] [US3] Add start, cancel, leave, and expired-state API tests in `src/api/lobbyApi.test.ts`
- [X] T050 [P] [US3] Add store selector tests for host, canStart, disabled reasons, expiration, leave clearing, cancel feedback, and start handoff in `src/stores/lobbyStore.test.ts`
- [X] T051 [P] [US3] Add host action hook tests for leave, cancel, start, loading cleanup, and automatic game navigation in `src/features/lobby/useLobbyActions.test.tsx`
- [X] T052 [P] [US3] Add host action rendering tests in `src/features/lobby/LobbyActions.test.tsx`
- [X] T053 [P] [US3] Add Playwright host start, cancel, and leave flows in `src/tests/e2e/lobby-host-actions.spec.ts`

### Implementation for User Story 3

- [X] T054 [US3] Implement leave lobby action with state clearing and closed-lobby feedback in `src/features/lobby/useLobbyActions.ts`
- [X] T055 [US3] Implement cancel lobby action with `/lobby` navigation and cancellation feedback in `src/features/lobby/useLobbyActions.ts`
- [X] T056 [US3] Implement start lobby action with session handoff preservation and `/game/:sessionId` navigation in `src/features/lobby/useLobbyActions.ts`
- [X] T057 [US3] Implement host-only start, cancel, leave, disabled reasons, and pending states in `src/features/lobby/LobbyActions.tsx`
- [X] T058 [US3] Display expiration time, expired messaging, status badges, and player count indicators in `src/features/lobby/LobbyRoomPage.tsx`
- [X] T059 [US3] Add start/cancel/leave error mapping for host-required, min-player, expired, closed, cancelled, and network/CORS fallback cases in `src/api/lobbyApi.ts`

**Checkpoint**: User Stories 1, 2, and 3 are independently functional.

---

## Phase 6: User Story 4 - Stay Updated Through Lobby Events (Priority: P4)

**Goal**: Lobby participants receive authoritative player, host, status, cancellation, close, and start updates without manual refresh.

**Independent Test**: Simulate player joined, player left, host changed, lobby cancelled, lobby closed, and lobby started events; verify visible updates, live-region announcements, reconnect behavior, and game navigation.

### Tests for User Story 4

- [X] T060 [P] [US4] Add typed SignalR event contract tests in `src/realtime/lobbyEvents.test.ts`
- [X] T061 [P] [US4] Add lobby hub service tests for URL derivation, access token factory, event registration, reconnect, and disconnect in `src/realtime/lobbyHub.test.ts`
- [X] T062 [P] [US4] Add lobby store event reducer tests for player joined, player left, host changed, started, closed, cancelled, duplicate, and out-of-order events in `src/stores/lobbyStore.test.ts`
- [X] T063 [P] [US4] Add lobby room live-region and connection status tests in `src/features/lobby/LobbyRoomPage.test.tsx`
- [X] T064 [P] [US4] Add Playwright or integration test for SignalR player join/leave and start navigation in `src/tests/e2e/lobby-realtime.spec.ts`

### Implementation for User Story 4

- [X] T065 [US4] Define SignalR event DTOs, event names, and payload guards in `src/realtime/lobbyEvents.ts`
- [X] T066 [US4] Implement centralized lobby hub connection lifecycle and event registration in `src/realtime/lobbyHub.ts`
- [X] T067 [US4] Implement lobby store event handlers for snapshots, player join/leave, host change, start, close, cancel, reconnect, and stale-event protection in `src/stores/lobbyStore.ts`
- [X] T068 [US4] Connect lobby room lifecycle to lobby hub start, stop, and reconnect snapshot behavior in `src/features/lobby/LobbyRoomPage.tsx`
- [X] T069 [US4] Add ARIA live region announcements for player, host, connection, status, cancellation, close, and start changes in `src/features/lobby/LobbyRoomPage.tsx`
- [X] T070 [US4] Add unable-to-connect lobby updates error handling in `src/api/lobbyApi.ts` and `src/features/lobby/useLobbyActions.ts`

**Checkpoint**: All user stories are independently functional and realtime behavior is covered.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility, performance, and security review across all lobby stories.

- [X] T071 [P] Add or update shared toast/modal integration tests for lobby blocking and non-blocking errors in `src/components/ToastProvider.tsx` and `src/components/ErrorModal.tsx`
- [X] T072 [P] Verify keyboard-only lobby flows, focus movement, modal Escape behavior, and non-color-only indicators in `src/features/lobby/`
- [X] T073 [P] Review selector subscriptions, normalized lobby state, and controlled SignalR dispatch for unnecessary rerenders in `src/stores/lobbyStore.ts` and `src/realtime/lobbyHub.ts`
- [X] T074 [P] Run `npm test` and fix failures in `src/`
- [X] T075 [P] Run `npm run test:e2e` and fix failures in `src/tests/e2e/`
- [X] T076 [P] Run `npm run build` and fix TypeScript or Vite build failures in `src/`
- [X] T077 [P] Add create/join visible navigation timing validation for the 5-second success criteria in `src/tests/e2e/lobby-performance.spec.ts`
- [X] T078 [P] Add loading/error feedback latency assertions for the 500 ms plan goal in `src/features/lobby/useLobbyActions.test.tsx`
- [X] T079 Re-run package-lock review, `npm audit --audit-level=low`, and malware advisory checks for `package-lock.json`
- [X] T080 Validate all quickstart scenarios and update `specs/002-lobby-manage/quickstart.md` with any environment-specific notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and integrates with the lobby room created in US1.
- **User Story 3 (Phase 5)**: Depends on Foundational and uses lobby room/action surfaces from US1/US2.
- **User Story 4 (Phase 6)**: Depends on Foundational and benefits from existing lobby room/store/action behavior from US1-US3.
- **Polish (Phase 7)**: Depends on all desired user stories.

### User Story Dependencies

- **US1 Create Lobby**: MVP; no dependency on other user stories after Foundational.
- **US2 Join Lobby**: Can be implemented after Foundational, but full manual validation is easier once US1 can create invite codes.
- **US3 Manage Lobby as Host**: Can be implemented after Foundational, but uses the room and action surfaces created for US1/US2.
- **US4 Realtime Updates**: Can be built against store/service contracts after Foundational, then integrated into the room once US1-US3 surfaces exist.

### Within Each User Story

- Write tests first and confirm they fail for the intended missing behavior.
- Domain/API/store changes before hooks.
- Hooks before presentational components.
- Components before route integration.
- Realtime service updates before components consume realtime events.
- Story complete before moving to the next priority checkpoint.

---

## Parallel Opportunities

- T004-T007 can run in parallel after T001.
- T008-T012, T014, T016, T018, T021, T022, and T025 touch different files and can run in parallel.
- Test tasks inside each user story marked [P] can run in parallel.
- UI component tasks for different lobby components can run in parallel once shared UI primitives are complete.
- US2, US3, and US4 can be split among developers after Foundational if integration order is coordinated.
- Polish tasks T071-T078 can run in parallel after the targeted stories are complete.

---

## Parallel Example: User Story 1

```bash
Task: "T027 Add create lobby API success and active-lobby conflict tests in src/api/lobbyApi.test.ts"
Task: "T028 Add create lobby store and selector tests in src/stores/lobbyStore.test.ts"
Task: "T030 Add lobby landing create form tests in src/features/lobby/CreateLobbyCard.test.tsx"
Task: "T031 Add lobby room detail and copy-code tests in src/features/lobby/LobbyRoomPage.test.tsx"
```

## Parallel Example: User Story 4

```bash
Task: "T060 Add typed SignalR event contract tests in src/realtime/lobbyEvents.test.ts"
Task: "T061 Add lobby hub service tests in src/realtime/lobbyHub.test.ts"
Task: "T062 Add lobby store event reducer tests in src/stores/lobbyStore.test.ts"
Task: "T063 Add lobby room live-region and connection status tests in src/features/lobby/LobbyRoomPage.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate create lobby, lobby room display, copy-code feedback, loading cleanup, and active-lobby conflict recovery.

### Incremental Delivery

1. Setup + Foundational -> core domain, API, store, shared UI, routes, and fixtures.
2. US1 -> create lobby MVP.
3. US2 -> join by code and non-host room behavior.
4. US3 -> host leave/cancel/start and automatic game handoff.
5. US4 -> SignalR updates, reconnect behavior, and live announcements.
6. Polish -> accessibility, performance, security, build, and quickstart validation.

### Quality Gates

- Tests for each story must fail before implementation and pass at that story checkpoint.
- `npm test`, `npm run test:e2e`, and `npm run build` must pass before implementation is considered complete.
- Create/join timing validation and loading-feedback latency assertions must cover SC-001, SC-002, and the 500 ms feedback goal before implementation is considered complete.
- Package-lock review, `npm audit --audit-level=low`, and current malware advisory checks must pass or have documented remediation before accepting dependency changes.
- No lobby UI component may consume raw backend DTOs or own SignalR connection lifecycle.
