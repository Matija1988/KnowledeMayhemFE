# Tasks: Question Conquest and Answer Validation During Gameplay

**Input**: Design documents from `/specs/004-question-conquest/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Required by constitution for gameplay, quiz/question, board, SignalR, reconnect, synchronization, accessibility, and dependency-risk behavior.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested as an independent increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or depends only on completed phase prerequisites
- **[Story]**: User story label for story-phase tasks only
- Every task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the feature can be added without new dependency risk and prepare the shared folders.

- [X] T001 Review `package-lock.json` and a current npm malware/advisory source for denied or malware-advised package scopes before feature implementation
- [X] T002 Run `npm audit --audit-level=low` and record any security or malware advisory follow-up in `specs/004-question-conquest/quickstart.md`
- [X] T003 [P] Create conquest domain folder scaffold in `src/domain/conquest/`
- [X] T004 [P] Create conquest feature folder scaffold in `src/features/conquest/`
- [X] T005 [P] Create placeholder conquest test fixture file in `src/tests/fixtures/conquestFixtures.ts`
- [X] T006 [P] Create placeholder conquest handler file in `src/tests/handlers/conquestHandlers.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish typed contracts, mappers, API wrappers, stores, and realtime plumbing required by all stories.

**CRITICAL**: No user story work should begin until this phase is complete.

- [X] T007 [P] Define conquest domain types for questions, attempts, results, UI state, and DTOs in `src/domain/conquest/conquestTypes.ts`
- [X] T008 [P] Add valid, malformed, correct-result, incorrect-result, expired-result, and duplicate-result fixtures in `src/tests/fixtures/conquestFixtures.ts`
- [X] T009 [P] Add MSW handlers for start attempt and submit answer endpoints in `src/tests/handlers/conquestHandlers.ts`
- [X] T010 Wire conquest MSW handlers into the existing shared test setup pattern in `src/tests/setup.ts`
- [X] T011 [P] Add mapper tests for valid questions, four-option enforcement, correctness leakage rejection, and result mapping in `src/domain/conquest/conquestMappers.test.ts`
- [X] T012 Implement conquest DTO-to-domain mappers and strict payload validation in `src/domain/conquest/conquestMappers.ts`
- [X] T013 [P] Add API wrapper tests for start attempt, submit answer, auth headers, JSON body, and problem mapping in `src/api/conquestApi.test.ts`
- [X] T014 Implement conquest REST wrapper functions in `src/api/conquestApi.ts`
- [X] T015 [P] Add conquest store tests for active question, selected answer, pending flags, expired pending, result visibility, blocking errors, and duplicate result handling in `src/stores/conquestStore.test.ts`
- [X] T016 Implement conquest transient Zustand store in `src/stores/conquestStore.ts`
- [X] T017 [P] Add game store tests for applying conquest result snapshots and patch results without optimistic movement in `src/stores/gameStore.test.ts`
- [X] T018 Extend authoritative conquest result application in `src/stores/gameStore.ts`
- [X] T019 [P] Add SignalR conquest event parsing tests for issued, submitted, succeeded, failed, expired, and stale events in `src/realtime/gameEvents.test.ts`
- [X] T020 Extend centralized game SignalR event contracts and mappers in `src/realtime/gameEvents.ts`
- [X] T021 [P] Add game hub dispatch tests for conquest events and reconnect refresh gating in `src/realtime/gameHub.test.ts`
- [X] T022 Extend centralized game hub dispatch and reconnect handling for conquest events in `src/realtime/gameHub.ts`

**Checkpoint**: Foundation ready. Stories can now be implemented in priority order or in parallel by separate developers.

---

## Phase 3: User Story 1 - Start a Conquest Question (Priority: P1) MVP

**Goal**: Selecting a valid empty reachable target starts a conquest attempt, shows a question, and leaves the board unchanged while pending.

**Independent Test**: Load an active game, select the current player's own uncaptured piece, select a valid adjacent empty tile, and confirm a question appears while the piece, ownership, and turn remain unchanged.

### Tests for User Story 1

- [X] T023 [P] [US1] Add hook tests for target selection starting conquest instead of direct move in `src/features/game/useGameSession.test.ts`
- [X] T024 [P] [US1] Add board interaction tests for blocking additional movement during a pending attempt in `src/features/game/GameBoard.test.tsx`
- [X] T025 [P] [US1] Add route-level test for question display after valid target selection in `src/features/game/GameSessionPage.test.tsx`
- [X] T026 [P] [US1] Add local validation tests for active game, own piece, uncaptured piece, turn ownership, adjacency, unblocked target, and empty target in `src/domain/conquest/conquestRules.test.ts`

### Implementation for User Story 1

- [X] T027 [P] [US1] Implement conquest local validation helpers in `src/domain/conquest/conquestRules.ts`
- [X] T028 [US1] Add start-attempt action and pending movement guard in `src/features/conquest/useConquestActions.ts`
- [X] T029 [US1] Change valid target activation to call start conquest attempt instead of direct move in `src/features/game/useGameSession.ts`
- [X] T030 [US1] Disable piece and target interactions while a conquest attempt is pending in `src/features/game/GameBoard.tsx`
- [X] T031 [US1] Preserve selected piece/source/target board visuals without durable movement in `src/features/game/GameTile.tsx`
- [X] T032 [US1] Render the active conquest question container from the game session route in `src/features/game/GameSessionPage.tsx`
- [X] T033 [US1] Add centralized invalid-attempt and pending-attempt feedback wiring in `src/features/game/GameSessionPage.tsx`

**Checkpoint**: MVP story works independently: valid target selection opens a question and does not move the piece.

---

## Phase 4: User Story 2 - Answer a Gameplay Question (Priority: P1)

**Goal**: Acting player selects one of exactly four answer options, confirms with Submit, and cannot submit twice; non-acting answer correctness is never exposed.

**Independent Test**: Start a conquest attempt, verify exactly four answer options with no correctness indicator, select one answer, confirm no submission until Submit, then submit once and confirm controls are disabled.

### Tests for User Story 2

- [X] T034 [P] [US2] Add answer option component tests for selection, disabled, pending, non-color state, and accessible labels in `src/features/conquest/AnswerOptionButton.test.tsx`
- [X] T035 [P] [US2] Add question modal tests for exactly four options, no correctness leakage, explicit Submit, non-dismissible pending UI, and acting-player controls in `src/features/conquest/QuestionModal.test.tsx`
- [ ] T036 [P] [US2] Add submit action tests for duplicate prevention, pending flags, and API error feedback in `src/features/conquest/useConquestActions.test.ts`
- [X] T037 [P] [US2] Add accessibility tests for focus entry, grouped radio-style answers, Submit enablement, and live pending announcements in `src/features/conquest/QuestionModal.test.tsx`

### Implementation for User Story 2

- [X] T038 [P] [US2] Implement answer option button states in `src/features/conquest/AnswerOptionButton.tsx`
- [X] T039 [US2] Implement question modal structure, non-dismissible pending behavior, answer group, Submit action, and live status in `src/features/conquest/QuestionModal.tsx`
- [X] T040 [US2] Extend conquest actions with answer selection and Submit behavior in `src/features/conquest/useConquestActions.ts`
- [X] T041 [US2] Wire selected answer, pending answer, and blocking error state into `src/stores/conquestStore.ts`
- [X] T042 [US2] Connect the question modal to the game route with acting-player permissions in `src/features/game/GameSessionPage.tsx`
- [X] T043 [US2] Add dark blue and white visual states for selected, disabled, pending, focus, and error presentation in `src/index.css`

**Checkpoint**: Acting player can answer via select-then-submit, and malformed or correctness-leaking questions are blocked.

---

## Phase 5: User Story 3 - Resolve Correct and Incorrect Conquests (Priority: P1)

**Goal**: Correct, incorrect, duplicate, and stale conquest results update board, ownership, feedback, and turn only from authoritative data.

**Independent Test**: Submit correct and incorrect answers in controlled states and confirm piece position, target ownership, result feedback, and turn display match the authoritative result.

### Tests for User Story 3

- [X] T044 [P] [US3] Add store tests for correct, incorrect, snapshot-backed, patch-backed, duplicate, and stale result reconciliation in `src/stores/gameStore.test.ts`
- [X] T045 [P] [US3] Add conquest store tests for result feedback visibility, duplicate feedback suppression, and auto-clear timing in `src/stores/conquestStore.test.ts`
- [X] T046 [P] [US3] Add result banner tests for success, failure, cancelled, accessible announcement, and non-color indicators in `src/features/conquest/ConquestResultBanner.test.tsx`
- [ ] T047 [P] [US3] Add game session integration tests for applying answer response before matching realtime result in `src/features/game/GameSessionPage.test.tsx`

### Implementation for User Story 3

- [X] T048 [US3] Apply authoritative correct, incorrect, cancelled, snapshot, and patch results in `src/stores/gameStore.ts`
- [X] T049 [US3] Reconcile direct answer responses with realtime result events by questionAttemptId in `src/stores/conquestStore.ts`
- [X] T050 [P] [US3] Implement conquest result banner in `src/features/conquest/ConquestResultBanner.tsx`
- [X] T051 [US3] Show result feedback for about 3 seconds then clear modal state in `src/features/conquest/useConquestActions.ts`
- [X] T052 [US3] Return focus to the board or next actionable game area after result cleanup in `src/features/game/GameSessionPage.tsx`
- [X] T053 [US3] Update turn, ownership, and result live announcements after authoritative results in `src/features/game/GameSessionPage.tsx`

**Checkpoint**: P1 conquest loop is complete: start question, submit answer, resolve board and turn from backend authority.

---

## Phase 6: User Story 4 - Handle Expired Attempts (Priority: P2)

**Goal**: Attempts with expiration show time remaining, disable answering locally on expiration, and wait for authoritative failed resolution before movement resumes.

**Independent Test**: Receive a question with an expiration time, wait until it expires, confirm answer submission is disabled and expired pending feedback remains until authoritative resolution.

### Tests for User Story 4

- [X] T054 [P] [US4] Add timer tests for countdown display, no screen-reader spam, expiration transition, and cleanup in `src/features/conquest/QuestionTimer.test.tsx`
- [ ] T055 [P] [US4] Add hook tests for local expiration disabling Submit, submit-at-expiration race handling, and requesting or awaiting authoritative resolution in `src/features/conquest/useConquestActions.test.ts`
- [X] T056 [P] [US4] Add store tests for expired pending state and expired authoritative result reconciliation in `src/stores/conquestStore.test.ts`
- [ ] T057 [P] [US4] Add route integration test for movement remaining disabled after local expiration until refresh or result in `src/features/game/GameSessionPage.test.tsx`

### Implementation for User Story 4

- [X] T058 [P] [US4] Implement question timer display and expiration callback in `src/features/conquest/QuestionTimer.tsx`
- [X] T059 [US4] Integrate timer and expired pending presentation into `src/features/conquest/QuestionModal.tsx`
- [X] T060 [US4] Disable answer selection and Submit on local expiration in `src/features/conquest/useConquestActions.ts`
- [X] T061 [US4] Request or await authoritative resolution after local expiration in `src/features/conquest/useConquestActions.ts`
- [X] T062 [US4] Keep board movement blocked until expired attempt resolves or a fresh snapshot loads in `src/features/game/useGameSession.ts`
- [X] T063 [US4] Add expired warning and failed-result visual states in `src/index.css`

**Checkpoint**: Expired attempts are understandable, non-interactive, and server-authoritative.

---

## Phase 7: User Story 5 - Stay Synchronized Through Realtime Updates (Priority: P2)

**Goal**: All players see active questions and authoritative results through the centralized game hub, with reconnect and stale-event protection.

**Independent Test**: Run two authenticated players in the same game, resolve a conquest attempt in one context, and confirm the other context sees question, result, board update, and turn change without manual refresh.

### Tests for User Story 5

- [X] T064 [P] [US5] Add non-acting player modal tests for visible question/options and disabled selection/Submit in `src/features/conquest/QuestionModal.test.tsx`
- [X] T065 [P] [US5] Add game hub tests for question-issued, result, expired, duplicate, out-of-order, and reconnect snapshot behavior in `src/realtime/gameHub.test.ts`
- [X] T066 [P] [US5] Add game session integration test for non-acting player realtime board and turn updates without refresh in `src/features/game/GameSessionPage.test.tsx`
- [ ] T067 [P] [US5] Add Playwright two-profile conquest synchronization scenario in `src/tests/e2e/question-conquest.spec.ts`

### Implementation for User Story 5

- [X] T068 [US5] Dispatch `ConquestAttemptStarted`, `QuestionIssued`, `AnswerSubmitted`, `ConquestSucceeded`, `ConquestFailed`, and `ConquestExpired` events in `src/realtime/gameHub.ts`
- [X] T069 [US5] Apply realtime question visibility and non-acting player read-only behavior in `src/stores/conquestStore.ts`
- [X] T070 [US5] Disable non-acting answer controls while preserving shared question visibility in `src/features/conquest/QuestionModal.tsx`
- [X] T071 [US5] Refresh authoritative game state after reconnect before re-enabling movement in `src/realtime/gameHub.ts`
- [X] T072 [US5] Guard duplicate and out-of-order conquest/turn events from undoing newer state in `src/stores/gameStore.ts`
- [X] T073 [US5] Surface realtime reconnect and desynchronization blocking errors in `src/features/game/GameSessionPage.tsx`

**Checkpoint**: Multiplayer synchronization works for acting and non-acting players without refresh.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete flow, accessibility, performance, docs, and security gates.

- [ ] T074 [P] Add keyboard-only and screen-reader focused regression coverage for the full conquest flow in `src/tests/e2e/question-conquest.spec.ts`
- [X] T075 [P] Add malformed payload and network failure regression tests in `src/api/conquestApi.test.ts`
- [ ] T076 [P] Add performance validation for 2-second question display, 500 ms pending feedback, and board subscription/memoization behavior in `src/features/game/GameSessionPage.test.tsx`
- [X] T077 [P] Review modal, result, timer, and error styling against the dark blue and white visual system in `src/index.css`
- [X] T078 Update quickstart validation notes with final endpoint/event names and local two-player testing steps in `specs/004-question-conquest/quickstart.md`
- [X] T079 Run `npm test` and record failures or fixes in `specs/004-question-conquest/quickstart.md`
- [X] T080 Run `npm run build` and record failures or fixes in `specs/004-question-conquest/quickstart.md`
- [X] T081 Run `npm audit --audit-level=low`, check a current npm malware/advisory source, and confirm no new dependency risk in `specs/004-question-conquest/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **US1 (Phase 3)**: Depends on Foundational and is the MVP.
- **US2 (Phase 4)**: Depends on Foundational; integrates naturally after US1 for the full P1 loop.
- **US3 (Phase 5)**: Depends on US1 and US2 for end-to-end answer resolution.
- **US4 (Phase 6)**: Depends on US1 and US2 because expiration is a variant of an active pending question.
- **US5 (Phase 7)**: Depends on Foundational; depends on US1-US3 for full realtime result behavior.
- **Polish (Phase 8)**: Depends on all desired user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Independent MVP after Foundational.
- **User Story 2 (P1)**: Can be built after Foundational, but route integration is most useful after US1.
- **User Story 3 (P1)**: Requires answer submission and result application from US2.
- **User Story 4 (P2)**: Requires pending question UI and answer controls from US2.
- **User Story 5 (P2)**: Requires realtime foundation and becomes fully valuable after US1-US3.

### Within Each User Story

- Tests must be written before implementation and should fail for the intended missing behavior.
- Mappers and stores precede feature hooks.
- Feature hooks precede presentational components.
- Centralized SignalR handling precedes UI consumption of realtime events.
- Authoritative state updates precede visual feedback wiring.

---

## Parallel Execution Examples

### User Story 1

```text
Task: T023 [US1] Add hook tests in src/features/game/useGameSession.test.ts
Task: T024 [US1] Add board interaction tests in src/features/game/GameBoard.test.tsx
Task: T026 [US1] Add validation tests in src/domain/conquest/conquestRules.test.ts
```

### User Story 2

```text
Task: T034 [US2] Add AnswerOptionButton tests in src/features/conquest/AnswerOptionButton.test.tsx
Task: T035 [US2] Add QuestionModal tests in src/features/conquest/QuestionModal.test.tsx
Task: T036 [US2] Add useConquestActions submit tests in src/features/conquest/useConquestActions.test.ts
```

### User Story 3

```text
Task: T044 [US3] Add game store reconciliation tests in src/stores/gameStore.test.ts
Task: T045 [US3] Add conquest store result tests in src/stores/conquestStore.test.ts
Task: T046 [US3] Add result banner tests in src/features/conquest/ConquestResultBanner.test.tsx
```

### User Story 4

```text
Task: T054 [US4] Add timer tests in src/features/conquest/QuestionTimer.test.tsx
Task: T055 [US4] Add expiration hook tests in src/features/conquest/useConquestActions.test.ts
Task: T057 [US4] Add route integration test in src/features/game/GameSessionPage.test.tsx
```

### User Story 5

```text
Task: T064 [US5] Add non-acting modal tests in src/features/conquest/QuestionModal.test.tsx
Task: T065 [US5] Add hub event tests in src/realtime/gameHub.test.ts
Task: T067 [US5] Add Playwright sync scenario in src/tests/e2e/question-conquest.spec.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup and Phase 2 foundation.
2. Complete Phase 3 User Story 1.
3. Validate that selecting a valid target opens a question and does not move the piece.
4. Stop and demo the MVP before adding answer/result behavior.

### P1 Gameplay Loop

1. Complete US1 for attempt creation.
2. Complete US2 for answer selection and explicit Submit.
3. Complete US3 for authoritative correct/incorrect resolution.
4. Validate the full start-answer-result-turn loop with unit, route, and MSW-backed tests.

### P2 Multiplayer Robustness

1. Complete US4 for expiration behavior.
2. Complete US5 for realtime non-acting player sync and reconnect recovery.
3. Validate two-player browser behavior and stale/duplicate event handling.

### Final Validation

1. Run `npm test`.
2. Run `npm run build`.
3. Run `npm audit --audit-level=low`.
4. Execute the quickstart scenarios in `specs/004-question-conquest/quickstart.md`.

---

## Notes

- No new runtime dependency is planned for this feature.
- Durable board, ownership, turn, completion, cancellation, and expiration state must remain backend-authoritative.
- UI components must consume mapped domain models and feature hooks, not raw REST or SignalR payloads.
- Commit after each story checkpoint or logical task group.
