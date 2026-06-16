# Tasks: Game Session & Board

**Input**: Design documents from `/specs/003-game-session-board/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED because this feature touches gameplay, board rendering, movement, SignalR, reconnect, synchronization, accessibility, and dependency-risk behavior.

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
- **Feature code**: `src/features/game/`
- **Shared components**: `src/components/`
- **Test helpers and fixtures**: `src/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare game feature folders, fixtures, and dependency-risk checks.

- [X] T001 [P] Create game feature directory structure in `src/features/game/`
- [X] T002 [P] Create game domain directory structure in `src/domain/game/`
- [X] T003 [P] Create game realtime files in `src/realtime/gameEvents.ts` and `src/realtime/gameHub.ts`
- [X] T004 [P] Create game test fixture and handler files in `src/tests/fixtures/gameFixtures.ts` and `src/tests/handlers/gameHandlers.ts`
- [X] T005 Run package-lock review for denied or malware-advised package scopes and record outcome in `specs/003-game-session-board/quickstart.md`
- [X] T006 Run `npm audit --audit-level=low` and record the accepted result or remediation note in `specs/003-game-session-board/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core game contracts, mapping, API, state, routes, and test scaffolding required by every game story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 [P] Define game domain types for sessions, players, tiles, pieces, turns, move requests, connection state, and blocking errors in `src/domain/game/gameTypes.ts`
- [X] T008 [P] Add game mapper tests for valid sessions, malformed snapshots, unknown statuses, missing references, and coordinate validation in `src/domain/game/gameMappers.test.ts`
- [X] T009 Implement game DTO-to-domain mappers and snapshot validation in `src/domain/game/gameMappers.ts`
- [X] T010 [P] Add game API request and error normalization tests for base URL, bearer auth, JSON bodies, `credentials: "omit"`, 401/403/404/409/network cases in `src/api/gameApi.test.ts`
- [X] T011 Implement typed game API wrappers and game error normalization in `src/api/gameApi.ts`
- [X] T012 [P] Add game store tests for authoritative session replacement, normalized lookups, selection clearing, pending state, connection state, blocking errors, and reset behavior in `src/stores/gameStore.test.ts`
- [X] T013 Implement game Zustand store skeleton with authoritative snapshot state, transient UI state, and selectors in `src/stores/gameStore.ts`
- [X] T014 [P] Add game REST fixtures for valid sessions, malformed snapshots, move success, move rejection, completed, and cancelled states in `src/tests/fixtures/gameFixtures.ts`
- [X] T015 Add MSW game REST handlers for session read, turn read, move success, move rejection, unauthorized, unavailable, malformed snapshot, completed, and cancelled cases in `src/tests/handlers/gameHandlers.ts`
- [X] T016 Register game MSW handlers in `src/tests/setup.ts`
- [X] T017 [P] Add protected game route and lobby-start handoff tests in `src/App.test.tsx`
- [X] T018 Wire protected `/game/:sessionId` route to the game page placeholder in `src/App.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - View Started Game Session (Priority: P1) MVP

**Goal**: Authenticated participants can open `/game/:sessionId` and see authoritative session, board, pieces, players, turn, status, loading, and blocking error states.

**Independent Test**: Sign in, open a valid game session route, and verify board dimensions, tile coordinates, piece placement, player order, current turn, connection status, loading, and malformed-snapshot blocking behavior.

### Tests for User Story 1

- [X] T019 [P] [US1] Add game session hook tests for route load, loading cleanup, unavailable session, malformed snapshot, completed/cancelled blocking state, and auth failure in `src/features/game/useGameSession.test.tsx`
- [X] T020 [P] [US1] Add game board render tests for dimensions, tile coordinates, active piece placement, captured piece handling, and no inferred missing tiles in `src/features/game/GameBoard.test.tsx`
- [X] T021 [P] [US1] Add game session page loading/error/status tests in `src/features/game/GameSessionPage.test.tsx`
- [X] T022 [P] [US1] Add Playwright game session load and malformed snapshot blocking scenarios in `src/tests/e2e/game-session-load.spec.ts`

### Implementation for User Story 1

- [X] T023 [US1] Implement `useGameSession` initial load, auth guard integration, loading cleanup, blocking error mapping, and reset behavior in `src/features/game/useGameSession.ts`
- [X] T024 [US1] Implement game session page shell with loading, unavailable, malformed, completed, cancelled, and connection status regions in `src/features/game/GameSessionPage.tsx`
- [X] T025 [US1] Implement board grid rendering from authoritative dimensions and tile coordinates in `src/features/game/GameBoard.tsx`
- [X] T026 [US1] Implement tile rendering with blocked, missing-data, category, ownership, selected, valid-target, and occupied state slots in `src/features/game/GameTile.tsx`
- [X] T027 [US1] Implement piece rendering on current backend tile with owner, level, captured, current-user, and disabled indicators in `src/features/game/GamePiece.tsx`
- [X] T028 [US1] Connect `/game/:sessionId` route loading and lobby start navigation handoff in `src/App.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Understand Board, Players, and Turn State (Priority: P2)

**Goal**: Players can understand current turn, player order, current user, piece ownership, tile ownership, blocked/occupied states, and non-color-only board indicators.

**Independent Test**: View a populated game state and verify player panel order, current-player marker, current-turn indicator, tile ownership, blocked/occupied states, selectable indicators, live-region turn announcement, and visual states not relying on color alone.

### Tests for User Story 2

- [X] T029 [P] [US2] Add player panel tests for player order, current user, current turn, display-name fallback, eliminated state, and piece counts in `src/features/game/GamePlayerPanel.test.tsx`
- [X] T030 [P] [US2] Add status bar tests for current turn, turn number, game status, connection state, and live-region text in `src/features/game/GameStatusBar.test.tsx`
- [X] T031 [P] [US2] Add tile accessibility tests for ownership, category, blocked, occupied, selected, valid-target, labels, and non-color-only indicators in `src/features/game/GameTile.test.tsx`
- [X] T032 [P] [US2] Add store selector tests for current user player, current turn player, selectable pieces, piece-on-tile lookup, board cells, and disabled reasons in `src/stores/gameStore.test.ts`

### Implementation for User Story 2

- [X] T033 [US2] Implement player panel with deterministic order, current-user marker, current-turn marker, eliminated state, and display-name fallback in `src/features/game/GamePlayerPanel.tsx`
- [X] T034 [US2] Implement status bar with turn number, current turn player, game status, connection status, and live-region announcements in `src/features/game/GameStatusBar.tsx`
- [X] T035 [US2] Add accessible labels, visible focus styling, and non-color-only state markers for tiles and pieces in `src/features/game/GameTile.tsx`
- [X] T036 [US2] Add derived selectors for current user player, current turn state, player display labels, piece-on-tile, board cells, and disabled reasons in `src/stores/gameStore.ts`
- [X] T037 [US2] Compose board, player panel, and status bar into the finished readable layout in `src/features/game/GameSessionPage.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Move Own Piece on Turn (Priority: P3)

**Goal**: The current player can select an own uncaptured piece, see orthogonal valid targets, submit a move, block duplicate submissions, and update only from authoritative confirmation.

**Independent Test**: Sign in as current turn player, select an eligible piece, verify only legal orthogonal helper targets, activate a target, and confirm pending feedback plus authoritative board, ownership, turn, and selection updates.

### Tests for User Story 3

- [X] T038 [P] [US3] Add movement helper tests for orthogonal target calculation, blocked/occupied/missing exclusion, diagonal/multi-tile rejection, and jumping rejection in `src/domain/game/gameMovement.test.ts`
- [X] T039 [P] [US3] Add move API tests for `pieceId`, `targetX`, `targetY`, pending duplicate behavior support, success mapping, and rejection mapping in `src/api/gameApi.test.ts`
- [X] T040 [P] [US3] Add game store movement tests for selecting own piece, candidate targets, pending move, duplicate prevention, success reconciliation, ownership update, turn advance, and selection clearing in `src/stores/gameStore.test.ts`
- [X] T041 [P] [US3] Add board interaction tests for click and keyboard piece selection, valid target activation, pending feedback, and live-region success in `src/features/game/GameBoard.test.tsx`
- [X] T042 [P] [US3] Add Playwright current-player move flow in `src/tests/e2e/game-move.spec.ts`

### Implementation for User Story 3

- [X] T043 [P] [US3] Implement movement helper functions for selectable pieces, orthogonal candidates, and target disabled reasons in `src/domain/game/gameMovement.ts`
- [X] T044 [US3] Implement move submission action, pending state, duplicate prevention, success reconciliation, and error handoff in `src/features/game/useGameSession.ts`
- [X] T045 [US3] Implement selection, keyboard navigation, target activation, and pending UI integration in `src/features/game/GameBoard.tsx`
- [X] T046 [US3] Implement selectable and pending visual/accessibility states for pieces in `src/features/game/GamePiece.tsx`
- [X] T047 [US3] Implement valid target, disabled target, and move-in-progress visual/accessibility states for tiles in `src/features/game/GameTile.tsx`
- [X] T048 [US3] Add current-player move controls, instructions, and move result announcements to `src/features/game/GameSessionPage.tsx`

**Checkpoint**: User Stories 1, 2, and 3 are independently functional.

---

## Phase 6: User Story 4 - Reject Invalid or Unauthorized Movement (Priority: P4)

**Goal**: Players cannot move when unauthorized or clearly invalid, and backend rejections produce centralized feedback without local durable board changes.

**Independent Test**: Attempt movement while not current turn, with another player's piece, captured piece, diagonal target, blocked target, occupied target, missing target, and backend rejection; verify no invalid submission or local durable board mutation.

### Tests for User Story 4

- [X] T049 [P] [US4] Add unauthorized selection tests for non-current turn, other-player piece, captured piece, completed game, cancelled game, malformed snapshot, and pending move in `src/stores/gameStore.test.ts`
- [X] T050 [P] [US4] Add invalid movement UI tests for disabled reasons, no submit on invalid target, toast feedback, and no stale board mutation in `src/features/game/GameBoard.test.tsx`
- [X] T051 [P] [US4] Add backend rejection hook tests for 400/403/404/409/network/CORS errors, toast vs modal display, and durable state preservation in `src/features/game/useGameSession.test.tsx`
- [X] T052 [P] [US4] Add game API error normalization tests for illegal move, not participant, not found, stale turn, blocked/occupied target, server unavailable, and CORS fallback in `src/api/gameApi.test.ts`

### Implementation for User Story 4

- [X] T053 [US4] Implement invalid selection guards and disabled reason selectors in `src/stores/gameStore.ts`
- [X] T054 [US4] Implement no-submit invalid target behavior and disabled reason feedback in `src/features/game/GameBoard.tsx`
- [X] T055 [US4] Implement game move rejection handling through toast/modal error stores without durable board mutation in `src/features/game/useGameSession.ts`
- [X] T056 [US4] Implement game API error normalization for unauthorized, not found, conflict, illegal move, backend unavailable, and CORS/network fallback in `src/api/gameApi.ts`
- [X] T057 [US4] Add invalid movement helper text and live-region failure announcements in `src/features/game/GameStatusBar.tsx`

**Checkpoint**: User Stories 1 through 4 are independently functional.

---

## Phase 7: User Story 5 - Stay Updated Through Game Events (Priority: P5)

**Goal**: Participants receive authoritative move, ownership, turn, completion, cancellation, duplicate/stale event, and reconnect updates without manual refresh.

**Independent Test**: Simulate game hub events and reconnect; verify board, pieces, ownership, turn, status, blocking state, connection status, pending move reconciliation, and live announcements update from authoritative payloads.

### Tests for User Story 5

- [X] T058 [P] [US5] Add typed game SignalR event contract and payload guard tests in `src/realtime/gameEvents.test.ts`
- [X] T059 [P] [US5] Add game hub service tests for URL derivation, access token factory, event registration, start/stop, reconnect, and session rejoin hooks in `src/realtime/gameHub.test.ts`
- [X] T060 [P] [US5] Add game store event reducer tests for session created, started, move executed, ownership changed, turn advanced, completed, cancelled, duplicate, stale, and patch-needs-refresh events in `src/stores/gameStore.test.ts`
- [X] T061 [P] [US5] Add game page realtime lifecycle tests for connection status, reconnect snapshot refresh, movement disabled during reconnect, and live-region announcements in `src/features/game/GameSessionPage.test.tsx`
- [X] T062 [P] [US5] Add Playwright realtime game update and reconnect scenarios in `src/tests/e2e/game-realtime.spec.ts`

### Implementation for User Story 5

- [X] T063 [US5] Define game SignalR event DTOs, event names, payload guards, and ignored conquest/question event handling in `src/realtime/gameEvents.ts`
- [X] T064 [US5] Implement centralized game hub connection lifecycle, event registration, reconnect, session rejoin, and dispatch in `src/realtime/gameHub.ts`
- [X] T065 [US5] Implement game store event handlers for snapshots, move executed, ownership changed, turn advanced, completed, cancelled, pending reconciliation, and stale-event protection in `src/stores/gameStore.ts`
- [X] T066 [US5] Connect game page lifecycle to game hub start, stop, reconnect snapshot refresh, and movement disabling during reconnect in `src/features/game/GameSessionPage.tsx`
- [X] T067 [US5] Add realtime live-region messages for move, ownership, turn, completion, cancellation, reconnect, and connection failure in `src/features/game/GameStatusBar.tsx`
- [X] T068 [US5] Add full-session refresh fallback for partial SignalR events that cannot be safely patched in `src/features/game/useGameSession.ts`

**Checkpoint**: All user stories are independently functional and realtime behavior is covered.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility, performance, security, and documentation across all game stories.

- [X] T069 [P] Add performance-focused render tests or assertions for selector subscriptions and memoized board tile/piece rendering in `src/features/game/GameBoard.test.tsx`
- [X] T070 [P] Implement and verify dark blue/white game-screen visual-system styling, focus states, loading states, modal/toast states, and no browser-default controls across `src/features/game/`
- [X] T071 [P] Update keyboard-only board flow, focus order, labels, live regions, and non-color-only indicators across `src/features/game/`
- [X] T072 [P] Add selector-subscription and controlled-dispatch safeguards for unnecessary rerenders in `src/stores/gameStore.ts` and `src/realtime/gameHub.ts`
- [X] T073 [P] Add or update route handoff regression tests from lobby start to `/game/:sessionId` in `src/features/lobby/useLobbyActions.test.tsx`
- [X] T074 [P] Run `npm test` and fix failures in `src/`
- [X] T075 [P] Run `npm run test:e2e` and fix failures in `src/tests/e2e/`
- [X] T076 [P] Run `npm run build` and fix TypeScript or Vite build failures in `src/`
- [X] T077 Add timing assertions for 5-second game load and 500 ms pending feedback goals in `src/tests/e2e/game-performance.spec.ts`
- [X] T078 Re-run package-lock review, `npm audit --audit-level=low`, and current malware advisory checks for `package-lock.json`
- [X] T079 Validate all quickstart scenarios and update `specs/003-game-session-board/quickstart.md` with final environment-specific notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and integrates with board/page surfaces from US1.
- **User Story 3 (Phase 5)**: Depends on Foundational and uses board/player/turn surfaces from US1/US2.
- **User Story 4 (Phase 6)**: Depends on Foundational and hardens movement behavior from US3.
- **User Story 5 (Phase 7)**: Depends on Foundational and integrates with page/store behavior from US1-US4.
- **Polish (Phase 8)**: Depends on all desired user stories.

### User Story Dependencies

- **US1 View Started Game Session**: MVP; no dependency on other user stories after Foundational.
- **US2 Understand Board, Players, and Turn State**: Can be built after Foundational, with full validation easiest once US1 renders the page shell and board.
- **US3 Move Own Piece on Turn**: Requires authoritative board, pieces, current user, and turn state from US1/US2.
- **US4 Reject Invalid or Unauthorized Movement**: Depends on US3 movement path, but API/error/store guard tests can begin after Foundational.
- **US5 Stay Updated Through Game Events**: Realtime service/store work can begin after Foundational, with page integration easiest once US1-US4 surfaces exist.

### Within Each User Story

- Write tests first and confirm they fail for the intended missing behavior.
- Domain helpers and API/store changes before hooks.
- Hooks before presentational components.
- Components before route or lifecycle integration.
- SignalR service updates before components consume realtime events.
- Story complete before moving to the next priority checkpoint.

---

## Parallel Opportunities

- T001-T004 can run in parallel.
- T007, T008, T010, T012, T014, and T017 touch different files and can run in parallel after setup.
- Test tasks inside each user story marked [P] can run in parallel.
- UI components for player panel, status bar, board tile, and piece can be split once foundational types exist.
- US4 API/error guard tests and US5 realtime service tests can start after Foundational while US3 UI work proceeds, if integration order is coordinated.
- Polish tasks T069-T076 can run in parallel after the targeted stories are complete.

---

## Parallel Example: User Story 1

```bash
Task: "T019 Add game session hook tests for route load, loading cleanup, unavailable session, malformed snapshot, completed/cancelled blocking state, and auth failure in src/features/game/useGameSession.test.tsx"
Task: "T020 Add game board render tests for dimensions, tile coordinates, active piece placement, captured piece handling, and no inferred missing tiles in src/features/game/GameBoard.test.tsx"
Task: "T021 Add game session page loading/error/status tests in src/features/game/GameSessionPage.test.tsx"
Task: "T022 Add Playwright game session load and malformed snapshot blocking scenarios in src/tests/e2e/game-session-load.spec.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T038 Add movement helper tests for orthogonal target calculation, blocked/occupied/missing exclusion, diagonal/multi-tile rejection, and jumping rejection in src/domain/game/gameMovement.test.ts"
Task: "T039 Add move API tests for pieceId, targetX, targetY, pending duplicate behavior support, success mapping, and rejection mapping in src/api/gameApi.test.ts"
Task: "T040 Add game store movement tests for selecting own piece, candidate targets, pending move, duplicate prevention, success reconciliation, ownership update, turn advance, and selection clearing in src/stores/gameStore.test.ts"
Task: "T041 Add board interaction tests for click and keyboard piece selection, valid target activation, pending feedback, and live-region success in src/features/game/GameBoard.test.tsx"
```

## Parallel Example: User Story 5

```bash
Task: "T058 Add typed game SignalR event contract and payload guard tests in src/realtime/gameEvents.test.ts"
Task: "T059 Add game hub service tests for URL derivation, access token factory, event registration, start/stop, reconnect, and session rejoin hooks in src/realtime/gameHub.test.ts"
Task: "T060 Add game store event reducer tests for session created, started, move executed, ownership changed, turn advanced, completed, cancelled, duplicate, stale, and patch-needs-refresh events in src/stores/gameStore.test.ts"
Task: "T061 Add game page realtime lifecycle tests for connection status, reconnect snapshot refresh, movement disabled during reconnect, and live-region announcements in src/features/game/GameSessionPage.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate session route loading, authoritative board dimensions, tile coordinates, piece placement, player/turn/status display, and malformed snapshot blocking.

### Incremental Delivery

1. Setup + Foundational -> core game domain, API, store, route, fixtures, and handlers.
2. US1 -> load and render the started game session MVP.
3. US2 -> make board/player/turn state understandable and accessible.
4. US3 -> add current-player movement with authoritative confirmation.
5. US4 -> harden invalid and unauthorized movement recovery.
6. US5 -> add SignalR synchronization and reconnect behavior.
7. Polish -> accessibility, performance, security, build, and quickstart validation.

### Quality Gates

- Tests for each story must fail before implementation and pass at that story checkpoint.
- `npm test`, `npm run test:e2e`, and `npm run build` must pass before implementation is considered complete.
- Game load timing and move pending feedback assertions must cover SC-001 and the 500 ms plan goal before implementation is considered complete.
- Package-lock review, `npm audit --audit-level=low`, and current malware advisory checks must pass or have documented remediation before accepting dependency changes.
- No game UI component may consume raw backend DTOs or own SignalR connection lifecycle.
- No durable board, piece, ownership, turn, completion, or cancellation state may be committed without backend REST or SignalR authority.
