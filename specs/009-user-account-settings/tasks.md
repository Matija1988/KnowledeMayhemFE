# Tasks: User Account Settings

**Input**: Design documents from `/specs/009-user-account-settings/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Required by feature specification, quickstart validation, security-sensitive password/deactivation behavior, and frontend accessibility requirements.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested, and validated independently after the shared foundation is complete.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared backend/frontend file structure and contract references for account settings.

- [X] T001 Create account settings frontend directories in src/domain/accountSettings and src/features/accountSettings
- [ ] T002 [P] Create backend identity account settings test fixture file in ../Tests/IdentityTests/AccountSettingsTestFixture.cs
- [ ] T003 [P] Create frontend account settings MSW fixture file in src/tests/accountSettingsHandlers.ts
- [ ] T004 [P] Add account settings API contract reference notes in specs/009-user-account-settings/contracts/account-settings.openapi.yaml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared contracts, validation errors, and typed frontend boundaries required by all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Update current-user identity contracts with profile, identity update, password change, and deactivation request/response records in ../Contracts/Identity/UserContracts.cs
- [X] T006 Add account settings domain errors for inactive account, duplicate username/email, invalid current password, password mismatch, and invalid deactivation confirmation in ../Modules/Identity/Application/IdentityErrors.cs
- [X] T007 Add account settings request validators for identity update, password change, and deactivation in ../Modules/Identity/Application/Validation/IdentityRequestValidators.cs
- [X] T008 Add user domain methods for profile update, password hash update, and self-deactivation timestamp handling in ../Modules/Identity/Domain/User.cs
- [X] T009 Update identity persistence mapping for deactivation timestamp/profile fields if needed in ../Modules/Identity/Infrastructure/Persistence/UserConfiguration.cs
- [X] T010 Add active session registry abstraction for login, logout, deactivation, and revoke-other-sessions-by-user-except-jti in ../Modules/Identity/Application/IActiveUserSessionRepository.cs
- [X] T011 Implement ActiveUserSession domain model, EF configuration, repository support, login creation, and logout/deactivation ending in ../Modules/Identity/Domain/ActiveUserSession.cs, ../Modules/Identity/Infrastructure/Persistence/ActiveUserSessionRepository.cs, ../Modules/Identity/Application/Commands/LoginUserCommandHandler.cs, and ../Modules/Identity/Application/Commands/LogoutUserCommandHandler.cs
- [X] T012 Create frontend account settings domain types matching sanitized DTOs in src/domain/accountSettings/accountSettingsTypes.ts
- [X] T013 Create frontend account settings DTO-to-domain mapper skeletons in src/domain/accountSettings/accountSettingsMappers.ts
- [X] T014 Create frontend account settings API wrapper skeleton with centralized auth/error mapping in src/api/accountSettingsApi.ts
- [X] T015 [P] Add frontend account settings mapper test skeletons in src/domain/accountSettings/accountSettingsMappers.test.ts
- [X] T016 [P] Add frontend account settings API test skeletons in src/api/accountSettingsApi.test.ts

**Checkpoint**: Foundation ready; user story implementation can now begin.

---

## Phase 3: User Story 1 - View Current Account Settings (Priority: P1) MVP

**Goal**: Authenticated users can open Settings from the user menu and view their sanitized current profile on a dedicated page.

**Independent Test**: Sign in as a normal active user, open the user menu, choose Settings, and verify the settings page displays username, email, role, and creation date without password or token data.

### Tests for User Story 1

- [ ] T017 [P] [US1] Add backend integration tests for GET /api/identity/users/me sanitized profile and unauthenticated rejection in ../Tests/HostIntegrationTests/Identity/AccountSettingsProfileEndpointsTests.cs
- [ ] T018 [P] [US1] Add backend unit tests for current-user profile query active/inactive behavior in ../Tests/IdentityTests/GetCurrentUserProfileQueryHandlerTests.cs
- [X] T019 [P] [US1] Add frontend mapper tests for CurrentUserProfile DTO sanitization in src/domain/accountSettings/accountSettingsMappers.test.ts
- [X] T020 [P] [US1] Add frontend API tests for getCurrentUserProfile auth headers and 401 handling in src/api/accountSettingsApi.test.ts
- [ ] T021 [P] [US1] Add React Testing Library tests for route protection, Settings entry, loading, and sanitized profile display in src/features/accountSettings/AccountSettingsPage.test.tsx

### Implementation for User Story 1

- [X] T022 [US1] Implement current-user profile query handler with active-user policy enforcement in ../Modules/Identity/Application/Queries/GetCurrentUserProfileQueryHandler.cs
- [X] T023 [US1] Register current-user profile query handler in ../Modules/Identity/Application/IdentityModuleExtensions.cs
- [X] T024 [US1] Map GET /api/identity/users/me endpoint to current-user profile query in ../Modules/Identity/Application/IdentityEndpoints.cs
- [X] T025 [US1] Implement CurrentUserProfile mapper logic in src/domain/accountSettings/accountSettingsMappers.ts
- [X] T026 [US1] Implement getCurrentUserProfile API call and account settings error normalization in src/api/accountSettingsApi.ts
- [X] T027 [US1] Implement account settings hook for profile loading and stale-session handling in src/features/accountSettings/useAccountSettings.ts
- [X] T028 [US1] Implement dedicated account settings page shell and sanitized profile summary in src/features/accountSettings/AccountSettingsPage.tsx
- [X] T029 [US1] Add protected /account/settings route in src/App.tsx
- [X] T030 [US1] Add authenticated account menu with Settings and Logout actions in src/features/auth/AccountMenu.tsx
- [X] T031 [US1] Add accessible status, labels, focus states, and no-sensitive-data assertions in src/features/accountSettings/AccountSettingsPage.tsx

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Update Username and Email (Priority: P1)

**Goal**: Authenticated active users can update their own username and email with backend-authoritative validation and clear conflict messages.

**Independent Test**: Sign in as an active user, update username/email to valid available values, verify success, then verify duplicate username/email show the required messages without changing account data.

### Tests for User Story 2

- [ ] T032 [P] [US2] Add backend integration tests for PUT /api/identity/users/me success, unchanged values, duplicate active username/email, duplicate inactive or soft-deleted username/email, and inactive rejection in ../Tests/HostIntegrationTests/Identity/AccountSettingsIdentityEndpointsTests.cs
- [ ] T033 [P] [US2] Add backend unit tests for current-user identity update validation and reserved active/inactive/soft-deleted uniqueness behavior in ../Tests/IdentityTests/UpdateCurrentUserIdentityCommandHandlerTests.cs
- [X] T034 [P] [US2] Add frontend API tests for updateCurrentUserIdentity success and conflict problem mapping in src/api/accountSettingsApi.test.ts
- [ ] T035 [P] [US2] Add React Testing Library tests for username/email form validation, conflict messages, and success feedback in src/features/accountSettings/ProfileSettingsForm.test.tsx

### Implementation for User Story 2

- [X] T036 [US2] Refactor existing combined UpdateCurrentUserCommandHandler into identity-only update command in ../Modules/Identity/Application/Commands/UpdateCurrentUserCommandHandler.cs
- [X] T037 [US2] Enforce username/email trim, length, format, unchanged-value success, reserved active/inactive/soft-deleted uniqueness, and uniqueness messages in ../Modules/Identity/Application/Commands/UpdateCurrentUserCommandHandler.cs
- [X] T038 [US2] Update PUT /api/identity/users/me endpoint request mapping for identity-only updates in ../Modules/Identity/Application/IdentityEndpoints.cs
- [X] T039 [US2] Implement updateCurrentUserIdentity API wrapper and conflict normalization in src/api/accountSettingsApi.ts
- [X] T040 [US2] Implement profile form state and submit behavior in src/features/accountSettings/useAccountSettings.ts
- [X] T041 [US2] Implement accessible username/email edit form in src/features/accountSettings/ProfileSettingsForm.tsx
- [X] T042 [US2] Integrate ProfileSettingsForm into the settings page in src/features/accountSettings/AccountSettingsPage.tsx

**Checkpoint**: User Stories 1 and 2 are independently functional and testable.

---

## Phase 5: User Story 3 - Change Password (Priority: P1)

**Goal**: Authenticated active users can change their password after current-password verification, with other sessions revoked and the current session preserved.

**Independent Test**: Sign in as an active user, submit incorrect current password and mismatched confirmation to verify rejection, then submit correct current password plus matching valid new password and verify success with empty password fields.

### Tests for User Story 3

- [ ] T043 [P] [US3] Add backend integration tests for PUT /api/identity/users/me/password success, incorrect current password, mismatch, and inactive rejection in ../Tests/HostIntegrationTests/Identity/AccountSettingsPasswordEndpointsTests.cs
- [ ] T044 [P] [US3] Add backend unit tests for password change current-password verification and active-session revocation of all non-current JWT jti records in ../Tests/IdentityTests/ChangeCurrentUserPasswordCommandHandlerTests.cs
- [X] T045 [P] [US3] Add frontend API tests for changeCurrentUserPassword success and invalid-current-password mapping in src/api/accountSettingsApi.test.ts
- [ ] T046 [P] [US3] Add React Testing Library tests for password fields empty state, mismatch validation, invalid-current-password error, and success clearing in src/features/accountSettings/PasswordChangeForm.test.tsx

### Implementation for User Story 3

- [X] T047 [US3] Implement current-user password change command handler with active-user policy enforcement in ../Modules/Identity/Application/Commands/ChangeCurrentUserPasswordCommandHandler.cs
- [X] T048 [US3] Register password change validator and command handler in ../Modules/Identity/Application/IdentityModuleExtensions.cs
- [X] T049 [US3] Map PUT /api/identity/users/me/password endpoint in ../Modules/Identity/Application/IdentityEndpoints.cs
- [X] T050 [US3] Implement other-session revocation by ending/revoking all active session records except the current JWT jti in ../Modules/Identity/Application/Commands/ChangeCurrentUserPasswordCommandHandler.cs
- [X] T051 [US3] Implement changeCurrentUserPassword API wrapper and error normalization in src/api/accountSettingsApi.ts
- [X] T052 [US3] Implement password change form state and submit behavior in src/features/accountSettings/useAccountSettings.ts
- [X] T053 [US3] Implement accessible password change form with empty password fields in src/features/accountSettings/PasswordChangeForm.tsx
- [X] T054 [US3] Integrate PasswordChangeForm into the settings page in src/features/accountSettings/AccountSettingsPage.tsx

**Checkpoint**: User Stories 1, 2, and 3 are independently functional and testable.

---

## Phase 6: User Story 4 - Deactivate Own Account (Priority: P2)

**Goal**: Authenticated active users can deactivate their own account only after password confirmation and exact uppercase `DEACTIVATE`, with logout/session invalidation and active lobby/game consequences.

**Independent Test**: Sign in as an active user, submit invalid confirmation and incorrect password to verify rejection, then submit correct password plus uppercase `DEACTIVATE` and verify logout, blocked future sign-in, and lobby/game consequences when applicable.

### Tests for User Story 4

- [ ] T055 [P] [US4] Add backend integration tests for POST /api/identity/users/me/deactivation success, invalid confirmation, incorrect password, inactive rejection, and token revocation in ../Tests/HostIntegrationTests/Identity/AccountSettingsDeactivationEndpointsTests.cs
- [ ] T056 [P] [US4] Add backend integration tests for deactivation applying active lobby leave and active game logout/forfeit consequences in ../Tests/HostIntegrationTests/Identity/AccountDeactivationConsequencesTests.cs
- [ ] T057 [P] [US4] Add backend unit tests for self-deactivation command validation, soft-deactivate state, and logout outcome composition in ../Tests/IdentityTests/DeactivateCurrentUserCommandHandlerTests.cs
- [ ] T058 [P] [US4] Add frontend API tests for deactivateCurrentUser success, invalid confirmation, invalid password, and auth-clearing response handling in src/api/accountSettingsApi.test.ts
- [ ] T059 [P] [US4] Add React Testing Library tests for danger zone warning, uppercase DEACTIVATE instruction, case-sensitive validation, and signed-out redirect in src/features/accountSettings/DangerZone.test.tsx
- [ ] T060 [P] [US4] Add Playwright account deactivation smoke test for signed-out redirect and blocked re-login in src/tests/e2e/account-settings.spec.ts

### Implementation for User Story 4

- [X] T061 [US4] Implement current-user self-deactivation command handler with active-user policy enforcement in ../Modules/Identity/Application/Commands/DeactivateCurrentUserCommandHandler.cs
- [X] T062 [US4] Register self-deactivation validator and command handler in ../Modules/Identity/Application/IdentityModuleExtensions.cs
- [X] T063 [US4] Map POST /api/identity/users/me/deactivation endpoint in ../Modules/Identity/Application/IdentityEndpoints.cs
- [X] T064 [US4] Reuse lobby leave and gameplay logout/forfeit services during self-deactivation in ../Modules/Identity/Application/Commands/DeactivateCurrentUserCommandHandler.cs
- [X] T065 [US4] Ensure deactivated users are rejected during login and all account settings query/command actions in ../Modules/Identity/Application/Commands/LoginUserCommandHandler.cs and ../Modules/Identity/Application/Policies/CurrentUserPolicy.cs
- [X] T066 [US4] Implement deactivateCurrentUser API wrapper and deactivation error normalization in src/api/accountSettingsApi.ts
- [X] T067 [US4] Implement deactivation form state, auth clearing, and navigation to signed-out state in src/features/accountSettings/useAccountSettings.ts
- [X] T068 [US4] Implement accessible danger zone with uppercase DEACTIVATE instruction in src/features/accountSettings/DangerZone.tsx
- [X] T069 [US4] Integrate DangerZone into the settings page in src/features/accountSettings/AccountSettingsPage.tsx
- [X] T070 [US4] Update auth session handling for deactivation-triggered local sign-out in src/stores/authStore.ts

**Checkpoint**: All user stories are independently functional and testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility, security, and documentation updates across the feature.

- [ ] T071 [P] Update quickstart results and any endpoint naming adjustments in specs/009-user-account-settings/quickstart.md
- [ ] T072 [P] Run frontend dependency security review and document package-lock/audit result in specs/009-user-account-settings/quickstart.md
- [ ] T073 [P] Run backend identity and host integration tests listed in specs/009-user-account-settings/quickstart.md
- [X] T074 [P] Run frontend npm test and build validation listed in specs/009-user-account-settings/quickstart.md
- [ ] T075 Perform keyboard-only and screen-reader status review for all settings forms in src/features/accountSettings/AccountSettingsPage.tsx
- [X] T076 Verify no account settings UI or API mapper exposes passwords, password hashes, token values, or sensitive session data in src/domain/accountSettings/accountSettingsMappers.ts
- [ ] T077 Verify OpenAPI/design contract alignment after implementation in specs/009-user-account-settings/contracts/account-settings.openapi.yaml
- [ ] T078 [P] Record timed manual validation for SC-001 account settings open-under-10-seconds and SC-002 username/email update-under-1-minute in specs/009-user-account-settings/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2 and is the MVP.
- **Phase 4 US2**: Depends on Phase 2; integrates into the US1 page when available.
- **Phase 5 US3**: Depends on Phase 2; integrates into the US1 page when available.
- **Phase 6 US4**: Depends on Phase 2 and existing logout/lobby/game forfeit services.
- **Phase 7 Polish**: Depends on implemented target user stories.

### User Story Dependencies

- **US1 View Current Account Settings (P1)**: Start after foundation; no dependency on other stories.
- **US2 Update Username and Email (P1)**: Start after foundation; independently testable through API and form once the page shell exists.
- **US3 Change Password (P1)**: Start after foundation; independently testable through API and form once the page shell exists.
- **US4 Deactivate Own Account (P2)**: Start after foundation; relies on existing logout/forfeit/lobby behavior and can be validated independently.

### Within Each User Story

- Write tests first and verify they fail for the intended missing behavior.
- Backend contracts/errors/validators before command handlers.
- Command/query handlers before endpoint mapping.
- Frontend domain mappers before API wrappers and hooks.
- Hooks before presentational forms.
- Accessibility/status behavior before story checkpoint.

---

## Parallel Execution Examples

### User Story 1

```text
Task: T017 backend endpoint tests in ../Tests/HostIntegrationTests/Identity/AccountSettingsProfileEndpointsTests.cs
Task: T019 mapper tests in src/domain/accountSettings/accountSettingsMappers.test.ts
Task: T020 API tests in src/api/accountSettingsApi.test.ts
Task: T021 page tests in src/features/accountSettings/AccountSettingsPage.test.tsx
```

### User Story 2

```text
Task: T032 backend endpoint tests in ../Tests/HostIntegrationTests/Identity/AccountSettingsIdentityEndpointsTests.cs
Task: T034 API tests in src/api/accountSettingsApi.test.ts
Task: T035 form tests in src/features/accountSettings/ProfileSettingsForm.test.tsx
```

### User Story 3

```text
Task: T043 backend endpoint tests in ../Tests/HostIntegrationTests/Identity/AccountSettingsPasswordEndpointsTests.cs
Task: T045 API tests in src/api/accountSettingsApi.test.ts
Task: T046 form tests in src/features/accountSettings/PasswordChangeForm.test.tsx
```

### User Story 4

```text
Task: T055 backend endpoint tests in ../Tests/HostIntegrationTests/Identity/AccountSettingsDeactivationEndpointsTests.cs
Task: T056 backend consequence tests in ../Tests/HostIntegrationTests/Identity/AccountDeactivationConsequencesTests.cs
Task: T058 API tests in src/api/accountSettingsApi.test.ts
Task: T059 danger zone tests in src/features/accountSettings/DangerZone.test.tsx
Task: T060 Playwright smoke test in src/tests/e2e/account-settings.spec.ts
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for US1.
3. Validate that authenticated users can open Settings and view sanitized profile data.
4. Stop for review before adding mutation flows.

### Incremental Delivery

1. Deliver US1 profile viewing as the MVP.
2. Add US2 username/email update.
3. Add US3 password change.
4. Add US4 deactivation and active lobby/game consequences.
5. Run Phase 7 validation after each target release slice.

### Parallel Team Strategy

After Phase 2, backend and frontend work can split by story:

- Developer A: US1 profile endpoint/page.
- Developer B: US2 identity update.
- Developer C: US3 password change.
- Developer D: US4 deactivation and consequences.

Each story keeps its own tests and checkpoint so partial delivery remains safe.
