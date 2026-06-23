# Tasks: Lobby Game Setup

**Input**: Design documents from `/specs/008-lobby-game-setup/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)

**Tests**: Required because this feature touches lobby/session behavior, SignalR synchronization, reconnect handling, gameplay setup transfer, and accessibility.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other marked tasks in the same phase when file paths do not overlap
- **[Story]**: User story label from [spec.md](spec.md)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm project boundaries, existing contracts, and test baseline before changing lobby setup behavior.

- [X] T001 Confirm backend solution root containing Modules/, Host/, and Tests/, then inspect current backend lobby, game session, QuestionBank category, and realtime service entry points in Modules/Matchmaking/, Modules/Gameplay/, Modules/QuestionBank/, and Modules/Realtime/
- [X] T002 Inspect current frontend lobby API, lobby domain mapping, lobby store, realtime lobby events, and lobby room components in src/api/lobbyApi.ts, src/domain/lobby/lobbyMappers.ts, src/stores/lobbyStore.ts, src/realtime/lobbyEvents.ts, and src/features/lobby/LobbyRoomPage.tsx
- [X] T003 [P] Capture current backend test command expectations for lobby/game integration in Tests/HostIntegrationTests/ and Tests/Contract/
- [X] T004 [P] Capture current frontend test command expectations for lobby setup work in package.json and src/tests/
- [X] T005 [P] Run dependency security baseline with npm audit and package-lock review for unchanged frontend dependencies in package-lock.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared backend and frontend setup model, contracts, persistence, and test fixtures that all stories depend on.

**Critical**: No user story work should begin until this phase is complete.

- [X] T006 [P] Add backend setup enums and allowed colors in Modules/Matchmaking/Domain/LobbySetupStatus.cs and Modules/Matchmaking/Domain/PieceColor.cs
- [X] T007 Add selected categories, setup status, setup version, updated timestamp, player color, and readiness fields to backend lobby domain models in Modules/Matchmaking/Domain/Lobby.cs and Modules/Matchmaking/Domain/LobbyPlayer.cs
- [X] T008 Add lobby setup recalculation, readiness reset, join-after-ready initialization, host-transfer setup reset, and stale setup version domain methods in Modules/Matchmaking/Domain/Lobby.cs
- [X] T009 [P] Extend backend lobby persistence mapping for setup fields in Modules/Matchmaking/Infrastructure/Persistence/LobbyConfiguration.cs
- [X] T010 [P] Add backend EF migration for lobby setup and lobby player setup fields in Modules/Matchmaking/Infrastructure/Persistence/Migrations/
- [X] T011 [P] Extend game session and game player domain models for selected category snapshot and piece color in Modules/Gameplay/Domain/GameSession.cs and Modules/Gameplay/Domain/GamePlayer.cs
- [X] T012 [P] Extend backend game persistence mapping for selected category snapshot and player color in Modules/Gameplay/Infrastructure/Persistence/GameSessionConfiguration.cs
- [X] T013 [P] Add backend EF migration for game setup snapshot fields in Modules/Gameplay/Infrastructure/Persistence/Migrations/
- [X] T014 [P] Add backend lobby setup request/response DTOs and ensure they are represented in backend OpenAPI output in Modules/Matchmaking/Application/LobbySetupDtos.cs
- [X] T015 Add backend lobby snapshot mapping for setup fields in Modules/Matchmaking/Application/LobbyMapping.cs
- [X] T016 [P] Extend frontend lobby domain types with setup status, setup version, selected category IDs, player color, readiness, and initial game setup handoff in src/domain/lobby/lobbyTypes.ts
- [X] T017 Extend frontend lobby DTO mappers and runtime guards for setup fields in src/domain/lobby/lobbyMappers.ts
- [X] T018 [P] Reconcile generated or manual OpenAPI setup contracts, then extend frontend lobby API contract functions for category, color, and ready setup requests in src/api/lobbyApi.ts
- [X] T019 [P] Extend frontend lobby realtime event contract for setup changed events in src/realtime/lobbyEvents.ts
- [X] T020 [P] Add shared frontend lobby setup test fixtures in src/tests/fixtures/lobbySetupFixtures.ts

**Checkpoint**: Backend and frontend can represent setup state consistently, but no user-facing setup actions are complete yet.

---

## Phase 3: User Story 1 - Host Configures Game Categories (Priority: P1) MVP

**Goal**: Host can select one or more active categories, all lobby members can see them, non-host edits are rejected, and category changes reset readiness.

**Independent Test**: Create an open lobby as host, select active categories, verify every lobby reader sees them, and verify non-host, empty, inactive, duplicate, and missing category selections are rejected.

### Tests for User Story 1

- [X] T021 [P] [US1] Add backend integration tests for host-only category selection, invalid category rejection, and post-start category update rejection in Tests/HostIntegrationTests/Matchmaking/LobbySetupCategoryTests.cs
- [X] T022 [P] [US1] Add backend unit tests for category-change readiness reset in Tests/HostIntegrationTests/Matchmaking/LobbySetupDomainTests.cs
- [X] T023 [P] [US1] Add frontend mapper tests for selectedCategoryIds, setupStatus, setupVersion, and updatedAtUtc in src/domain/lobby/lobbyMappers.test.ts
- [X] T024 [P] [US1] Add frontend API tests for updateLobbyCategories success and error mapping in src/api/lobbyApi.test.ts
- [X] T025 [P] [US1] Add React Testing Library tests for host/non-host category selector behavior in src/features/lobby/LobbyCategorySelector.test.tsx

### Implementation for User Story 1

- [X] T026 [US1] Implement backend category setup validation, post-start category locking, and update service in Modules/Matchmaking/Application/LobbySetupApplicationService.cs
- [X] T027 [US1] Add host category setup endpoint in Modules/Matchmaking/Application/LobbyEndpoints.cs
- [X] T028 [US1] Query and validate active QuestionBank categories from Modules/QuestionBank/Application/ through Modules/Matchmaking/Application/LobbySetupApplicationService.cs
- [X] T029 [US1] Reset all lobby player readiness when selected categories change in Modules/Matchmaking/Application/LobbySetupApplicationService.cs
- [X] T030 [US1] Publish authoritative lobby setup snapshot after category changes from Modules/Realtime/Application/LobbyHub.cs or its delegated lobby notification service
- [X] T031 [US1] Add audit/log entries for category selection changes and failed validation in Modules/Matchmaking/Application/LobbySetupApplicationService.cs
- [X] T032 [US1] Implement frontend updateLobbyCategories wrapper and category validation error normalization in src/api/lobbyApi.ts
- [X] T033 [US1] Extend lobby store with category setup snapshot application and setup live messages in src/stores/lobbyStore.ts
- [X] T034 [US1] Implement host category selector UI with active category loading from src/api/questionBankApi.ts, non-host read-only state, existing src/components/ui primitives, and shared dark-blue lobby styling in src/features/lobby/LobbyCategorySelector.tsx
- [X] T035 [US1] Integrate LobbyCategorySelector into lobby room layout in src/features/lobby/LobbyRoomPage.tsx
- [X] T036 [US1] Add accessible labels, keyboard selection, focus states, and live-region category update messaging in src/features/lobby/LobbyCategorySelector.tsx

**Checkpoint**: User Story 1 is independently testable and provides the MVP category setup flow.

---

## Phase 4: User Story 2 - Players Choose Unique Piece Colors (Priority: P1)

**Goal**: Each joined player can select their own unique allowed color while the lobby is open, and changing color resets only that player's readiness.

**Independent Test**: Join a lobby as two players, select different colors, verify duplicate/invalid colors are rejected, and verify each player can change only their own color before start.

### Tests for User Story 2

- [X] T037 [P] [US2] Add backend integration tests for color selection ownership, allowed colors, duplicate colors, and post-start rejection in Tests/HostIntegrationTests/Matchmaking/LobbySetupColorTests.cs
- [X] T038 [P] [US2] Add backend unit tests for color-change readiness reset in Tests/HostIntegrationTests/Matchmaking/LobbySetupDomainTests.cs
- [X] T039 [P] [US2] Add frontend mapper tests for selectedPieceColor and isReady player fields in src/domain/lobby/lobbyMappers.test.ts
- [X] T040 [P] [US2] Add frontend API tests for selectLobbyPieceColor success, duplicate conflict, and invalid color errors in src/api/lobbyApi.test.ts
- [X] T041 [P] [US2] Add React Testing Library tests for color picker ownership, duplicate disabled state, and non-color-only labels in src/features/lobby/LobbyColorPicker.test.tsx

### Implementation for User Story 2

- [X] T042 [US2] Implement backend color selection validation in Modules/Matchmaking/Application/LobbySetupApplicationService.cs
- [X] T043 [US2] Add current-player color setup endpoint in Modules/Matchmaking/Application/LobbyEndpoints.cs
- [X] T044 [US2] Reset only the selecting player's readiness when their color changes in Modules/Matchmaking/Application/LobbySetupApplicationService.cs
- [X] T045 [US2] Publish authoritative lobby setup snapshot after color changes from Modules/Realtime/Application/LobbyHub.cs or its delegated lobby notification service
- [X] T046 [US2] Add audit/log entries for color selection changes and failed validation in Modules/Matchmaking/Application/LobbySetupApplicationService.cs
- [X] T047 [US2] Implement frontend selectLobbyPieceColor wrapper and color error normalization in src/api/lobbyApi.ts
- [X] T048 [US2] Extend lobby store selectors for allowed colors, used colors, current player color, and duplicate color status in src/stores/lobbyStore.ts
- [X] T049 [US2] Implement accessible color picker with swatches, text labels, existing src/components/ui primitives, and shared dark-blue lobby styling in src/features/lobby/LobbyColorPicker.tsx
- [X] T050 [US2] Show selected colors and readiness state in the player list without relying on color alone in src/features/lobby/LobbyPlayerList.tsx

**Checkpoint**: User Story 2 is independently testable and player colors are server-authoritative in the lobby.

---

## Phase 5: User Story 3 - Players Mark Readiness and Host Starts (Priority: P1)

**Goal**: Players can mark ready only after valid setup, host is also required to be ready, stale ready/start actions are rejected, and game start is blocked until all setup requirements pass.

**Independent Test**: Configure categories, have all players choose colors and ready up, then start the game; repeat with each missing requirement and with stale setup version to verify rejection and reconciliation.

### Tests for User Story 3

- [X] T051 [P] [US3] Add backend integration tests for ready validation, host readiness requirement, player count, expired lobby, inactive category, stale setup version, join-after-ready preservation, and host-transfer readiness reset in Tests/HostIntegrationTests/Matchmaking/LobbySetupReadyTests.cs
- [X] T052 [P] [US3] Add backend integration tests for configured start validation and stale start rejection in Tests/HostIntegrationTests/Matchmaking/LobbySetupStartTests.cs
- [X] T053 [P] [US3] Add frontend API tests for setLobbyReady and setupVersion start request handling in src/api/lobbyApi.test.ts
- [X] T054 [P] [US3] Add lobby store selector tests for setup start-disabled reasons and stale reconcile messages in src/stores/lobbyStore.test.ts
- [X] T055 [P] [US3] Add React Testing Library tests for ready toggle, host start button gating, and stale setup message in src/features/lobby/LobbySetupActions.test.tsx

### Implementation for User Story 3

- [X] T056 [US3] Implement backend ready-state validation, join-after-ready recalculation, and setupStatus recalculation in Modules/Matchmaking/Application/LobbySetupApplicationService.cs
- [X] T057 [US3] Add current-player ready setup endpoint in Modules/Matchmaking/Application/LobbyEndpoints.cs
- [X] T058 [US3] Extend backend start lobby validation to require setup readiness and current setup version in Modules/Matchmaking/Application/LobbyApplicationService.cs
- [X] T059 [US3] Revalidate selected categories are active immediately before start in Modules/Matchmaking/Application/LobbyApplicationService.cs
- [X] T060 [US3] Publish authoritative setup snapshots after ready changes and failed stale start reconciliation in Modules/Realtime/Application/LobbyHub.cs or its delegated lobby notification service
- [X] T061 [US3] Add audit/log entries for readiness changes, failed readiness validation, failed start validation, and setup snapshots at start in Modules/Matchmaking/Application/LobbySetupApplicationService.cs
- [X] T062 [US3] Implement frontend setLobbyReady wrapper and startLobby setupVersion request body in src/api/lobbyApi.ts
- [X] T063 [US3] Extend selectStartDisabledReason to include categories, unique colors, readiness, host readiness, setup status, and stale setup constraints in src/stores/lobbyStore.ts
- [X] T064 [US3] Implement ready toggle and setup-aware start controls using existing src/components/ui primitives and shared dark-blue lobby styling in src/features/lobby/LobbySetupActions.tsx
- [X] T065 [US3] Integrate LobbySetupActions with existing LobbyActions without duplicating start requests in src/features/lobby/LobbyActions.tsx
- [X] T066 [US3] Implement stale setup error handling with automatic getLobby reconciliation in src/features/lobby/useLobbyActions.ts

**Checkpoint**: User Stories 1 to 3 provide the complete configured lobby start flow.

---

## Phase 6: User Story 4 - Setup Transfers Into Gameplay (Priority: P2)

**Goal**: A started game stores selected category snapshots and player colors, board/category generation uses only selected categories, and later category changes do not affect the active game.

**Independent Test**: Start a configured lobby, inspect the game session, verify selected categories and player colors are present, and verify later QuestionBank category changes do not alter the active session.

### Tests for User Story 4

- [X] T067 [P] [US4] Add backend integration tests for game session selected category snapshot and player color transfer in Tests/HostIntegrationTests/Gameplay/LobbySetupGameStartTests.cs
- [X] T068 [P] [US4] Add backend integration tests that board generation uses only selected category snapshot in Tests/HostIntegrationTests/Gameplay/LobbySetupBoardGenerationTests.cs
- [X] T069 [P] [US4] Add frontend game mapper tests for selectedCategoryIds and player pieceColor fields in src/domain/game/gameMappers.test.ts
- [X] T070 [P] [US4] Add React Testing Library tests for configured player colors on the game board/player panel in src/features/game/GameBoard.test.tsx

### Implementation for User Story 4

- [X] T071 [US4] Transfer selected category snapshot and player colors from lobby to game session creation in Modules/Gameplay/Application/GameplayApplicationService.cs
- [X] T072 [US4] Persist game selected category snapshot and game player colors through repository updates in Modules/Gameplay/Infrastructure/Persistence/GameSessionRepository.cs
- [X] T073 [US4] Restrict board/question category assignment to game session selectedCategoryIds in Modules/Gameplay/Application/GameplayApplicationService.cs
- [X] T074 [US4] Extend backend game session DTO mapping with selectedCategoryIds and player pieceColor in Modules/Gameplay/Application/GameplayDtos.cs
- [X] T075 [US4] Extend frontend game domain types and mappers for selectedCategoryIds and player pieceColor in src/domain/game/gameTypes.ts and src/domain/game/gameMappers.ts
- [X] T076 [US4] Render configured piece colors in gameplay board/player UI while preserving non-color-only indicators in src/features/game/GameBoard.tsx

**Checkpoint**: Game sessions created from configured lobbies retain setup data independently of later lobby or QuestionBank changes.

---

## Phase 7: User Story 5 - Realtime Setup Visibility (Priority: P2)

**Goal**: Connected lobby members see setup changes within 2 seconds, reconnecting clients reconcile from authoritative snapshots, and missed or malformed events do not leave stale setup state.

**Independent Test**: Open the same lobby in two authenticated browser sessions, change categories/color/readiness in one session, verify the other updates without refresh, then reconnect and verify snapshot reconciliation.

### Tests for User Story 5

- [X] T077 [P] [US5] Add backend SignalR integration tests for LobbySetupChanged broadcasts after categories, colors, readiness, host transfer, join, and leave in Tests/HostIntegrationTests/Realtime/LobbySetupRealtimeTests.cs
- [X] T078 [P] [US5] Add frontend realtime event mapping tests for LobbySetupChanged and extended LobbyStartedEvent in src/realtime/lobbyEvents.test.ts
- [X] T079 [P] [US5] Add frontend lobby hub handler tests for setup snapshot application and malformed event fallback in src/realtime/lobbyHub.test.ts
- [X] T080 [P] [US5] Add Playwright two-client lobby setup realtime happy path with a within-2-seconds update assertion in src/tests/e2e/lobby-game-setup.spec.ts
- [X] T081 [P] [US5] Add Playwright reconnect reconciliation scenario in src/tests/e2e/lobby-game-setup-reconnect.spec.ts

### Implementation for User Story 5

- [X] T082 [US5] Add typed backend lobby setup notification contract and broadcaster in Modules/Realtime/Application/LobbySetupNotifications.cs
- [X] T083 [US5] Keep LobbyHub thin by delegating setup group broadcasts to application notification services in Modules/Realtime/Application/LobbyHub.cs
- [X] T084 [US5] Extend frontend lobby event names, type guards, and mappers for LobbySetupChanged and extended LobbyStartedEvent in src/realtime/lobbyEvents.ts
- [X] T085 [US5] Register setup event handlers and malformed-event fallback refetch behavior in src/realtime/lobbyHub.ts
- [X] T086 [US5] Apply setup snapshots atomically and update live messages for category, color, readiness, join, leave, and host transfer reasons in src/stores/lobbyStore.ts
- [X] T087 [US5] Disable setup controls until reconnect snapshot reconciliation completes in src/features/lobby/LobbyRoomPage.tsx
- [X] T088 [US5] Ensure host transfer preserves categories/colors and resets readiness in backend leave/host-transfer flow in Modules/Matchmaking/Application/LobbyApplicationService.cs

**Checkpoint**: Realtime and reconnect behavior keep all lobby setup clients aligned without manual refresh.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility, documentation, and regression cleanup across all stories.

- [X] T089 [P] Update feature validation notes with final commands and outcomes in specs/008-lobby-game-setup/quickstart.md
- [X] T090 [P] Add or update API contract documentation after backend DTO names settle in specs/008-lobby-game-setup/contracts/lobby-game-setup.openapi.yaml
- [X] T091 [P] Run frontend unit/integration tests for lobby setup files and fix failures in src/domain/lobby/, src/api/lobbyApi.test.ts, src/stores/lobbyStore.test.ts, src/realtime/, and src/features/lobby/
- [X] T092 [P] Run frontend Playwright lobby setup scenarios and fix failures in src/tests/e2e/lobby-game-setup.spec.ts and src/tests/e2e/lobby-game-setup-reconnect.spec.ts
- [X] T093 Run backend host integration tests for matchmaking, gameplay, and realtime setup coverage and fix failures in Tests/HostIntegrationTests/
- [X] T094 Review keyboard access, focus states, live-region announcements, and non-color-only setup indicators in src/features/lobby/
- [X] T095 Review package-lock and npm audit output to confirm no new vulnerable or denied dependency scope in package-lock.json
- [X] T096 Review logging output to ensure setup audit entries do not include sensitive token values in Modules/Matchmaking/Application/LobbySetupApplicationService.cs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2 and is the MVP.
- **Phase 4 US2**: Depends on Phase 2; can run in parallel with US1 after shared lobby setup model exists.
- **Phase 5 US3**: Depends on US1 and US2 because readiness/start requires categories and colors.
- **Phase 6 US4**: Depends on US3 because transfer happens during configured start.
- **Phase 7 US5**: Depends on Phase 2; final reconnect/start coverage depends on US1-US3 event sources.
- **Phase 8 Polish**: Depends on desired story phases being complete.

### User Story Dependencies

- **US1 Host Configures Game Categories**: MVP after foundational setup.
- **US2 Players Choose Unique Piece Colors**: Can be implemented after foundational setup and tested independently with joined players.
- **US3 Players Mark Readiness and Host Starts**: Requires category and color behavior from US1 and US2.
- **US4 Setup Transfers Into Gameplay**: Requires configured start from US3.
- **US5 Realtime Setup Visibility**: Can begin after foundational realtime contracts, then integrates with each setup action.

### Parallel Opportunities

- T003-T005 can run in parallel during setup.
- T006, T009-T014, T016, T018-T020 can run in parallel after T001-T002.
- Test tasks within each user story are parallel where marked [P].
- US1 backend tasks T026-T031 and frontend tasks T032-T036 can be split after shared contracts are in place.
- US2 backend tasks T042-T046 and frontend tasks T047-T050 can be split after shared contracts are in place.
- US5 tests T077-T081 can be prepared in parallel before final realtime implementation.

---

## Parallel Example: User Story 1

```text
Task: "T021 Add backend integration tests for host-only category selection in Tests/HostIntegrationTests/Matchmaking/LobbySetupCategoryTests.cs"
Task: "T023 Add frontend mapper tests for selectedCategoryIds in src/domain/lobby/lobbyMappers.test.ts"
Task: "T024 Add frontend API tests for updateLobbyCategories in src/api/lobbyApi.test.ts"
Task: "T025 Add component tests for LobbyCategorySelector in src/features/lobby/LobbyCategorySelector.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "T037 Add backend integration tests for color selection in Tests/HostIntegrationTests/Matchmaking/LobbySetupColorTests.cs"
Task: "T039 Add frontend mapper tests for player setup fields in src/domain/lobby/lobbyMappers.test.ts"
Task: "T041 Add component tests for LobbyColorPicker in src/features/lobby/LobbyColorPicker.test.tsx"
```

## Parallel Example: User Story 5

```text
Task: "T077 Add backend SignalR integration tests in Tests/HostIntegrationTests/Realtime/LobbySetupRealtimeTests.cs"
Task: "T078 Add frontend realtime mapping tests in src/realtime/lobbyEvents.test.ts"
Task: "T080 Add Playwright two-client realtime happy path in src/tests/e2e/lobby-game-setup.spec.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1 category setup).
3. Validate host category selection, non-host rejection, invalid category rejection, readiness reset, and snapshot broadcast.
4. Demo category setup in the lobby before adding color and readiness flows.

### Incremental Delivery

1. Deliver US1 category setup.
2. Add US2 color setup.
3. Add US3 readiness and configured start.
4. Add US4 gameplay transfer.
5. Add US5 realtime/reconnect hardening.

### Test-First Guidance

- Write the test tasks in each story before implementation tasks in that story.
- Backend tests should fail on missing fields/endpoints/validation before implementation.
- Frontend mapper/store/component tests should fail on missing typed fields and UI behavior before implementation.
- Playwright realtime tests may be added once the UI skeleton exists, then completed when backend events are available.

### Notes

- Keep SignalR hubs thin; delegate to application services.
- Do not let frontend components consume raw backend DTOs.
- Do not optimistically commit setup state; reconcile from REST responses or SignalR snapshots.
- Preserve existing lobby/game behavior outside this feature's setup flow.
