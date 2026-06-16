# Implementation Plan: Game Session & Board

**Branch**: `003-game-session-board` | **Date**: 2026-06-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-game-session-board/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build the first playable authenticated game screen after lobby start. The implementation
extends the existing React + TypeScript frontend with typed game REST wrappers, domain models
and mappers, a centralized SignalR game hub service, a dedicated Zustand game store, `/game/:sessionId`
routing, accessible board interaction, and dark blue/white game UI. All durable board, piece,
ownership, turn, completion, and cancellation state remains backend-authoritative; local state is
limited to selection, helper targets, loading, connection, and pending move feedback.

## Technical Context

**Language/Version**: TypeScript 6.x with React 19.x, matching the current Vite project

**Primary Dependencies**: Existing React, Vite, React Router, Zustand, `@microsoft/signalr`,
Tailwind CSS, CSS Modules, Vitest, React Testing Library, Playwright, and MSW. No new runtime
dependency is planned. `dnd-kit` remains approved but is not required for this keyboard/click
movement slice because drag-and-drop is not in scope.

**Storage**: Browser-local auth persistence remains owned by the auth foundation. Game session
state is stored in a Zustand game store and refreshed from REST responses and SignalR events.
Selection, candidate targets, pending move state, and connection state are transient UI state
and must remain separate from authoritative session snapshots.

**Testing**: Vitest, React Testing Library, Playwright, and MSW. Unit/integration coverage must
include game DTO mapping, board snapshot validation, API request options, store transitions,
move helper rules, pending duplicate prevention, realtime event dispatch, reconnect snapshot
handling, route loading/error states, and accessibility behavior. Playwright should cover the
highest-value end-to-end session load and move flow where backend/MSW support allows it.

**Target Platform**: Browser frontend

**Project Type**: Single-page frontend application

**Performance Goals**: Valid game sessions show board/player/turn state within 5 seconds for
95% of normal-network attempts; move pending feedback appears within 500 ms of submission;
realtime move/turn/ownership updates render without manual refresh; board interaction remains
responsive through selector-based subscriptions, normalized state, memoized tiles/pieces, and
controlled SignalR dispatch.

**Constraints**: Gameplay remains server-authoritative; no optimistic durable moves, ownership,
turn, completion, or cancellation state. REST and SignalR payloads are mapped into domain models
before UI use. Inconsistent authoritative board snapshots are blocking errors and movement stays
disabled until a valid snapshot loads. API and hub URLs derive from `VITE_API_BASE_URL`; HTTP
requests use bearer auth and `credentials: "omit"` by default. The feature exposes no standalone
End Turn or skip-turn control. UI follows the shared dark blue/white visual system with keyboard
operation, visible focus, live regions, and non-color-only state indicators.

**Scale/Scope**: One protected `/game/:sessionId` route, one current game session at a time, a
server-sized rectangular board rendered from backend tiles, 2 to 4 participating players, current
user movement of own uncaptured pieces, orthogonal one-tile helper targets, authoritative move
updates, tile ownership display, turn display, completed/cancelled display, reconnect recovery,
and blocking malformed-snapshot handling. Quiz conquest, answer validation, capturing, leveling,
drag-and-drop, animations, spectator mode, chat, and standalone end-turn are out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Server-authoritative gameplay**: Pass. Durable game session, board, tile, piece, ownership,
  turn, completed, and cancelled state changes are accepted only from REST responses or SignalR
  events. Local UI state is limited to selected piece, helper target hints, pending move feedback,
  loading, and connection status. Malformed snapshots block play rather than generating local board
  truth.
- **Typed contracts and domain boundaries**: Pass. Game REST DTOs and SignalR payloads are
  documented in `contracts/`, modeled through game API/realtime contract types, mapped in
  `src/domain/game/`, and consumed by stores/hooks rather than presentational components.
- **Accessible multiplayer interaction**: Pass. Board tiles and pieces must be keyboard reachable,
  selected/valid/blocked/owned/occupied states must not rely on color alone, focus states must be
  visible, and live regions must announce turn, move, status, connection, and blocking-error changes.
- **Testable realtime behavior**: Pass. Required tests cover board loading, malformed snapshots,
  tile/piece placement, current-player rules, movement helper rules, move request/pending/success/
  rejection, SignalR move/ownership/turn/status events, duplicate/out-of-order event protection,
  reconnect snapshot refresh, and accessibility.
- **Secure, performant frontend delivery**: Pass. No new package is planned. Existing
  `@microsoft/signalr` remains constitution-approved and already present. Tasks must still include
  package-lock review, `npm audit`, current malware advisory checks, normalized store state,
  selector subscriptions, memoized board tiles/pieces, and controlled SignalR dispatch.
- **Approved stack alignment**: Pass. React, TypeScript, Vite, Zustand, `@microsoft/signalr`,
  Tailwind CSS, CSS Modules, Vitest, React Testing Library, Playwright, and MSW align with the
  constitution. `dnd-kit` is intentionally unused because drag-and-drop is out of scope.

## Project Structure

### Documentation (this feature)

```text
specs/003-game-session-board/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- game-session.openapi.yaml
|   `-- game-signalr.md
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
|   |-- identityApi.ts
|   |-- lobbyApi.ts
|   `-- gameApi.ts
|-- realtime/
|   |-- lobbyEvents.ts
|   |-- lobbyHub.ts
|   |-- gameEvents.ts
|   `-- gameHub.ts
|-- domain/
|   |-- auth.ts
|   |-- lobby/
|   `-- game/
|       |-- gameTypes.ts
|       `-- gameMappers.ts
|-- stores/
|   |-- authStore.ts
|   |-- errorStore.ts
|   |-- loadingStore.ts
|   |-- lobbyStore.ts
|   `-- gameStore.ts
|-- features/
|   |-- auth/
|   |-- lobby/
|   `-- game/
|       |-- GameSessionPage.tsx
|       |-- GameBoard.tsx
|       |-- GameTile.tsx
|       |-- GamePiece.tsx
|       |-- GamePlayerPanel.tsx
|       |-- GameStatusBar.tsx
|       `-- useGameSession.ts
|-- components/
|   |-- ErrorModal.tsx
|   |-- LoadingSpinner.tsx
|   |-- ToastProvider.tsx
|   `-- ui/
|-- hooks/
|   `-- useAuthSession.ts
|-- routes/
|   `-- ProtectedRoute.tsx
|-- tests/
|   |-- e2e/
|   |-- fixtures/
|   |-- handlers/
|   `-- setup.ts
|-- App.tsx
`-- main.tsx
```

**Structure Decision**: Extend the existing auth and lobby structure. Game REST code lives in
`src/api/`, realtime connection and event types in `src/realtime/`, domain models and mappers in
`src/domain/game/`, shared game state in `src/stores/gameStore.ts`, and route/page/components/hooks
in `src/features/game/`. Tests follow the established colocated unit test pattern plus shared
fixtures/handlers/e2e tests under `src/tests/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Research Summary

See [research.md](research.md). All planning unknowns are resolved:

- Use project-owned REST wrappers and mappers for game session reads and moves.
- Use the existing `@microsoft/signalr` dependency for a centralized game hub service.
- Use a dedicated Zustand game store with authoritative snapshots separated from transient UI state.
- Validate authoritative board snapshots before rendering a playable board.
- Keep movement input to click/keyboard selection and orthogonal target activation for this slice.
- Use shared UI primitives plus board-specific styling for the dark blue/white game surface.
- Use MSW-backed API/realtime tests plus focused domain/store/service tests for high-risk behavior.
- Require dependency lockfile, audit, and malware advisory checks even though no new package is planned.

## Phase 1: Design Summary

See [data-model.md](data-model.md), [contracts/game-session.openapi.yaml](contracts/game-session.openapi.yaml),
[contracts/game-signalr.md](contracts/game-signalr.md), and [quickstart.md](quickstart.md).

Post-design Constitution Check remains passing:

- Gameplay state remains authoritative from backend REST/SignalR outcomes.
- DTOs and SignalR payloads are documented and mapped into game domain models before UI use.
- Accessibility expectations are represented in board interaction, state, and quickstart validation.
- Realtime, route, store, API, board helper, error, and UI test coverage is planned for risk-bearing behavior.
- No new dependency is introduced; supply-chain checks are still included as implementation gates.
