# Tasks: Logout and Active Game Forfeit Handling

**Input**: Design documents from `/specs/007-logout-forfeit/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are REQUIRED because this feature touches authentication, session state, gameplay, SignalR, reconnect/synchronization, protected routing, accessibility, and board/game UI state.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US8)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare contracts, test fixtures, and cross-project references before behavior work.

- [X] T001 Verify backend project paths and test projects referenced by `specs/007-logout-forfeit/plan.md`
- [ ] T002 [P] Add logout/forfeit REST planning contract references to backend contract test fixtures in `../Tests/Contract/Identity/LogoutContractTests.cs`
- [ ] T003 [P] Add logout/forfeit MSW response fixtures in `src/tests/fixtures/logoutFixtures.ts`
- [ ] T004 [P] Add logout/forfeit MSW handlers in `src/tests/handlers/identityHandlers.ts`
- [ ] T005 [P] Add realtime forfeit event fixtures in `src/tests/fixtures/gameFixtures.ts`
- [ ] T006 Review `package-lock.json` and document that no new frontend runtime dependency is required in `specs/007-logout-forfeit/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared backend/frontend contracts and domain state required by all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 [P] Add identity logout DTOs in `../Contracts/Identity/LogoutContracts.cs`
- [X] T008 [P] Add logout audit DTOs or read models in `../Contracts/Identity/LogoutAuditContracts.cs`
- [X] T009 [P] Add gameplay elimination and forfeit DTO fields in `../Contracts/Gameplay/GameSessionDto.cs`
- [X] T010 [P] Add realtime forfeit/cancel/completed event records in `../Contracts/Realtime/GameForfeitEvents.cs`
- [X] T011 Add `jti` or equivalent current-session identifier generation to `../Modules/Identity/Application/JwtTokenService.cs`
- [X] T012 Add token/session revocation entity in `../Modules/Identity/Domain/RevokedUserSession.cs`
- [X] T013 Add token/session revocation EF configuration in `../Modules/Identity/Infrastructure/Persistence/RevokedUserSessionConfiguration.cs`
- [X] T014 Register revoked-session persistence in `../Host/Infrastructure/Persistence/ApplicationDbContext.cs`
- [X] T015 Add EF migration for revoked sessions and gameplay elimination fields in `../Host/Infrastructure/Persistence/Migrations/`
- [X] T016 Add `EliminatedAtUtc` and `EliminationReason` to `../Modules/Gameplay/Domain/GamePlayer.cs`
- [X] T017 Add `GamePlayerEliminationReason` enum in `../Modules/Gameplay/Domain/GamePlayerEliminationReason.cs`
- [X] T018 Update `GamePlayerConfiguration` persistence mapping in `../Modules/Gameplay/Infrastructure/Persistence/GamePlayerConfiguration.cs`
- [X] T019 Add cancelled status metadata for gameplay attempts in `../Modules/Gameplay/Domain/GameplayAttemptStatus.cs`
- [X] T020 Add cancelled status metadata for question attempts in `../Modules/Gameplay/Domain/QuestionAttemptStatus.cs`
- [X] T021 Update question attempt persistence mapping for cancelled status in `../Modules/Gameplay/Infrastructure/Persistence/QuestionAttemptConfiguration.cs`
- [X] T022 Add frontend logout DTO/domain types in `src/domain/auth.ts`
- [X] T023 Add frontend game elimination fields to `src/domain/game/gameTypes.ts`
- [X] T024 Add frontend realtime forfeit event types in `src/realtime/gameEvents.ts`
- [X] T025 Add frontend logout API wrapper skeleton in `src/api/identityApi.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Logout Safely Outside Gameplay (Priority: P1) MVP

**Goal**: Authenticated users can explicitly log out outside lobby/game, current session/token is invalidated, and disconnect/refresh does not count as logout.

**Independent Test**: Login, call logout, verify the same token no longer works, and verify browser refresh or SignalR disconnect does not create logout/forfeit records.

### Tests for User Story 1

- [ ] T026 [P] [US1] Add unit tests for token identifier and revocation checks in `../Tests/Unit/Identity/JwtTokenServiceTests.cs`
- [ ] T027 [P] [US1] Add host integration tests for `POST /api/identity/logout` outside lobby/game in `../Tests/HostIntegrationTests/Identity/LogoutEndpointTests.cs`
- [ ] T028 [P] [US1] Add host integration test proving revoked token is rejected for protected requests in `../Tests/HostIntegrationTests/Identity/LogoutEndpointTests.cs`
- [ ] T029 [P] [US1] Add hub disconnect regression test proving no logout/forfeit on disconnect in `../Tests/HostIntegrationTests/Realtime/DisconnectDoesNotLogoutTests.cs`

### Implementation for User Story 1

- [X] T030 [US1] Implement revoked-session repository interface in `../Modules/Identity/Application/IRevokedUserSessionRepository.cs`
- [X] T031 [US1] Implement revoked-session repository in `../Modules/Identity/Infrastructure/Persistence/RevokedUserSessionRepository.cs`
- [X] T032 [US1] Implement logout command handler in `../Modules/Identity/Application/Commands/LogoutUserCommandHandler.cs`
- [X] T033 [US1] Add current-token revocation validation to authentication setup in `../Modules/Identity/Application/IdentityModuleExtensions.cs`
- [X] T034 [US1] Map `POST /api/identity/logout` endpoint in `../Modules/Identity/Application/IdentityEndpoints.cs`
- [ ] T035 [US1] Add identity logging without token values in `../Modules/Identity/Application/IdentityLogging.cs`
- [ ] T036 [US1] Ensure `GameHub.OnDisconnectedAsync` and `LobbyHub.OnDisconnectedAsync` do not invoke logout/forfeit behavior in `../Modules/Realtime/Application/GameHub.cs` and `../Modules/Realtime/Application/LobbyHub.cs`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Use Logout From the Application (Priority: P1)

**Goal**: Users can trigger logout from protected frontend areas, see pending/retry states, clear local auth state, and avoid duplicate submissions.

**Independent Test**: Sign in from protected screens, choose logout, verify pending state, local state cleanup, protected-route removal, already-invalid handling, and recoverable failure behavior.

### Tests for User Story 2

- [ ] T037 [P] [US2] Add identity API logout tests in `src/api/identityApi.test.ts`
- [ ] T038 [P] [US2] Add auth store logout lifecycle tests in `src/stores/authStore.test.ts`
- [ ] T039 [P] [US2] Add logout hook tests in `src/features/auth/useLogout.test.tsx`
- [ ] T040 [P] [US2] Add accessible logout control tests in `src/features/auth/LogoutButton.test.tsx`
- [ ] T041 [P] [US2] Add protected-route logout e2e coverage in `src/tests/e2e/auth-route-boundaries.spec.ts`

### Implementation for User Story 2

- [X] T042 [US2] Implement `logout` API wrapper and error normalization in `src/api/identityApi.ts`
- [X] T043 [US2] Extend auth store with pending logout status and duplicate-submit guard in `src/stores/authStore.ts`
- [X] T044 [US2] Implement logout feature hook in `src/features/auth/useLogout.ts`
- [X] T045 [US2] Implement accessible logout button in `src/features/auth/LogoutButton.tsx`
- [ ] T046 [US2] Add logout control to protected app navigation or shell in `src/App.tsx`
- [ ] T047 [US2] Clear game, lobby, conquest, and battle local state after logout in `src/stores/authStore.ts`
- [ ] T048 [US2] Stop or ignore active realtime connections after logout in `src/realtime/gameHub.ts` and `src/realtime/lobbyHub.ts`
- [ ] T049 [US2] Add retryable logout error UI using existing toast/modal patterns in `src/components/ToastProvider.tsx`

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Leave Lobby on Logout (Priority: P1)

**Goal**: Lobby-only logout removes the user from the lobby, applies existing host transfer/close rules, and notifies remaining lobby members.

**Independent Test**: Create/join lobby, logout non-host and host, verify member removal, host transfer or close, and realtime lobby update.

### Tests for User Story 3

- [ ] T050 [P] [US3] Add matchmaking service tests for non-host logout removal in `../Tests/Unit/Matchmaking/LobbyLogoutTests.cs`
- [ ] T051 [P] [US3] Add matchmaking service tests for host transfer/close on logout in `../Tests/Unit/Matchmaking/LobbyLogoutTests.cs`
- [ ] T052 [P] [US3] Add host integration tests for lobby logout outcomes in `../Tests/HostIntegrationTests/Matchmaking/LobbyLogoutEndpointTests.cs`
- [ ] T053 [P] [US3] Add frontend lobby realtime logout tests in `src/realtime/lobbyEvents.test.ts`

### Implementation for User Story 3

- [ ] T054 [US3] Add logout lobby accessor interface in `../Modules/Identity/Application/ILogoutLobbyAccessor.cs`
- [ ] T055 [US3] Implement matchmaking logout cleanup adapter in `../Modules/Matchmaking/Application/LogoutLobbyAccessor.cs`
- [ ] T056 [US3] Reuse existing host-transfer/close rules for logout cleanup in `../Modules/Matchmaking/Application/MatchmakingApplicationService.cs`
- [ ] T057 [US3] Publish lobby updated event after logout cleanup in `../Modules/Matchmaking/Application/MatchmakingRealtimeContracts.cs`
- [ ] T058 [US3] Include lobby outcome in logout response from `../Modules/Identity/Application/Commands/LogoutUserCommandHandler.cs`
- [ ] T059 [US3] Handle logout lobby updates in `src/realtime/lobbyEvents.ts`
- [ ] T060 [US3] Reconcile lobby store after logout update in `src/stores/lobbyStore.ts`

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: User Story 4 - Forfeit Active Two-Player Game (Priority: P1)

**Goal**: Logout in an active two-player game eliminates the logging-out player, disables/removes pieces, completes the game, and sets the remaining player as winner.

**Independent Test**: Start 2-player game, logout one player, verify elimination reason, loss/win, completed status, ended time, no further actions by forfeiting player.

### Tests for User Story 4

- [ ] T061 [P] [US4] Add gameplay domain tests for two-player forfeit completion in `../Tests/Unit/Gameplay/GameSessionForfeitTests.cs`
- [ ] T062 [P] [US4] Add gameplay service tests for forfeiting player action rejection in `../Tests/Unit/Gameplay/GameplayLogoutForfeitServiceTests.cs`
- [ ] T063 [P] [US4] Add host integration test for logout completing 2-player game in `../Tests/HostIntegrationTests/Gameplay/LogoutForfeitTests.cs`
- [ ] T064 [P] [US4] Add frontend active-game confirmation tests in `src/features/auth/LogoutButton.test.tsx`
- [ ] T065 [P] [US4] Add host integration test proving a player eliminated by logout forfeit receives forbidden access for `GET /api/game-sessions/{gameSessionId}` in `../Tests/HostIntegrationTests/Gameplay/LogoutForfeitAccessTests.cs`
- [ ] T066 [P] [US4] Add host integration test proving a player eliminated by logout forfeit cannot subscribe to the forfeited game in `../Tests/HostIntegrationTests/Realtime/LogoutForfeitAccessTests.cs`

### Implementation for User Story 4

- [X] T067 [US4] Add `ForfeitByLogout` behavior to `../Modules/Gameplay/Domain/GameSession.cs`
- [ ] T068 [US4] Add piece disable/remove behavior for forfeited players in `../Modules/Gameplay/Domain/Piece.cs`
- [X] T069 [US4] Implement gameplay logout forfeit service in `../Modules/Gameplay/Application/GameplayLogoutForfeitService.cs`
- [X] T070 [US4] Reject gameplay actions from eliminated players in `../Modules/Gameplay/Application/GameplayApplicationService.cs`
- [X] T071 [US4] Reject conquest actions from eliminated players in `../Modules/Gameplay/Application/GameplayConquestApplicationService.cs`
- [X] T072 [US4] Reject battle/special actions from eliminated players in `../Modules/Gameplay/Application/GameplayBattleSpecialApplicationService.cs`
- [X] T073 [US4] Connect logout command handler to gameplay forfeit service in `../Modules/Identity/Application/Commands/LogoutUserCommandHandler.cs`
- [X] T074 [US4] Add active-game logout confirmation UI in `src/features/auth/LogoutButton.tsx`
- [X] T075 [US4] Reject forfeited-player game reads in `../Modules/Gameplay/Application/GameplayApplicationService.cs`
- [X] T076 [US4] Reject forfeited-player realtime subscriptions in `../Modules/Gameplay/Application/GameplayApplicationService.cs`

**Checkpoint**: User Story 4 is independently functional and testable.

---

## Phase 7: User Story 5 - Continue Multiplayer Game After Forfeit (Priority: P2)

**Goal**: Logout in a 3-4 player game eliminates only the forfeiting player, skips them in turn order, and completes only when one non-eliminated player remains.

**Independent Test**: Start 3-4 player game, logout one player, verify continuation; logout until one non-eliminated remains and verify winner.

### Tests for User Story 5

- [ ] T077 [P] [US5] Add gameplay domain tests for 3-4 player turn skip in `../Tests/Unit/Gameplay/GameSessionForfeitTests.cs`
- [ ] T078 [P] [US5] Add gameplay service tests for already-eliminated-player winner counting in `../Tests/Unit/Gameplay/GameplayLogoutForfeitServiceTests.cs`
- [ ] T079 [P] [US5] Add host integration test for multiplayer continuation after logout in `../Tests/HostIntegrationTests/Gameplay/LogoutForfeitTests.cs`

### Implementation for User Story 5

- [X] T080 [US5] Update `AdvanceTurn` eligibility to use non-eliminated players after forfeit in `../Modules/Gameplay/Domain/GameSession.cs`
- [X] T081 [US5] Add multiplayer completion calculation after logout forfeit in `../Modules/Gameplay/Application/GameplayLogoutForfeitService.cs`
- [X] T082 [US5] Include `nextTurnPlayerId`, `winnerPlayerId`, and completion data in logout response mapping in `../Modules/Identity/Application/Commands/LogoutUserCommandHandler.cs`
- [X] T083 [US5] Update game response mapper with elimination fields in `../Modules/Gameplay/Application/GameplayResponseMapper.cs`

**Checkpoint**: User Story 5 is independently functional and testable.

---

## Phase 8: User Story 6 - Cancel Pending Attempt on Forfeit (Priority: P2)

**Goal**: Logout cancels pending conquest, battle, or special-field attempts without board mutation and without failed-answer/gameplay consequences.

**Independent Test**: Start each pending attempt type, logout before resolution, verify attempt cancellation and unchanged board/capture/level/ownership state.

### Tests for User Story 6

- [ ] T084 [P] [US6] Add conquest pending cancellation tests in `../Tests/Unit/Gameplay/LogoutPendingAttemptCancellationTests.cs`
- [ ] T085 [P] [US6] Add battle pending cancellation tests in `../Tests/Unit/Gameplay/LogoutPendingAttemptCancellationTests.cs`
- [ ] T086 [P] [US6] Add special-field pending cancellation tests in `../Tests/Unit/Gameplay/LogoutPendingAttemptCancellationTests.cs`
- [ ] T087 [P] [US6] Add host integration test for board unchanged after pending cancellation in `../Tests/HostIntegrationTests/Gameplay/LogoutPendingAttemptCancellationTests.cs`
- [ ] T088 [P] [US6] Add unit test proving logout-cancelled question attempts do not count as failed answers in `../Tests/Unit/Gameplay/LogoutPendingAttemptCancellationTests.cs`
- [ ] T089 [P] [US6] Add host integration test proving logout-cancelled pending attempts do not increment failed gameplay outcomes in `../Tests/HostIntegrationTests/Gameplay/LogoutPendingAttemptCancellationTests.cs`

### Implementation for User Story 6

- [X] T090 [US6] Add cancellation methods to `../Modules/Gameplay/Domain/QuestionAttempt.cs`
- [X] T091 [US6] Add cancellation methods to `../Modules/Gameplay/Domain/BattleAttempt.cs`
- [X] T092 [US6] Add cancellation methods to `../Modules/Gameplay/Domain/SpecialFieldAttempt.cs`
- [X] T093 [US6] Cancel pending attempts before final forfeit in `../Modules/Gameplay/Application/GameplayLogoutForfeitService.cs`
- [X] T094 [US6] Ensure cancelled attempts do not count as failed answers in `../Modules/Gameplay/Application/GameplayConquestApplicationService.cs`
- [X] T095 [US6] Ensure cancelled battle/special attempts do not mutate board state in `../Modules/Gameplay/Application/GameplayBattleSpecialApplicationService.cs`
- [X] T096 [US6] Include cancelled attempt outcome in logout audit mapping in `../Modules/Identity/Application/Commands/LogoutUserCommandHandler.cs`

**Checkpoint**: User Story 6 is independently functional and testable.

---

## Phase 9: User Story 7 - See Forfeit Outcomes in the Application (Priority: P2)

**Goal**: Remaining players see forfeited status, board/action changes, turn advancement, and completed-game outcome without manual refresh.

**Independent Test**: Open game in two sessions, logout one player, verify remaining player's board, player panel, turn indicator, actions, and winner/completed state update automatically.

### Tests for User Story 7

- [ ] T097 [P] [US7] Add game realtime event parser tests for forfeit events in `src/realtime/gameEvents.test.ts`
- [ ] T098 [P] [US7] Add game store forfeit reconciliation tests in `src/stores/gameStore.test.ts`
- [ ] T099 [P] [US7] Add player panel forfeited state tests in `src/features/game/GamePlayerPanel.test.tsx`
- [ ] T100 [P] [US7] Add game board disabled/removed piece tests in `src/features/game/GameBoard.test.tsx`
- [ ] T101 [P] [US7] Add Playwright realtime forfeit flow in `src/tests/e2e/game-realtime.spec.ts`
- [ ] T102 [P] [US7] Add game store missed-event snapshot reconciliation tests in `src/stores/gameStore.test.ts`
- [ ] T103 [P] [US7] Add Playwright reconnect snapshot reconciliation flow after logout forfeit in `src/tests/e2e/game-realtime.spec.ts`

### Implementation for User Story 7

- [X] T104 [US7] Publish `PlayerForfeited`, `PendingAttemptCancelled`, turn, and completion realtime events in `../Modules/Gameplay/Application/GameplayRealtimeContracts.cs`
- [X] T105 [US7] Implement realtime publisher methods in `../Modules/Realtime/Infrastructure/RealtimeGameplayPublisher.cs`
- [X] T106 [US7] Register frontend forfeit event handlers in `src/realtime/gameHub.ts`
- [X] T107 [US7] Map forfeit events into frontend game domain models in `src/domain/game/gameMappers.ts`
- [ ] T108 [US7] Apply forfeit, cancelled attempt, turn, and completion events in `src/stores/gameStore.ts`
- [ ] T109 [US7] Render forfeited player state in `src/features/game/GamePlayerPanel.tsx`
- [ ] T110 [US7] Disable completed/eliminated-player gameplay actions in `src/features/game/GameSessionPage.tsx`
- [ ] T111 [US7] Clear stale pending question/attempt UI after forfeit in `src/stores/conquestStore.ts` and `src/stores/battleStore.ts`
- [ ] T112 [US7] Implement authoritative snapshot reconciliation after missed or delayed logout-forfeit events in `src/stores/gameStore.ts`
- [ ] T113 [US7] Render blocked forfeited-session access message in `src/features/game/GameSessionPage.tsx`

**Checkpoint**: User Story 7 is independently functional and testable.

---

## Phase 10: User Story 8 - Notify and Audit Logout Outcomes (Priority: P2)

**Goal**: Logout, forfeit, turn, game completion, lobby updates, and audit records are emitted and recorded reliably.

**Independent Test**: Logout from each participation state and verify realtime notifications, audit records, and ranking/scoring trigger where existing ranking exists.

### Tests for User Story 8

- [ ] T114 [P] [US8] Add audit record tests for no lobby/game logout in `../Tests/Unit/Identity/LogoutAuditTests.cs`
- [ ] T115 [P] [US8] Add audit record tests for lobby and game logout outcomes in `../Tests/Unit/Identity/LogoutAuditTests.cs`
- [ ] T116 [P] [US8] Add realtime publisher tests for logout events in `../Tests/Unit/Realtime/LogoutRealtimePublisherTests.cs`
- [ ] T117 [P] [US8] Add host integration test for duplicate logout idempotency in `../Tests/HostIntegrationTests/Identity/LogoutEndpointTests.cs`

### Implementation for User Story 8

- [ ] T118 [US8] Add logout audit entity in `../Modules/Identity/Domain/LogoutAuditRecord.cs`
- [ ] T119 [US8] Add logout audit persistence configuration in `../Modules/Identity/Infrastructure/Persistence/LogoutAuditRecordConfiguration.cs`
- [ ] T120 [US8] Persist audit records from logout handler in `../Modules/Identity/Application/Commands/LogoutUserCommandHandler.cs`
- [ ] T121 [US8] Add idempotency guard for duplicate logout requests in `../Modules/Identity/Application/Commands/LogoutUserCommandHandler.cs`
- [ ] T122 [US8] Publish lobby/game logout outcome events after transaction success in `../Modules/Identity/Application/Commands/LogoutUserCommandHandler.cs`
- [ ] T123 [US8] Trigger existing ranking/scoring completion behavior if present in `../Modules/Gameplay/Application/GameplayLogoutForfeitService.cs`
- [ ] T124 [US8] Add safe structured logging for logout/forfeit outcomes in `../Modules/Identity/Application/IdentityLogging.cs` and `../Modules/Gameplay/Application/GameplayLogging.cs`

**Checkpoint**: User Story 8 is independently functional and testable.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validate contracts, docs, accessibility, performance, and full quickstart.

- [ ] T125 [P] Verify generated backend OpenAPI includes logout-forfeit contracts or document manual reconciliation in `specs/007-logout-forfeit/contracts/logout-forfeit.openapi.yaml`
- [ ] T126 [P] Update realtime contract alignment notes in `specs/007-logout-forfeit/contracts/realtime-events.md`
- [ ] T127 [P] Add or update frontend blocked forfeited-session route handling test in `src/features/game/GameSessionPage.test.tsx`
- [ ] T128 [P] Add accessibility review tests for logout confirmation focus/live regions in `src/features/auth/LogoutButton.test.tsx`
- [X] T129 Run backend build command from `specs/007-logout-forfeit/quickstart.md`
- [ ] T130 Run backend unit and host integration tests from `specs/007-logout-forfeit/quickstart.md`
- [X] T131 Run frontend `npm test` from `specs/007-logout-forfeit/quickstart.md`
- [ ] T132 Run focused Playwright flows from `specs/007-logout-forfeit/quickstart.md`
- [ ] T133 Review package-lock and npm audit output for no new vulnerable or denied frontend packages in `package-lock.json`
- [ ] T134 Update `specs/007-logout-forfeit/quickstart.md` with any final validated command changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundation; MVP backend logout/session invalidation.
- **US2 (P1)**: Starts after Foundation; can run parallel with US1 but full validation needs US1 endpoint behavior.
- **US3 (P1)**: Depends on US1 logout orchestration and Foundation lobby contracts.
- **US4 (P1)**: Depends on US1 logout orchestration and Foundation gameplay elimination fields.
- **US5 (P2)**: Depends on US4 for base forfeit behavior.
- **US6 (P2)**: Depends on US4 for forfeit service and attempt lookup.
- **US7 (P2)**: Depends on US4/US5/US6 backend outcome events and frontend game domain fields.
- **US8 (P2)**: Depends on US1 plus story-specific outcomes from US3-US7.

### Within Each User Story

- Write tests first and confirm they fail for the intended missing behavior.
- Backend domain/entity changes before application services.
- Application services before endpoint and realtime publication wiring.
- Frontend DTO/domain mapping before stores/hooks.
- Stores/hooks before UI components consume the state.
- Realtime contract updates before frontend event handlers consume events.

---

## Parallel Opportunities

- T002-T006 can run in parallel after T001.
- T007-T010 and T022-T025 can run in parallel during Foundation.
- Backend persistence tasks T012-T015 should run sequentially.
- US1 tests T026-T029 can run in parallel.
- US2 tests T037-T041 can run in parallel.
- US3 tests T050-T053 can run in parallel.
- US4 tests T061-T066 can run in parallel.
- US5 tests T077-T079 can run in parallel.
- US6 tests T084-T089 can run in parallel.
- US7 tests T097-T103 can run in parallel.
- US8 tests T114-T117 can run in parallel.
- Polish contract/accessibility updates T125-T128 can run in parallel.

## Parallel Example: User Story 7

```text
Task: "Add game realtime event parser tests for forfeit events in src/realtime/gameEvents.test.ts"
Task: "Add game store forfeit reconciliation tests in src/stores/gameStore.test.ts"
Task: "Add player panel forfeited state tests in src/features/game/GamePlayerPanel.test.tsx"
Task: "Add game board disabled/removed piece tests in src/features/game/GameBoard.test.tsx"
Task: "Add Playwright realtime forfeit flow in src/tests/e2e/game-realtime.spec.ts"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 to provide real explicit backend logout and session invalidation.
3. Complete US2 to expose logout safely in the frontend.
4. Complete US3 and US4 to cover lobby logout and 2-player active-game forfeit.
5. Stop and validate MVP with quickstart backend/frontend smoke flows.

### Incremental Delivery

1. Deliver current-session logout outside gameplay.
2. Add frontend logout UX and local cleanup.
3. Add lobby cleanup.
4. Add 2-player game forfeit completion.
5. Add 3-4 player continuation.
6. Add pending attempt cancellation.
7. Add remaining-player realtime UI updates.
8. Add audit/idempotency/ranking completion hardening.

### Notes

- `[P]` tasks are parallelizable because they touch different files or only add independent tests.
- Backend paths are relative to the frontend repo root and point to the sibling backend root with `../`.
- Do not implement logout from SignalR disconnect handlers.
- Do not log raw token values.
- Do not add frontend runtime packages unless the plan is amended and security review passes.
