# Quickstart: Game Session & Board

## Prerequisites

- Node and npm compatible with the existing Vite project.
- Backend API running and reachable through `VITE_API_BASE_URL`.
- Backend CORS `FrontendBrowserCors` allows the frontend origin.
- Auth login flow works and returns a JWT bearer token with a stable user id claim or equivalent current-user model.
- Lobby flow can start a valid lobby and navigate to `/game/:sessionId`.
- Game session REST endpoints and `/hubs/game` SignalR hub are available.

## Environment

Create or update local environment configuration:

```text
VITE_API_BASE_URL=https://localhost:5001
```

The frontend must use this base URL for game REST calls and derive the game hub URL as:

```text
{VITE_API_BASE_URL}/hubs/game
```

## Dependency And Security Checks

No new runtime dependency is planned for this feature because `@microsoft/signalr` is already
present. Before accepting implementation changes, still run:

```powershell
npm audit --audit-level=low
```

Review `package-lock.json` to confirm no constitution-denied package scope or active
malware-advised package was introduced. Record the advisory check outcome in the task/PR notes.

Implementation setup check, 2026-06-16:

- No new runtime dependency was installed for this feature.
- `npm audit --audit-level=low` reported 0 vulnerabilities.
- Reviewed `package-lock.json` for denied/advisory package scopes called out by the current
  project checks (`@tanstack`, `@mistralai`, `@antv`, `@ctrl/tinycolor`, `@crowdstrike`,
  `@redhat`, `@openshift`, `jest-canvas-mock`); none were present.

Final validation check, 2026-06-16:

- `npm test` passed: 36 test files, 109 tests.
- `npm run test:e2e` passed: 14 Playwright tests.
- `npm run build` passed. Vite/Rolldown emitted non-fatal `INVALID_ANNOTATION` warnings from
  `node_modules/@microsoft/signalr/dist/esm/Utils.js`; no application build failure resulted.
- Re-ran `npm audit --audit-level=low`: 0 vulnerabilities.
- Re-ran the denied/advisory package scan listed above: no matches.

## Run The App

```powershell
npm run dev
```

Open the local Vite URL and sign in with a valid test user.

## Validation Scenarios

### Load Game Session

1. Start a valid lobby or open `/game/:sessionId` as an authenticated participant.
2. Confirm loading feedback appears while the session is fetched.
3. Confirm the board, players, current turn, turn number, game status, and connection status render from the authoritative session.

Expected result: the board uses backend dimensions and tile coordinates, every active piece appears
on its backend current tile, and no stale board appears during loading/error states.

### Malformed Snapshot Blocking Error

1. Mock or trigger a game session payload with missing, duplicate, or out-of-bounds tiles, a missing piece reference, or a piece on a missing tile.
2. Open the game route.

Expected result: the screen shows a blocking error, movement is unavailable, and no partial playable board is shown until a valid authoritative snapshot loads.

### Board State Indicators

1. Load a game state containing normal, blocked, owned, occupied, selected, and valid-target tiles.
2. Inspect the board visually and with assistive technology.

Expected result: tile type, ownership, category, occupancy, selected, valid target, and blocked
states are distinguishable without relying on color alone.

### Current Player Movement

1. Sign in as the current turn player.
2. Select one of the current user's uncaptured pieces.
3. Confirm only orthogonally adjacent, unblocked, unoccupied target tiles are highlighted.
4. Activate one valid target.

Expected result: a move request with `pieceId`, `targetX`, and `targetY` is submitted with pending
feedback, duplicate submission is blocked, and the durable board/turn state updates only after the
authoritative response or realtime event.

### Invalid Movement

1. Try selecting another player's piece.
2. Try moving while it is not the current user's turn.
3. Try targeting diagonal, multi-tile, blocked, occupied, or missing tiles.
4. Trigger a backend move rejection.

Expected result: clearly invalid frontend attempts are not submitted, backend rejections show
centralized feedback, and durable board state is unchanged locally.

### Realtime Updates

1. Keep the same game open in two browser contexts.
2. Move a piece in one context.
3. Simulate tile ownership changed, turn advanced, completed, cancelled, duplicate event, stale event, disconnect, and reconnect.

Expected result: board, pieces, ownership, turn, status, and connection state update without manual
refresh; reconnect refreshes or receives an authoritative snapshot before movement resumes.

### Accessibility

1. Navigate the game board with keyboard only.
2. Identify current turn, selected piece, valid target, blocked tile, owned tile, and occupied tile.
3. Select an eligible piece and activate a valid target by keyboard.
4. Confirm turn changes, move success/failure, connection changes, and blocking statuses are announced.

Expected result: the primary game route is operable and understandable without a mouse, with visible
focus and non-color-only state indicators.

## Automated Tests

Run unit and integration tests:

```powershell
npm test
```

Run end-to-end tests:

```powershell
npm run test:e2e
```

Required coverage includes game API request options, DTO-to-domain mapping, malformed snapshot
blocking, board dimensions and tile coordinates, piece placement, player/turn display, current-user
piece selection, non-current/other-player/captured selection blocking, orthogonal helper targets,
invalid target exclusion, move request payload, pending duplicate prevention, successful move state
update, illegal move feedback, SignalR move/ownership/turn/completed/cancelled/reconnect handling,
keyboard board interaction, live-region status updates, and route loading/error states.
