# Tasks: Piece Battles, Special Fields, and Level Progression

**Input**: Design documents from `/specs/006-piece-battles-levels/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by the project constitution for gameplay, quiz, board, SignalR, reconnect, synchronization, accessibility, and dependency-risk behavior.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or depends only on completed foundation.
- **[Story]**: User story label for story phases only.
- Every task includes an exact file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare feature folders, fixtures, and dependency/security checks.

- [X] T001 Create battle feature folder structure in src/features/battle/
- [X] T002 Create battle domain folder structure in src/domain/battle/
- [X] T003 Create battle API placeholder module in src/api/battleApi.ts
- [X] T004 [P] Create battle fixture placeholder in src/tests/fixtures/battleFixtures.ts
- [X] T005 [P] Create battle MSW handler placeholder in src/tests/handlers/battleHandlers.ts
- [X] T006 [P] Document no-new-runtime-dependency package-lock review for this feature in specs/006-piece-battles-levels/quickstart.md
- [X] T007 [P] Verify current dependency baseline with npm audit and record the command outcome in specs/006-piece-battles-levels/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, mapping, store state, and realtime contract support required by all stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T008 [P] Define battle and special-field DTO/domain types in src/domain/battle/battleTypes.ts
- [X] T009 [P] Add battle and special-field safe question/result fixture builders in src/tests/fixtures/battleFixtures.ts
- [X] T010 [P] Add MSW handlers for battle and special-field start/answer endpoints in src/tests/handlers/battleHandlers.ts
- [X] T011 [P] Add battle API wrapper tests for start/answer endpoint URLs and payloads in src/api/battleApi.test.ts
- [X] T012 Implement battle API wrapper functions using centralized httpClient in src/api/battleApi.ts
- [X] T013 [P] Add mapper tests for safe question, active-valid question metadata, no-repeat fallback metadata, result, capture, level, and stale-sequence payloads in src/domain/battle/battleMappers.test.ts
- [X] T014 Implement DTO-to-domain mappers that strip hidden correctness metadata in src/domain/battle/battleMappers.ts
- [X] T015 [P] Add pending attempt lock and result reconciliation tests in src/stores/battleStore.test.ts
- [X] T016 Implement battleStore for pending battle/special state, selected answer, progress, result banners, and stale sequence tracking in src/stores/battleStore.ts
- [X] T017 [P] Extend game type tests for piece level, captured state, special tile type, and occupancy in src/domain/game/gameMappers.test.ts
- [X] T018 Extend game domain types and mappers with piece level, captured state, special tile type, and occupancy in src/domain/game/gameTypes.ts and src/domain/game/gameMappers.ts
- [X] T019 [P] Add GameStore tests for captured pieces, level updates, tile ownership updates, and sequence-based stale update rejection in src/stores/gameStore.test.ts
- [X] T020 Extend gameStore reconciliation helpers for battle/special result application without optimistic board mutation in src/stores/gameStore.ts
- [X] T021 [P] Add typed SignalR event contract tests for battle/special/capture/level/turn events in src/realtime/gameEvents.test.ts
- [X] T022 Extend centralized game SignalR event types with battle/special/capture/level/turn/snapshot-required events in src/realtime/gameEvents.ts
- [X] T023 Reconcile battle and special-field DTO types with the backend OpenAPI contract before finalizing handwritten wrappers in src/api/battleApi.ts
- [X] T024 [P] Add API/problem-details tests for invalid battle and special-field command rejections without local board mutation in src/api/battleApi.test.ts
- [X] T025 [P] Add audit contract fixture expectations for battle start, answer submission, battle result, special field result, capture, level-up, and turn advancement in src/tests/fixtures/battleFixtures.ts
- [X] T026 [P] Add frontend telemetry contract tests for battle/special command failures, SignalR reconnect recovery, snapshot-required recovery, stale event rejection, and timing markers without hidden answer metadata in src/realtime/gameTelemetry.test.ts
- [X] T027 Implement non-sensitive frontend telemetry helpers for battle/special command failures, SignalR reconnect recovery, snapshot-required recovery, stale event rejection, battle-start timing, and opponent-update timing in src/realtime/gameTelemetry.ts

**Checkpoint**: Foundation ready. User stories can now be implemented.

---

## Phase 3: User Story 1 - Attack Enemy Pieces (Priority: P1) MVP

**Goal**: Current-turn players can start and resolve enemy-piece battles without exposing hidden answer correctness.

**Independent Test**: Start a two-player game with adjacent enemy pieces, complete battle success and failure flows, and verify board state, capture, ownership, progress, and turn behavior.

### Tests for User Story 1

- [X] T028 [P] [US1] Add battle action hook tests for valid attack, invalid attack, pending lock, wrong player, captured attacker, and backend problem-details rejection handling in src/features/battle/useBattleActions.test.tsx
- [X] T029 [P] [US1] Add BattleQuestionModal tests for actor submission, spectator read-only mode, keyboard selection, hidden correctness safety, and active-valid/no-repeat fallback display neutrality in src/features/battle/BattleQuestionModal.test.tsx
- [X] T030 [P] [US1] Add BattleProgressPanel tests for required answer count, progress updates, incorrect answer failure, and expiration messaging in src/features/battle/BattleProgressPanel.test.tsx
- [X] T031 [P] [US1] Add battle success/failure board integration tests in src/features/game/GameSessionPage.test.tsx
- [X] T032 [P] [US1] Add Playwright enemy battle success/failure journey with under-10-second battle-start assertion in src/tests/e2e/battle-enemy-piece.spec.ts

### Implementation for User Story 1

- [X] T033 [US1] Implement useBattleActions startBattle and submitBattleAnswer flows in src/features/battle/useBattleActions.ts
- [X] T034 [P] [US1] Implement reusable answer option control for battle/special questions in src/features/battle/BattleAnswerOptionButton.tsx
- [X] T035 [US1] Implement actor/spectator battle question modal with keyboard support and live regions in src/features/battle/BattleQuestionModal.tsx
- [X] T036 [US1] Implement battle progress display and expiration/failure feedback in src/features/battle/BattleProgressPanel.tsx
- [X] T037 [US1] Add enemy-occupied tile targeting path from GameBoard and GameTile to battle actions in src/features/game/GameBoard.tsx and src/features/game/GameTile.tsx
- [X] T038 [US1] Render battle modal/progress/result state in GameSessionPage without optimistic board changes in src/features/game/GameSessionPage.tsx
- [X] T039 [US1] Ensure battle controls disable move, attack, ordinary conquest, and end-turn actions while any attempt is pending in src/features/game/GameSessionPage.tsx

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Conquer Special Fields (Priority: P1)

**Goal**: Current-turn players can resolve three-question attempts on reachable unoccupied special tiles.

**Independent Test**: Start a game with a reachable unoccupied special tile, complete success and failure/expiration flows, and verify movement, ownership, level reward, and turn behavior.

### Tests for User Story 2

- [X] T040 [P] [US2] Add special field action hook tests for valid start, occupied target rejection, wrong turn, three-answer success, incorrect failure, expiration, and backend problem-details rejection handling in src/features/battle/useSpecialFieldActions.test.tsx
- [X] T041 [P] [US2] Add special field modal/progress tests for exactly three answers, spectator read-only mode, active-valid/no-repeat fallback neutrality, and accessibility announcements in src/features/battle/SpecialFieldQuestionModal.test.tsx
- [X] T042 [P] [US2] Add special tile rendering and targetability tests in src/features/game/GameTile.test.tsx
- [X] T043 [P] [US2] Add Playwright special field success/failure journey in src/tests/e2e/special-field-conquest.spec.ts

### Implementation for User Story 2

- [X] T044 [US2] Implement useSpecialFieldActions startSpecialFieldAttempt and submitSpecialFieldAnswer flows in src/features/battle/useSpecialFieldActions.ts
- [X] T045 [US2] Implement special field question modal by reusing shared battle answer controls in src/features/battle/SpecialFieldQuestionModal.tsx
- [X] T046 [US2] Implement special field status and targetability badge in src/features/battle/SpecialFieldBadge.tsx
- [X] T047 [US2] Add unoccupied special tile selection path from GameBoard and GameTile to special field actions in src/features/game/GameBoard.tsx and src/features/game/GameTile.tsx
- [X] T048 [US2] Render special field modal/progress/result state in GameSessionPage without optimistic board changes in src/features/game/GameSessionPage.tsx

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Progress Piece Levels (Priority: P2)

**Goal**: Pieces start at level 1, level up after successful captures or special field conquests, cap at level 3, and higher-level defenders raise battle difficulty.

**Independent Test**: Complete repeated successful actions with the same piece and verify level display, max cap, defender-level difficulty, and no level gain on failure.

### Tests for User Story 3

- [X] T049 [P] [US3] Add piece level rule tests for start level, max level 3, defender level plus one difficulty, and no gain on failure in src/domain/battle/battleRules.test.ts
- [X] T050 [P] [US3] Add GamePiece rendering tests for level badge, captured state, and non-color-only indicators in src/features/game/GamePiece.test.tsx
- [X] T051 [P] [US3] Add result banner tests for capture, level-up, max-level, failed-attempt feedback, and audit-reference display neutrality in src/features/battle/BattleResultBanner.test.tsx

### Implementation for User Story 3

- [X] T052 [US3] Implement battle level/difficulty helpers in src/domain/battle/battleRules.ts
- [X] T053 [US3] Render piece level and captured state accessibly in src/features/game/GamePiece.tsx
- [X] T054 [US3] Implement battle and special result banner feedback for capture, level-up, max-level, failure, expiration, and turn advancement in src/features/battle/BattleResultBanner.tsx
- [X] T055 [US3] Integrate result banner state with battleStore and GameSessionPage in src/stores/battleStore.ts and src/features/game/GameSessionPage.tsx

**Checkpoint**: Level progression and captured-piece display are independently verifiable.

---

## Phase 6: User Story 4 - Keep Multiplayer State Synchronized (Priority: P2)

**Goal**: All connected and reconnecting players see authoritative battle, special field, capture, level, ownership, and turn changes without manual refresh.

**Independent Test**: Use two player sessions, start/resolve battle and special attempts in one session, verify the other session receives consistent updates, then reconnect during a pending attempt.

### Tests for User Story 4

- [X] T056 [P] [US4] Add gameHub tests for battle/special/capture/level event registration and dispatch to stores in src/realtime/gameHub.test.ts
- [X] T057 [P] [US4] Add store tests for duplicate events, out-of-order events, snapshot-required events, and reconnect recovery in src/stores/gameStore.test.ts
- [X] T058 [P] [US4] Add two-player realtime Playwright coverage with 2-second opponent-update timing assertions for battle and special field synchronization in src/tests/e2e/battle-special-realtime.spec.ts

### Implementation for User Story 4

- [X] T059 [US4] Register battle/special/capture/level/turn/snapshot-required handlers in centralized game hub service in src/realtime/gameHub.ts
- [X] T060 [US4] Wire SignalR domain events into battleStore and gameStore reconciliation paths in src/realtime/gameHub.ts
- [X] T061 [US4] Trigger authoritative game session refresh on reconnect or GameSnapshotRequiredEvent in src/features/game/useGameSession.ts
- [X] T062 [US4] Add live region announcements for opponent battle starts, question progress, capture, level-up, special result, turn advance, and reconnect status in src/features/game/GameStatusBar.tsx

**Checkpoint**: Multiplayer synchronization and reconnect recovery are independently verifiable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Feature-wide cleanup, verification, accessibility, performance, and documentation.

- [X] T063 [P] Update MSW test server registration to include battle handlers in src/tests/setup.ts
- [X] T064 [P] Update game e2e fixture helpers for battle/special board states, active-valid question pools, and repeat-fallback scenarios in src/tests/e2e/game-fixtures.ts
- [X] T065 [P] Add final accessibility regression tests for keyboard-only battle/special flows and live region output in src/features/battle/battleAccessibility.test.tsx
- [X] T066 [P] Add frontend audit correlation checklist for battle start, answer submission, battle result, special field result, capture, level-up, and turn advancement in specs/006-piece-battles-levels/quickstart.md
- [X] T067 [P] Add frontend telemetry validation checklist for battle/special command failures, SignalR reconnect recovery, snapshot-required recovery, stale event rejection, and latency markers in specs/006-piece-battles-levels/quickstart.md
- [X] T068 Review board rendering performance for memoized tiles/pieces and selector subscriptions in src/features/game/GameBoard.tsx and src/stores/gameStore.ts
- [X] T069 Run quickstart validation commands and record any deviations in specs/006-piece-battles-levels/quickstart.md
- [X] T070 Run npm test and fix regressions across gameplay, battle, special field, realtime, and question-bank suites in package.json
- [X] T071 Run npm run build and fix TypeScript/Vite production build issues in package.json
- [X] T072 Run npm audit --audit-level=low and verify no denied, vulnerable, or malware-advised package changes were introduced in package-lock.json

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phases 3-6)**: Depend on Foundational completion.
- **Polish (Phase 7)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 Attack Enemy Pieces (P1)**: Starts after Foundational. MVP scope.
- **US2 Conquer Special Fields (P1)**: Starts after Foundational and can share question controls with US1 after T034.
- **US3 Progress Piece Levels (P2)**: Starts after Foundational but is best validated after US1 or US2 success paths exist.
- **US4 Keep Multiplayer State Synchronized (P2)**: Starts after Foundational and integrates events produced by US1/US2/US3.

### Within Each User Story

- Tests must be written first and fail for the intended reason before implementation.
- Domain/API/store work precedes hooks.
- Hooks and stores precede presentational components.
- SignalR handlers must dispatch through domain/store layers before UI consumes updates.
- Durable board state must update only from backend responses, SignalR events, or refreshed snapshots.

---

## Parallel Opportunities

- Setup tasks T004-T007 can run in parallel.
- Foundational tests T011, T013, T015, T017, T019, T021, and T026 can run in parallel.
- US1 test tasks T028-T032 can run in parallel after foundation.
- US2 test tasks T040-T043 can run in parallel after foundation.
- US3 test tasks T049-T051 can run in parallel after foundation.
- US4 test tasks T056-T058 can run in parallel after foundation.
- Different user stories can be staffed in parallel after Phase 2, with coordination around shared files `src/features/game/GameSessionPage.tsx`, `src/features/game/GameBoard.tsx`, `src/features/game/GameTile.tsx`, `src/stores/gameStore.ts`, and `src/realtime/gameHub.ts`.

## Parallel Example: User Story 1

```bash
Task: "T028 [P] [US1] Add battle action hook tests in src/features/battle/useBattleActions.test.tsx"
Task: "T029 [P] [US1] Add BattleQuestionModal tests in src/features/battle/BattleQuestionModal.test.tsx"
Task: "T030 [P] [US1] Add BattleProgressPanel tests in src/features/battle/BattleProgressPanel.test.tsx"
Task: "T032 [P] [US1] Add Playwright enemy battle journey in src/tests/e2e/battle-enemy-piece.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T040 [P] [US2] Add special field action hook tests in src/features/battle/useSpecialFieldActions.test.tsx"
Task: "T041 [P] [US2] Add special field modal/progress tests in src/features/battle/SpecialFieldQuestionModal.test.tsx"
Task: "T042 [P] [US2] Add special tile rendering tests in src/features/game/GameTile.test.tsx"
Task: "T043 [P] [US2] Add Playwright special field journey in src/tests/e2e/special-field-conquest.spec.ts"
```

## Parallel Example: User Story 4

```bash
Task: "T056 [P] [US4] Add gameHub SignalR event tests in src/realtime/gameHub.test.ts"
Task: "T057 [P] [US4] Add store stale/reconnect tests in src/stores/gameStore.test.ts"
Task: "T058 [P] [US4] Add two-player realtime e2e test in src/tests/e2e/battle-special-realtime.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate battle success/failure independently with unit, integration, and Playwright coverage.

### Incremental Delivery

1. Setup + Foundation creates battle/special contract, mapper, store, and realtime primitives.
2. US1 adds enemy-piece battles as the first playable increment.
3. US2 adds special field conquest while reusing safe question UI and pending attempt rules.
4. US3 adds visible level/capture progression and level-cap behavior.
5. US4 hardens multiplayer synchronization, duplicate/out-of-order event handling, and reconnect recovery.
6. Polish validates accessibility, performance, build, test, and dependency safety.

### Notes

- [P] tasks touch separate files or depend only on completed prerequisites.
- [US1]-[US4] labels map directly to the user stories in spec.md.
- Preserve server-authoritative behavior throughout: no optimistic movement, capture, level-up, ownership, or turn advancement.
- Keep correct answer ids and hidden correctness metadata out of client-facing state before resolution.
