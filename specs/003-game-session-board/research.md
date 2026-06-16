# Research: Game Session & Board

## Decision: Extend project-owned REST wrappers for game session API calls

**Rationale**: The existing auth and lobby features use `apiConfig`, `httpClient`, and
feature-specific API wrappers. Game session reads and moves should follow the same pattern,
with centralized base URL resolution, bearer auth headers, `Accept: application/json`, JSON
content headers when needed, `credentials: "omit"`, and centralized error normalization.

**Alternatives considered**:

- Calling `fetch` directly in components: rejected because it bypasses auth, CORS, error, and
  mapping boundaries.
- Adding a server-state library: rejected because the constitution requires project-owned API
  wrappers and feature hooks unless a future amendment approves a safe server-state library.
- Relative `/api/...` URLs: rejected because frontend CORS rules require the configured backend
  base URL.

## Decision: Use explicit game domain models and mappers

**Rationale**: The constitution requires REST DTOs and SignalR payloads to be mapped before UI
consumption. Game session payloads include nested players, tiles, pieces, status, ownership, and
turn state, so a dedicated `src/domain/game/` model keeps UI code stable and enables snapshot
validation before rendering a playable board.

**Alternatives considered**:

- Reusing backend DTOs directly in UI: rejected because it violates domain boundaries and makes
  UI fragile when backend payloads evolve.
- Keeping translation in the store: rejected because it mixes data normalization with state
  transitions and makes mapper tests harder.

## Decision: Treat malformed authoritative board snapshots as blocking errors

**Rationale**: The clarification session selected blocking behavior for inconsistent board data.
The frontend must not infer missing tiles or repair authority locally. A blocking error prevents
players from seeing a partial playable board and keeps move validation consistent.

**Alternatives considered**:

- Render valid tiles only with a warning: rejected because it risks misleading players and
  submitting invalid move attempts.
- Render a generated placeholder board: rejected because it conflicts with server-authoritative
  board generation.

## Decision: Store game state in a dedicated Zustand game store

**Rationale**: The game feature needs shared state across route loading, board interaction,
player panel, realtime handlers, and move submission. A dedicated store can keep authoritative
session snapshots separate from selected piece id, candidate targets, pending move, blocking
snapshot error, connection state, and live-region messages while supporting selector-based
subscriptions.

**Alternatives considered**:

- Component-local game state: rejected because realtime events and route transitions need shared,
  testable state transitions.
- Reusing the lobby store: rejected because lobby and gameplay lifecycles have separate domains
  and should not couple room membership to board state.

## Decision: Centralize game realtime updates with `@microsoft/signalr`

**Rationale**: The constitution approves `@microsoft/signalr` and requires a centralized service
for connection lifecycle, reconnect behavior, event registration, dispatch, and session rejoin.
The dependency is already present from the lobby feature. A game hub service can derive
`{VITE_API_BASE_URL}/hubs/game`, use `accessTokenFactory`, register typed game events, and dispatch
authoritative updates to the game store.

**Alternatives considered**:

- Component-owned hub connections: rejected because it violates the constitution and makes cleanup,
  reconnect, and testing fragile.
- Polling only: rejected because multiplayer moves, turns, ownership, and status changes must
  update without manual refresh.
- Hand-rolled WebSocket client: rejected because it does not match the backend SignalR hub.

## Decision: Use click and keyboard board movement for this feature

**Rationale**: The spec requires the current player to select an own uncaptured piece, see
orthogonal helper targets, and activate a target. Click and keyboard controls satisfy the first
playable slice and accessibility requirements without adding drag-and-drop complexity. `dnd-kit`
remains approved for later board interaction but is not necessary here.

**Alternatives considered**:

- Drag-and-drop in Feature 3: rejected because it expands implementation and testing beyond the
  clarified first playable movement loop.
- Mouse-only selection: rejected because the constitution requires keyboard-accessible movement.

## Decision: No standalone End Turn control in this feature

**Rationale**: The clarification session selected successful movement as the only user action that
advances turns. This keeps the playable loop focused and avoids skip-turn UX, validation, and
error states until a later feature explicitly needs them.

**Alternatives considered**:

- Add an End Turn button now: rejected because it broadens scope and creates extra authorization,
  pending, realtime, and accessibility tests.
- Show hidden end-turn behavior: rejected because hidden controls cannot be validated by users.

## Decision: Use normalized board lookup data and memoized tile/piece components

**Rationale**: Board rendering needs to remain responsive as tiles, pieces, selection, hints, and
realtime updates change. Store state should normalize players, tiles, and pieces by id while
selectors derive coordinate maps, piece-on-tile lookups, current-user pieces, and candidate targets.
Tiles and pieces should be componentized with stable props to avoid unnecessary full-board rerenders.

**Alternatives considered**:

- Recompute nested arrays in every component render: rejected because it increases churn during
  board hover/selection and realtime updates.
- Persist all derived maps in durable state: rejected because derived data can drift from
  authoritative snapshots.

## Decision: Test REST, board helpers, stores, realtime, and UI with MSW-backed coverage

**Rationale**: The feature touches high-risk multiplayer behavior. Domain mapper tests can validate
snapshot consistency, store tests can cover selection/pending/realtime transitions, API tests can
verify auth/base URL/credentials, React Testing Library can cover board accessibility and UI states,
and Playwright can validate the end-to-end route and movement loop where practical.

**Alternatives considered**:

- Manual-only game validation: rejected because board and realtime regressions are easy to miss.
- Live backend-only tests: rejected because they are brittle for frontend planning and CI.

## Decision: Keep dependency changes gated by supply-chain checks

**Rationale**: No new runtime dependency is required, but the constitution requires package-lock
review, `npm audit`, active malware advisory checks, and lockfile control before accepting any
dependency change. The implementation plan and tasks should include this gate so future board work
does not accidentally introduce denied packages.

**Alternatives considered**:

- Skip security checks because no package is planned: rejected because implementation may still
  touch lockfiles or test dependencies.
