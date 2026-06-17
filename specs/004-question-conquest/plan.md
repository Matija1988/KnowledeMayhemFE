# Implementation Plan: Question Conquest and Answer Validation During Gameplay

**Branch**: `004-question-conquest` | **Date**: 2026-06-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-question-conquest/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement the question-conquest gameplay flow that replaces direct movement onto valid empty target tiles. Selecting a valid target starts a server-authoritative question attempt, displays a dark blue/white question UI to all players, allows only the acting player to select one answer and confirm with Submit, and applies movement, ownership, result feedback, expiration, and turn advancement only from authoritative REST responses or SignalR events. The implementation extends the existing game feature with conquest REST wrappers, typed DTO/domain mapping, conquest transient state, board interaction changes, realtime event handling, accessible question UI, and focused automated coverage.

## Technical Context

**Language/Version**: TypeScript 6.x with React 19.x, matching the current Vite project

**Primary Dependencies**: Existing React, Vite, React Router, Zustand, `@microsoft/signalr`, Tailwind CSS, CSS Modules, Vitest, React Testing Library, Playwright, and MSW. No new runtime dependency is planned. `dnd-kit` remains approved but is not needed for this keyboard/click conquest slice because drag-and-drop remains out of scope.

**Storage**: Auth persistence remains owned by the existing auth foundation. Durable game board, ownership, attempt result, and turn state remain backend-authoritative. Transient conquest UI state is stored client-side for current question, selected answer, pending flags, result banner timing, and timer-derived expired pending state.

**Testing**: Vitest, React Testing Library, Playwright, and MSW. Coverage must include conquest DTO mapping, question payload validation, answer secrecy, start-attempt flow, selected-answer then Submit flow, pending/duplicate prevention, correct/incorrect/expired result application, non-acting player visibility without answer permission, SignalR event dispatch, duplicate REST/realtime reconciliation, reconnect refresh, accessibility behavior, and route-level game integration.

**Target Platform**: Browser frontend

**Project Type**: Single-page frontend application

**Performance Goals**: Valid target selection shows a question within 2 seconds for 95% of normal-network attempts; answer submission pending feedback appears within 500 ms; result feedback remains visible for about 3 seconds; board interaction remains responsive through selector-based subscriptions, memoized board tiles/pieces, transient conquest state isolation, and controlled SignalR dispatch.

**Constraints**: Gameplay remains server-authoritative; no optimistic durable piece movement, answer correctness, ownership, turn, completion, cancellation, or expiration state. Correct answers must never be exposed in answer options. Exactly four answer options are required for playable question UI. Only acting players can answer, but all players can see active question text and options. The question UI cannot be dismissed while pending. Local expiration disables answer submission and waits for or requests authoritative resolution. API and hub URLs derive from `VITE_API_BASE_URL`; HTTP requests use bearer auth and `credentials: "omit"` by default.

**Scale/Scope**: One active game session at a time; one pending conquest attempt per current player/session; 2 to 4 participating players; conquest only for empty, unblocked, orthogonally adjacent target tiles. Enemy-occupied tile conquest, capturing, leveling, multi-question scoring, difficulty scaling, explanations, authoring/admin UI, and spectator-specific visibility rules are out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Server-authoritative gameplay**: Pass. Attempt creation, answer validation, movement, ownership, expiration, turn advancement, game completion, and cancellation are durable only from backend responses or SignalR events. Local state is limited to selected answer, pending flags, countdown/expired pending display, result banner timing, and UI focus.
- **Typed contracts and domain boundaries**: Pass. Conquest REST DTOs and SignalR payloads are documented in `contracts/`, mapped in `src/domain/conquest/`, and consumed by stores/hooks rather than presentational components. Existing game DTOs remain mapped into domain models.
- **Accessible multiplayer interaction**: Pass. Question UI requires accessible title, grouped answer options, keyboard selection and Submit, visible focus, live announcements for question/pending/result/expiration/turn, focus movement into the modal and recovery to the board, and non-color-only state indicators.
- **Testable realtime behavior**: Pass. Required tests cover REST and SignalR conquest events, duplicate/out-of-order reconciliation, reconnect refresh, non-acting player synchronization, correct/incorrect/expired outcomes, and accessibility behavior through Vitest/RTL, MSW, and Playwright where useful.
- **Secure, performant frontend delivery**: Pass. No new package is planned. Existing dependencies remain within the approved stack. Tasks must include lockfile/audit/advisory checks, normalized game/conquest state, selector subscriptions, memoized board tiles/pieces, and controlled SignalR dispatch.
- **Approved stack alignment**: Pass. React, TypeScript, Vite, Zustand, `@microsoft/signalr`, Tailwind CSS, CSS Modules, Vitest, React Testing Library, Playwright, and MSW align with the constitution. `dnd-kit` is intentionally unused for this slice.

## Project Structure

### Documentation (this feature)

```text
specs/004-question-conquest/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- conquest.openapi.yaml
|   `-- conquest-signalr.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- api/
|   |-- apiConfig.ts
|   |-- httpClient.ts
|   |-- gameApi.ts
|   `-- conquestApi.ts
|-- realtime/
|   |-- gameEvents.ts
|   `-- gameHub.ts
|-- domain/
|   |-- game/
|   `-- conquest/
|       |-- conquestTypes.ts
|       `-- conquestMappers.ts
|-- stores/
|   |-- gameStore.ts
|   `-- conquestStore.ts
|-- features/
|   |-- game/
|   |   |-- GameSessionPage.tsx
|   |   |-- GameBoard.tsx
|   |   |-- GameTile.tsx
|   |   `-- useGameSession.ts
|   `-- conquest/
|       |-- QuestionModal.tsx
|       |-- AnswerOptionButton.tsx
|       |-- ConquestResultBanner.tsx
|       |-- QuestionTimer.tsx
|       `-- useConquestActions.ts
|-- components/
|   `-- ui/
|-- tests/
|   |-- e2e/
|   |-- fixtures/
|   `-- handlers/
`-- App.tsx
```

**Structure Decision**: Extend the existing game architecture. Conquest API wrappers live in `src/api/`, DTO/domain mapping in `src/domain/conquest/`, transient conquest UI state in `src/stores/conquestStore.ts`, board state reconciliation remains in `src/stores/gameStore.ts`, realtime conquest events extend the existing game hub files, and question UI/hook code lives under `src/features/conquest/`. Tests follow existing colocated unit/integration patterns plus shared fixtures/handlers/e2e tests.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Research Summary

See [research.md](research.md). All planning unknowns are resolved:

- Use project-owned conquest REST wrappers and mappers.
- Keep conquest UI state separate from authoritative game board state.
- Change valid target selection from direct movement to attempt creation.
- Require exactly four answer options and reject malformed or correctness-leaking question payloads.
- Use a non-dismissible question modal/panel while an attempt is pending.
- Show result feedback for about 3 seconds before returning focus to the board.
- Extend centralized game SignalR event handling for conquest and turn updates.
- Treat local timer expiration as expired pending until authoritative resolution or refresh.
- Require no new runtime packages.

## Phase 1: Design Summary

See [data-model.md](data-model.md), [contracts/conquest.openapi.yaml](contracts/conquest.openapi.yaml), [contracts/conquest-signalr.md](contracts/conquest-signalr.md), and [quickstart.md](quickstart.md).

Post-design Constitution Check remains passing:

- Server-authoritative gameplay state is preserved across start, answer, result, expiration, realtime, and reconnect flows.
- DTOs and SignalR payloads are documented and mapped into frontend domain models before UI use.
- Accessibility expectations are represented in modal behavior, answer interaction, timer behavior, live regions, and focus recovery.
- Test coverage is planned for REST, domain mapping, stores, hooks, components, realtime, duplicate reconciliation, expiration, and e2e flows.
- No new dependency is introduced; supply-chain checks remain implementation gates.
