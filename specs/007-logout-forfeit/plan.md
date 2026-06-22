# Implementation Plan: Logout and Active Game Forfeit Handling

**Branch**: `007-logout-forfeit` | **Date**: 2026-06-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-logout-forfeit/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement explicit logout across the backend and frontend, with active-game logout treated as intentional forfeit. Backend work adds current-session token revocation, logout orchestration across identity, matchmaking, gameplay, realtime, and audit boundaries, pending-attempt cancellation, player elimination, turn advancement, and game completion rules. Frontend work adds a protected-area logout flow, active-game forfeit confirmation, local auth/game/lobby state cleanup, typed API and realtime contracts, and automatic UI reconciliation for lobby/game updates so remaining players see forfeits without manual refresh.

## Technical Context

**Language/Version**: Backend uses .NET/C# in the sibling backend root (`../Host`, `../Modules`, `../Tests`). Frontend uses TypeScript 6.0.3 with React 19.2.7 and Vite in this repository.

**Primary Dependencies**: Backend uses existing ASP.NET Core minimal APIs, authorization, Entity Framework Core persistence, SignalR, PostgreSQL via Npgsql, and shared Result patterns. Frontend uses existing React, React Router, Zustand, Tailwind CSS, `@microsoft/signalr`, Vitest, React Testing Library, Playwright, and MSW. No new runtime package is planned.

**Storage**: Backend persists token/session revocation, game-player elimination state, cancelled attempts, game completion fields, lobby membership updates, and audit records. Frontend keeps only local authenticated state, transient logout pending/error state, and server-authoritative lobby/game snapshots received from REST or realtime updates.

**Testing**: Backend unit and host integration tests for logout, token revocation, lobby removal, game forfeit, pending attempt cancellation, turn advancement, realtime publishing, and idempotency. Frontend Vitest/React Testing Library/MSW coverage for API wrappers, stores/hooks, logout confirmation, protected routing, local state cleanup, realtime event handling, and game/lobby UI updates; Playwright coverage for the primary logout/forfeit flows.

**Target Platform**: Browser frontend plus .NET backend host.

**Project Type**: Cross-project web application feature spanning backend API/realtime services and the single-page frontend application.

**Performance Goals**: Logout and forfeit consequences complete and become visible to affected users within 2 seconds under normal local-development conditions. Frontend protected content is hidden within 1 second after logout success or already-invalid-session response. Realtime event handling must avoid full-board rerenders where only player status, turn, or outcome changed.

**Constraints**: Logout is an explicit user action only; browser refresh, SignalR disconnect, and temporary network loss must not count as logout. Gameplay remains server-authoritative. Frontend must centralize API base URL/auth headers and omit browser credentials by default. Hubs remain thin and delegate to application services. No vulnerable or constitution-denied frontend packages may be added.

**Scale/Scope**: Supports authenticated users in no participation, lobby-only participation, active 2-player game, and active 3-4 player game. Covers conquest, battle, and special-field pending attempts. Covers current-session logout only, not logout-all, inactivity timers, or disconnected-player timeout forfeits.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Server-authoritative gameplay**: Pass. Logout-forfeit, attempt cancellation, piece disabling/removal, turn advancement, game completion, and lobby membership changes are backend-authoritative. Frontend may show pending/logout UI state but may not commit durable gameplay or membership outcomes without backend confirmation or realtime event.
- **Typed contracts and domain boundaries**: Pass. Backend REST and realtime payloads are documented in feature contracts and must be mapped into frontend domain models before UI consumption. FE components use hooks/stores and typed event contracts, not ad hoc DTO access.
- **Accessible multiplayer interaction**: Pass. Logout controls, active-game confirmation dialog, retry errors, blocked forfeited-session messaging, and live game outcome/turn updates require keyboard operation, visible focus, accessible labels, and live-region status messaging.
- **Testable realtime behavior**: Pass. Feature touches session join/leave, SignalR event handling, reconnect/snapshot reconciliation, multiplayer turn/outcome synchronization, and board UI updates, so tests are required at backend publisher, frontend event contract/store, component, and e2e levels.
- **Secure, performant frontend delivery**: Pass. No new package planned. Token values must not be logged. Frontend work reuses existing API wrappers, stores, and SignalR services; updates should use selector-based subscriptions and normalized state to avoid broad rerenders.
- **Approved stack alignment**: Pass. Uses existing backend stack plus approved frontend React, TypeScript, Vite, Zustand, `@microsoft/signalr`, Tailwind CSS, Vitest, React Testing Library, Playwright, and MSW. `dnd-kit` is unaffected because this feature does not change drag-and-drop architecture.

## Project Structure

### Documentation (this feature)

```text
specs/007-logout-forfeit/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- logout-forfeit.openapi.yaml
|   `-- realtime-events.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (backend sibling root)

```text
../Host/
|-- Program.cs
`-- Infrastructure/Persistence/
    |-- ApplicationDbContext.cs
    `-- Migrations/
../Modules/
|-- Identity/
|   |-- Application/
|   |-- Domain/
|   `-- Infrastructure/Persistence/
|-- Matchmaking/
|   |-- Application/
|   |-- Domain/
|   `-- Infrastructure/Persistence/
|-- Gameplay/
|   |-- Application/
|   |-- Domain/
|   `-- Infrastructure/Persistence/
`-- Realtime/
    |-- Application/
    `-- Infrastructure/
../Contracts/
|-- Identity/
|-- Matchmaking/
|-- Gameplay/
`-- Realtime/
../Tests/
|-- Unit/
|-- Contract/
`-- HostIntegrationTests/
```

### Source Code (frontend repository root)

```text
src/
|-- api/
|   |-- identityApi.ts
|   |-- gameApi.ts
|   |-- lobbyApi.ts
|   `-- httpClient.ts
|-- domain/
|   |-- auth.ts
|   |-- game/
|   `-- lobby/
|-- realtime/
|   |-- gameEvents.ts
|   |-- gameHub.ts
|   |-- lobbyEvents.ts
|   `-- lobbyHub.ts
|-- stores/
|   |-- authStore.ts
|   |-- gameStore.ts
|   `-- lobbyStore.ts
|-- features/
|   |-- auth/
|   |-- game/
|   `-- lobby/
|-- components/
|-- routes/
`-- tests/
```

**Structure Decision**: Treat this as a cross-project feature. Backend changes live in the sibling backend root (`../Modules`, `../Host`, `../Contracts`, `../Tests`) because the active Spec Kit workspace is the frontend repository. Frontend changes remain in the current repository under existing API/domain/realtime/store/feature boundaries. No new top-level frontend feature area is required; logout belongs to auth/session concerns and forfeit display belongs to game/lobby concerns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Research Summary

See [research.md](research.md). All planning decisions are resolved:

- Add explicit current-session logout with revocation for the token/session used on the request.
- Keep disconnect/refresh separate from logout; SignalR disconnect handlers must not call forfeit logic.
- Introduce an application-level logout orchestration service that coordinates identity revocation, lobby cleanup, gameplay forfeit, pending attempt cancellation, realtime publishing, and audit recording.
- Add GamePlayer elimination timestamp and reason while preserving existing `IsEliminated` turn-skip behavior.
- Cancel, not fail, interrupted conquest/battle/special-field attempts.
- Complete 2-player games immediately and complete 3-4 player games only when one non-eliminated player remains after forfeit.
- Block forfeited players from reopening that game session after re-authentication.
- Extend FE auth API/store/hooks and game/lobby realtime handling without new runtime dependencies.

## Phase 1: Design Summary

See [data-model.md](data-model.md), [contracts/logout-forfeit.openapi.yaml](contracts/logout-forfeit.openapi.yaml), [contracts/realtime-events.md](contracts/realtime-events.md), and [quickstart.md](quickstart.md).

Post-design Constitution Check remains passing:

- Backend remains authoritative for logout consequences, attempt cancellation, turn/order state, game completion, and lobby membership.
- REST and realtime contracts are documented for backend and frontend alignment; UI uses mapped frontend domain models.
- Accessibility requirements are represented in logout control, confirmation dialog, pending status, blocked-session message, and game/lobby live updates.
- Required backend and frontend test coverage is scoped for logout, forfeit, realtime, reconnect, route protection, stores, and e2e player flows.
- No new frontend package is introduced; security checks remain tasks for implementation.
