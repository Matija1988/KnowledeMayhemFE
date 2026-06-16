# Research: Lobby View, Start, and Manage

## Decision: Centralize realtime lobby updates with `@microsoft/signalr`

**Rationale**: The constitution approves `@microsoft/signalr` for realtime multiplayer communication and requires connection lifecycle, reconnect behavior, event registration, and dispatch to live outside presentational components. A single `lobbyHub` service can derive its URL from `VITE_API_BASE_URL`, use `accessTokenFactory`, register strongly typed lobby events, and dispatch authoritative updates into the lobby store.

**Alternatives considered**:

- Component-owned SignalR connections: rejected because it violates the constitution and makes reconnect/testing behavior fragile.
- Polling lobby details: rejected because lobby membership and start changes should be visible without refresh and because it does not cover realtime acceptance criteria.
- Generic event bus without SignalR: rejected because it would not match the backend hub contract.

## Decision: Extend project-owned REST wrappers for lobby API calls

**Rationale**: The current auth feature uses `apiConfig`, `httpClient`, and feature-specific API wrappers. Lobby API calls should follow the same pattern, with centralized base URL resolution, bearer auth headers, `Accept: application/json`, JSON content headers when needed, `credentials: "omit"`, and centralized error normalization.

**Alternatives considered**:

- Adding a server-state library: rejected because the constitution says REST lifecycle must use project-owned wrappers and feature hooks unless amended.
- Calling `fetch` directly in components: rejected because it bypasses centralized error/auth handling and DTO mapping.
- Relative `/api/...` URLs: rejected because frontend CORS rules require the configured backend base URL.

## Decision: Use explicit frontend lobby domain models and mappers

**Rationale**: The spec and constitution both require backend DTOs and realtime payloads to be mapped before UI consumption. `src/domain/lobby/lobbyTypes.ts` should define `Lobby`, `LobbyPlayer`, `LobbyStatus`, `StartLobbyResult`, connection state, and action result types; `lobbyMappers.ts` should validate/normalize known status values, timestamps, player arrays, and returned session handoff data.

**Alternatives considered**:

- Reusing backend DTOs in UI: rejected because it violates domain boundaries and makes UI brittle.
- Keeping all shapes in the store: rejected because it mixes data translation with state transitions.

## Decision: Store current lobby and connection state in a dedicated Zustand store

**Rationale**: The lobby feature needs shared state across landing, room, actions, and realtime handlers. A dedicated lobby store keeps auth, loading/error, and lobby concerns separated while allowing selector-based subscriptions and testable transitions for create/join/read/leave/cancel/start and SignalR events.

**Alternatives considered**:

- Component-local lobby state: rejected because realtime events and route transitions need shared access.
- Duplicating all REST response data in several stores: rejected because it increases drift and conflicts with constitution guidance.

## Decision: Resolve active-lobby conflicts by navigating to the existing active lobby

**Rationale**: The clarification session selected this behavior. It avoids duplicate-lobby confusion and gives create/join flows a deterministic recovery path when the backend reports that the user already belongs to another active lobby.

**Alternatives considered**:

- Show only an error on the landing view: rejected because it strands users away from their active lobby.
- Let the backend message decide all behavior: rejected because it produces inconsistent UX and weak acceptance tests.

## Decision: Automatically navigate to `/game/:sessionId` after successful lobby start

**Rationale**: The clarification session selected automatic handoff. Successful start responses include session handoff data, and users should proceed directly to the game session. If navigation fails, the UI should expose a clear recovery action.

**Alternatives considered**:

- Show a separate continue action: rejected because it adds an unnecessary step to a successful host action.
- Stay in the lobby as started: rejected because the started lobby is no longer the primary task surface.

## Decision: Navigate back to `/lobby` with feedback after successful cancellation

**Rationale**: The clarification session selected this behavior. A cancelled lobby is no longer usable, so returning to the lobby landing with toast feedback keeps the lifecycle simple and avoids maintaining a dead-room state as the primary path.

**Alternatives considered**:

- Stay in the cancelled room: rejected because it complicates the main host flow.
- Split behavior by host/non-host: rejected because it creates two separate cancellation experiences without clear user value.

## Decision: Build shared UI primitives before lobby forms/actions

**Rationale**: The constitution requires the dark blue and white visual system and reusable primitives for forms, buttons, loading, toasts, modals, and focus states. The current auth components include feature UI, but the lobby feature should add `src/components/ui/` primitives before multiplying styled controls.

**Alternatives considered**:

- Style every lobby control independently: rejected because it duplicates visual logic and risks inconsistency.
- Use browser-default controls temporarily: rejected by the constitution and spec.

## Decision: Test REST and realtime with MSW plus service/store unit tests

**Rationale**: MSW can cover REST outcomes for create, join, read, leave, cancel, start, active-lobby conflicts, and network/CORS fallback messaging. SignalR behavior should be tested through the centralized service boundary and lobby store dispatch with mocked connection/event callbacks. Playwright should cover the highest-value end-to-end browser flows.

**Alternatives considered**:

- Manual-only realtime validation: rejected because realtime regressions are high risk.
- Live backend-only tests: rejected because they are brittle for frontend planning and CI.

## Decision: Gate `@microsoft/signalr` installation with supply-chain checks

**Rationale**: The feature needs the approved SignalR package, but the constitution requires package-lock review, `npm audit`, active malware advisory checks, and lockfile control before accepting any package addition.

**Alternatives considered**:

- Hand-rolled WebSocket client: rejected because it does not match the backend SignalR hub and would add avoidable protocol risk.
- Delaying realtime until later: rejected because realtime lobby updates are in scope.
