# Implementation Plan: Lobby Game Setup

**Branch**: `008-lobby-game-setup` | **Date**: 2026-06-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-lobby-game-setup/spec.md`

## Summary

Implement pre-game lobby setup across backend and frontend. The backend becomes authoritative for selected active question categories, per-player piece color, readiness, setup versioning, stale-action rejection, host-transfer setup behavior, and transfer of setup snapshots into created game sessions. The frontend extends the existing lobby room with category selection for hosts, color selection for every player, readiness controls, setup validation feedback, realtime setup updates through the lobby hub, and reconciliation from authoritative lobby snapshots.

## Technical Context

**Language/Version**: Backend: C#/.NET backend in the adjacent KnowledgeMayhem solution. Frontend: TypeScript 6.0.3 with React 19.2.7 and Vite 8.0.16.

**Primary Dependencies**: Backend uses existing ASP.NET Core REST endpoints, SignalR hubs, EF Core persistence, domain/application services, and QuestionBank category data. Frontend uses existing React, React Router, Zustand, Tailwind CSS, `@microsoft/signalr`, Vitest, React Testing Library, Playwright, and MSW. No new runtime package is planned.

**Storage**: Backend persists lobby setup fields, lobby-player setup fields, game-session selected category snapshot, and game-player piece color. Frontend stores only transient pending UI state in Zustand and reconciles durable state from REST responses or SignalR events.

**Testing**: Backend unit/integration tests for lobby setup validation, stale setup version handling, host transfer, game start transfer, and SignalR event publication. Frontend Vitest/React Testing Library/MSW tests for API mapping, store updates, lobby setup controls, accessibility states, error handling, and realtime event handling; Playwright for the two-browser lobby setup happy path.

**Target Platform**: ASP.NET Core backend API/SignalR service plus browser frontend single-page application.

**Project Type**: Cross-project web application feature touching backend domain/application/infrastructure/API layers and frontend SPA lobby/game layers.

**Performance Goals**: Setup changes are visible to connected lobby members within 2 seconds under normal local development conditions; setup controls remain responsive while SignalR reconnects; frontend updates avoid unnecessary full lobby page rerenders by using scoped Zustand selectors; backend setup validation uses bounded queries for selected categories and current lobby players.

**Constraints**: Backend remains authoritative for all lobby setup, readiness, start eligibility, setup version, game-session snapshot transfer, and validation. Frontend must not optimistically commit setup state beyond pending indicators. REST and SignalR payloads must be centrally typed and mapped before UI consumption. Existing CORS/API base URL rules remain in force. No new dependencies or denied package scopes are introduced.

**Repository Boundaries**: Backend task paths such as `Modules/...`, `Host/...`, and `Tests/...` are relative to the backend solution root that contains those directories. Frontend task paths such as `src/...`, `package.json`, and `package-lock.json` are relative to this frontend workspace root.

**Scale/Scope**: Supports existing 2 to 4 player lobbies, 1 to 6 allowed colors with uniqueness per lobby, one or more active categories per lobby, and current lobby/game start flows. Out of scope: custom colors, random color assignment, category weighting, per-player category votes, post-start setup editing, public setup presets, and bulk QuestionBank changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Server-authoritative gameplay**: Pass. Category selection, color selection, readiness, stale-action rejection, and game start transfer are all accepted only from backend REST responses or SignalR snapshots. The frontend may show pending indicators but does not make setup or gameplay state durable locally.
- **Typed contracts and domain boundaries**: Pass. Backend REST DTOs and SignalR events are documented in `contracts/lobby-game-setup.openapi.yaml` and `contracts/lobby-game-setup-realtime.md`. Frontend updates must extend `src/domain/lobby/*`, `src/api/lobbyApi.ts`, and `src/realtime/lobbyEvents.ts` so UI components consume mapped domain models only.
- **Accessible multiplayer interaction**: Pass. Lobby setup controls require keyboard operation, labels, focus states, live-region updates, and non-color-only color indicators. Start readiness and validation feedback must be announced without relying on color alone.
- **Testable realtime behavior**: Pass. The feature touches lobby join/leave, SignalR setup events, reconnect, synchronization, and game start handoff, so tests must cover REST mapping, store reducers/selectors, realtime setup event handling, stale snapshot reconciliation, and a multi-client setup flow.
- **Secure, performant frontend delivery**: Pass. No new package is planned. API base URL and bearer auth remain centralized. Zustand store updates should replace authoritative lobby snapshots atomically and use selectors to limit rerenders. Package-lock/audit review remains an implementation task even though dependencies are unchanged.
- **Approved stack alignment**: Pass. Frontend stays on React, TypeScript, Vite, Zustand, Tailwind CSS, Vitest, React Testing Library, Playwright, MSW, and `@microsoft/signalr`. `dnd-kit` is not needed because this feature does not introduce drag-and-drop.

## Project Structure

### Documentation (this feature)

```text
specs/008-lobby-game-setup/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- lobby-game-setup.openapi.yaml
|   `-- lobby-game-setup-realtime.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (backend project)

```text
Modules/
|-- Matchmaking/
|   |-- Domain/
|   |-- Application/
|   `-- Infrastructure/
|-- Gameplay/
|   |-- Domain/
|   |-- Application/
|   `-- Infrastructure/
|-- QuestionBank/
|   `-- Application/
`-- Realtime/
    `-- Application/

Host/
`-- Program.cs

Tests/
|-- Contract/
`-- HostIntegrationTests/
```

### Source Code (frontend project)

```text
src/
|-- api/
|   |-- lobbyApi.ts
|   |-- lobbyApi.test.ts
|   |-- gameApi.ts
|   `-- questionBankApi.ts
|-- domain/
|   |-- lobby/
|   |   |-- lobbyTypes.ts
|   |   |-- lobbyMappers.ts
|   |   `-- lobbyMappers.test.ts
|   `-- game/
|-- realtime/
|   |-- lobbyEvents.ts
|   |-- lobbyEvents.test.ts
|   |-- lobbyHub.ts
|   `-- lobbyHub.test.ts
|-- stores/
|   `-- lobbyStore.ts
|-- features/
|   |-- lobby/
|   `-- game/
|-- components/
|   `-- ui/
`-- tests/
```

**Structure Decision**: Extend existing backend domain/application/service boundaries and frontend feature-first architecture. Backend validation and persistence stay in Matchmaking/Gameplay services; SignalR hubs remain thin and delegate to application services. Frontend API wrappers remain in `src/api`, DTO/domain mapping in `src/domain/lobby`, realtime event typing in `src/realtime`, durable lobby state in `src/stores/lobbyStore.ts`, and lobby UI under `src/features/lobby`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Research Summary

See [research.md](research.md). Planning decisions are resolved:

- Use backend-authoritative lobby setup versioning for stale ready/start rejection.
- Preserve existing readiness when a new player joins; initialize the new player without color and not ready.
- Preserve categories and colors on host transfer, reset readiness for all remaining players.
- Capture selected categories as game-session snapshots at start; later QuestionBank changes do not alter active games.
- Transfer per-player lobby colors into game players at start.
- Use full lobby snapshots as the primary realtime reconciliation payload, with named setup events as optional hints.
- Add no new frontend dependency.

## Phase 1: Design Summary

See [data-model.md](data-model.md), [contracts/lobby-game-setup.openapi.yaml](contracts/lobby-game-setup.openapi.yaml), [contracts/lobby-game-setup-realtime.md](contracts/lobby-game-setup-realtime.md), and [quickstart.md](quickstart.md).

Post-design Constitution Check remains passing:

- Backend is authoritative for setup state, start eligibility, stale validation, and gameplay snapshot transfer.
- REST and SignalR contracts define the setup payloads before frontend UI consumption; frontend must map DTOs to domain models.
- Lobby setup UI includes keyboard-accessible category, color, ready, and start controls with live status feedback.
- Required tests include backend validation/integration coverage, frontend mapping/store/component coverage, realtime event coverage, reconnect/stale reconciliation, and a Playwright multi-client happy path.
- No new packages are introduced; package-lock/audit review is retained as an implementation gate.
