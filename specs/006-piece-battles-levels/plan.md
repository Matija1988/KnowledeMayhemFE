# Implementation Plan: Piece Battles, Special Fields, and Level Progression

**Branch**: `006-piece-battles-levels` | **Date**: 2026-06-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-piece-battles-levels/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement the frontend slice for advanced server-authoritative gameplay involving enemy-piece battles, special field attempts, piece capture, and level progression. The frontend extends the existing game/conquest architecture with typed battle and special-field REST wrappers, realtime contracts, DTO-to-domain mappers, normalized game state updates, pending attempt restrictions, accessible multi-question UI, board indicators for special/captured/leveled states, safe audit correlation display, and focused automated coverage. Backend-facing contracts are documented for planning alignment; backend command validation, durable audit persistence, authoritative state transitions, and SignalR broadcast generation remain backend-owned.

## Technical Context

**Language/Version**: TypeScript 6.0.3 with React 19.2.7, matching the current Vite project

**Primary Dependencies**: Existing React, React Router, Vite, Zustand, `@microsoft/signalr`, Tailwind CSS, CSS Modules, Vitest, React Testing Library, Playwright, and MSW. No new runtime dependency is planned. `dnd-kit` remains constitution-approved but is not required for this keyboard/click gameplay slice.

**Storage**: Durable gameplay state remains backend-authoritative. Frontend stores only loaded snapshots, normalized board lookups, current pending battle/special attempt UI state, selected answer, progress display, connection state, and result banners. Auth token storage remains unchanged.

**Testing**: Vitest, React Testing Library, MSW, and Playwright. Coverage must include battle/special DTO mapping, answer secrecy, pending restrictions, level/capture state rendering, board state reconciliation, SignalR events, reconnect refresh, duplicate/out-of-order updates, keyboard accessibility, frontend telemetry emission, and two-player e2e synchronization.

**Target Platform**: Browser frontend

**Project Type**: Single-page frontend application

**Performance Goals**: Battle/special question panel appears within 2 seconds for 95% of normal-network starts; answer progress feedback appears within 500 ms; connected opponents see capture/level/turn updates within 2 seconds for 95% of normal-network interactions; board rendering remains responsive through normalized state, selector subscriptions, memoized tiles/pieces, and controlled realtime dispatch.

**Constraints**: Gameplay-affecting movement, capture, answer correctness, level progression, tile ownership, attempt status, expiration, and turn advancement are durable only after backend responses or realtime events. Correct answers must never be exposed before resolution. All active questions/options/progress are visible to every player, but only the acting player can answer. Incorrect or expired battle/special questions fail the whole attempt and advance the turn. Captured-piece restoration is future scope.

**Observability**: The frontend records non-sensitive diagnostics for battle/special command failures, SignalR reconnects, snapshot-required recovery, stale event rejection, and timing measurements used by battle-start and opponent-update validations. Diagnostics must not expose correct answers or hidden correctness metadata before resolution.

**Scale/Scope**: One active game session at a time; 2 to 4 players; one pending attempt per game session/current player; battle attempts against adjacent enemy pieces; special attempts on adjacent unoccupied special tiles; piece levels 1 through 3; special field reward is acting-piece level progression only. Restore rewards, forgiving battle modes, enemy-occupied special-field capture bonuses, and global no-repeat question history are out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Server-authoritative gameplay**: Pass. Battle starts, special starts, question issuing, answer validation, progress, capture, piece movement, tile ownership, piece level, expiration, completion, cancellation, and turn advancement are represented as durable UI state only from backend responses or SignalR events. Local state remains transient for selected answer, pending flags, countdown, progress display, and focus.
- **Typed contracts and domain boundaries**: Pass. REST and realtime contracts are documented in `contracts/`, mapped into frontend battle/special domain models, and consumed through feature hooks/stores. UI components do not consume raw backend payloads.
- **Accessible multiplayer interaction**: Pass. Battle/special question UI must support keyboard answer selection/submission, visible focus, grouped answer options, live announcements for question/progress/result/level-up/turn/connection status, non-color-only captured/level/special indicators, and focus recovery to the board.
- **Testable realtime behavior**: Pass. Required tests cover battle/special REST wrappers, mappers, stores/hooks, SignalR event dispatch, duplicate/out-of-order handling, reconnect snapshot refresh, opponent synchronization, board rendering, pending restrictions, expiration, and focused Playwright two-player flows.
- **Secure, performant frontend delivery**: Pass. No new package is planned. Tasks must include package-lock review and audit/advisory checks. Rendering plans use normalized board state, selector subscriptions, memoized board tiles/pieces, centralized SignalR dispatch, and non-sensitive frontend telemetry for battle/special failures and realtime recovery.
- **Approved stack alignment**: Pass. Uses approved React, TypeScript, Vite, Zustand, `@microsoft/signalr`, Tailwind CSS, CSS Modules, Vitest, React Testing Library, Playwright, and MSW. No constitution-denied package scope is introduced.

## Project Structure

### Documentation (this feature)

```text
specs/006-piece-battles-levels/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- battle-special.openapi.yaml
|   `-- battle-special-signalr.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- api/          # Generated REST clients and wrappers
|-- realtime/     # SignalR services and event contracts
|-- domain/       # Domain models and mappers
|-- stores/       # Zustand domain stores
|-- features/
|   |-- battle/
|   |-- game/
|   |-- quiz/
|   `-- session/
|-- components/   # Shared reusable UI components
|-- hooks/        # Feature and domain hooks
|-- utils/        # Shared utilities
`-- tests/        # Test helpers and fixtures
```

**Structure Decision**: Extend the existing game/conquest feature architecture. Battle and special-field API wrappers live in `src/api/`, DTO/domain mapping in `src/domain/battle/`, transient pending attempt state in `src/stores/battleStore.ts`, durable board/session reconciliation in `src/stores/gameStore.ts`, realtime event registration in `src/realtime/`, and battle/special UI under `src/features/battle/`. Shared UI controls continue to come from `src/components/ui/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Research Summary

See [research.md](research.md). All planning questions are resolved:

- Use a unified pending attempt model for conquest, battle, and special field locks.
- Model battle/special attempts as separate frontend domain state from durable game session state.
- Use target-tile category question selection with per-attempt no-repeat preference and fallback repeats.
- Treat incorrect answers and expiration as whole-attempt failure.
- Keep captured pieces inactive until future restoration features.
- Apply level progression only from authoritative battle/special results.
- Broadcast and map dedicated realtime events for battle/special/capture/level/turn changes.
- Add no new runtime dependency.

## Phase 1: Design Summary

See [data-model.md](data-model.md), [contracts/battle-special.openapi.yaml](contracts/battle-special.openapi.yaml), [contracts/battle-special-signalr.md](contracts/battle-special-signalr.md), and [quickstart.md](quickstart.md).

Post-design Constitution Check remains passing:

- Server-authoritative gameplay is preserved across start, answer, progress, capture, level-up, ownership, expiration, turn advancement, realtime, and reconnect flows.
- REST and SignalR payloads are documented and mapped to domain models before UI consumption.
- Accessibility expectations are represented in modal/panel behavior, answer interaction, board indicators, live regions, focus recovery, and keyboard controls.
- Test coverage is planned for REST, domain mapping, stores, hooks, components, realtime, duplicate reconciliation, expiration, reconnect, frontend telemetry, and e2e two-player synchronization.
- No new dependency is introduced; package-lock/audit checks remain implementation gates.
