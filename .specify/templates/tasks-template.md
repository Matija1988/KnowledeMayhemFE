---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED for constitution-covered gameplay, quiz, session, board,
SignalR, reconnect, synchronization, accessibility, and dependency-risk behavior. Other
tests are included when requested by the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend app**: `src/` at repository root
- **Generated REST clients and wrappers**: `src/api/`
- **SignalR services and event contracts**: `src/realtime/`
- **Domain models and mappers**: `src/domain/`
- **Zustand domain stores**: `src/stores/`
- **Feature code**: `src/features/game/`, `src/features/quiz/`, `src/features/session/`
- **Shared components**: `src/components/`
- **Feature and domain hooks**: `src/hooks/`
- **Test helpers and fixtures**: `src/tests/`

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize TypeScript React Vite project dependencies
- [ ] T003 [P] Configure linting, formatting, and test tooling
- [ ] T004 [P] Configure Tailwind CSS and CSS Modules conventions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T005 [P] Setup generated OpenAPI client workflow and API wrapper structure in src/api/
- [ ] T006 [P] Define centralized SignalR service and typed event contract structure in src/realtime/
- [ ] T007 [P] Create base domain models and DTO mappers in src/domain/
- [ ] T008 [P] Create domain-separated Zustand store skeletons in src/stores/
- [ ] T009 Setup project-owned API request lifecycle helpers, error handling, and retry defaults without denied package scopes
- [ ] T010 Setup MSW handlers and test fixtures in src/tests/
- [ ] T011 Verify dependency security baseline before adding feature packages, including package-lock review, package manager audit, and active malware advisory check

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Vitest/React Testing Library test for [component/hook] in src/features/[feature]/[name].test.tsx
- [ ] T013 [P] [US1] MSW-backed contract behavior test for [REST/SignalR interaction] in src/tests/[name].test.ts
- [ ] T014 [P] [US1] Playwright test for [user journey] in src/tests/e2e/[name].spec.ts

### Implementation for User Story 1

- [ ] T015 [P] [US1] Create domain model and mapper for [Entity] in src/domain/[entity].ts
- [ ] T016 [P] [US1] Create Zustand store slice or selectors for [domain concern] in src/stores/[store].ts
- [ ] T017 [US1] Implement feature hook for [behavior] in src/hooks/[hook].ts
- [ ] T018 [US1] Implement [component/feature] in src/features/[feature]/[component].tsx
- [ ] T019 [US1] Add accessible labels, keyboard interaction, live region updates, and visible focus states
- [ ] T020 [US1] Add server-authoritative reconciliation for [API/SignalR event]

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T021 [P] [US2] Vitest/React Testing Library test for [component/hook] in src/features/[feature]/[name].test.tsx
- [ ] T022 [P] [US2] MSW-backed contract behavior test for [REST/SignalR interaction] in src/tests/[name].test.ts

### Implementation for User Story 2

- [ ] T023 [P] [US2] Create domain model and mapper for [Entity] in src/domain/[entity].ts
- [ ] T024 [US2] Implement feature hook/store integration in src/hooks/[hook].ts
- [ ] T025 [US2] Implement [component/feature] in src/features/[feature]/[component].tsx
- [ ] T026 [US2] Integrate with prior story components without duplicating raw REST response state

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T027 [P] [US3] Vitest/React Testing Library test for [component/hook] in src/features/[feature]/[name].test.tsx
- [ ] T028 [P] [US3] Playwright or MSW-backed test for [user journey/realtime behavior]

### Implementation for User Story 3

- [ ] T029 [P] [US3] Create domain model and mapper for [Entity] in src/domain/[entity].ts
- [ ] T030 [US3] Implement feature hook/store integration in src/hooks/[hook].ts
- [ ] T031 [US3] Implement [component/feature] in src/features/[feature]/[component].tsx

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories: memoized board squares/pieces, selector subscriptions, normalized state, optimized assets, controlled SignalR dispatch
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Accessibility review for keyboard operation, labels, live regions, focus states, and non-color-only indicators
- [ ] TXXX Security review for newly added or updated packages; reject vulnerable, compromised, malware-advised, or constitution-denied packages
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests required by the constitution MUST be written and FAIL before implementation
- Domain models and mappers before hooks/stores
- Stores and feature hooks before presentational components
- SignalR service updates before components consume realtime events
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
