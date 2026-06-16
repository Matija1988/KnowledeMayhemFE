# Quickstart: Lobby View, Start, and Manage

## Prerequisites

- Node and npm compatible with the existing Vite project.
- Backend API running and reachable through `VITE_API_BASE_URL`.
- Backend CORS `FrontendBrowserCors` allows the frontend origin.
- Auth login flow works and returns a JWT bearer token with a stable user id claim or equivalent current-user model.
- Lobby REST endpoints and `/hubs/lobbies` SignalR hub are available.

## Environment

Create or update local environment configuration:

```text
VITE_API_BASE_URL=https://localhost:5001
```

The frontend must use this base URL for lobby REST calls and derive the lobby hub URL as:

```text
{VITE_API_BASE_URL}/hubs/lobbies
```

## Dependency And Security Checks

Before accepting the implementation dependency update:

```powershell
npm install @microsoft/signalr
npm audit --audit-level=low
```

Then review `package-lock.json` to confirm no constitution-denied package scope or active
malware-advised package was introduced. Record the advisory check outcome in the task/PR notes.

Implementation setup check, 2026-06-16:

- Installed `@microsoft/signalr` through npm.
- `npm audit --audit-level=low` reported 0 vulnerabilities.
- Reviewed `package-lock.json` for the currently denied/advisory package scopes called out by the Shai-Hulud and Mini Shai-Hulud checks used for this feature (`@tanstack`, `@mistralai`, `@antv`, `@ctrl/tinycolor`, `@crowdstrike`, `@redhat`, `@openshift`, `jest-canvas-mock`); none were present.
- npm reported existing install-script review warnings for packages already present in the project dependency graph; no new denied scope was accepted for the lobby SignalR dependency.
- Final validation on 2026-06-16: `npm test` passed with 23 files and 66 tests, `npm run test:e2e` passed with 9 tests, `npm run build` passed, and `npm audit --audit-level=low` reported 0 vulnerabilities. The build emits non-fatal Rolldown pure-annotation warnings from `@microsoft/signalr`.

## Run The App

```powershell
npm run dev
```

Open the local Vite URL and sign in with a valid test user.

## Validation Scenarios

### Create Lobby

1. Navigate to `/lobby`.
2. Select the default max players value of 4.
3. Create a lobby.
4. Confirm the app navigates to `/lobby/:lobbyId`.
5. Confirm lobby code, status, host badge, player count, max players, expiration, copy action, leave action, connection status, and host-only start/cancel actions are visible.

Expected result: creation completes with loading feedback, duplicate submission is blocked while pending, and the lobby room shows the authoritative lobby snapshot.

### Join Lobby

1. Sign in as a second user.
2. Navigate to `/lobby`.
3. Enter the host's code with lowercase letters and surrounding whitespace.
4. Submit join.

Expected result: the code is trimmed and uppercased, the user enters the lobby room, and start/cancel actions are not available to the non-host.

### Empty Join Code

1. Submit the join form with an empty or whitespace-only code.

Expected result: field-level validation appears and no join request is made.

### Active Lobby Conflict

1. While signed in as a user who already belongs to an active lobby, attempt to create or join another lobby.

Expected result: the existing active lobby is shown and the user is navigated to that lobby room.

### Host Start Rules

1. As host, view a lobby with only one player.
2. Confirm start is disabled with an understandable reason.
3. Add a second player.
4. Confirm start is enabled while the lobby is open and unexpired.
5. Start the lobby.

Expected result: returned session handoff data is preserved and the app automatically navigates to `/game/:sessionId`. If navigation fails, a clear recovery action is shown.

### Cancel Lobby

1. As host, cancel an open lobby.

Expected result: lobby status is updated from the authoritative response, the user returns to `/lobby`, and cancellation feedback appears.

### Leave Lobby

1. As any participant, leave an open lobby.

Expected result: current lobby state is cleared and the user returns to `/lobby`. If the lobby closed automatically, user-facing feedback appears.

### Realtime Updates

1. Keep the lobby room open in two browser contexts.
2. Join and leave with another user.
3. Trigger host transfer, cancellation, closure, and start where possible.
4. Simulate a temporary lobby hub disconnect and reconnect.

Expected result: player list, count, host badge, status, and navigation handoff update without manual refresh; meaningful changes are announced through a live region; connection status is visible.

### Accessibility

1. Complete create, join, copy code, leave, cancel, and start flows using keyboard only.
2. Confirm inputs and buttons have accessible labels.
3. Confirm disabled actions expose reasons where practical.
4. Confirm modals trap focus and safe dialogs close with Escape.
5. Confirm visual state is not communicated by color alone.

Expected result: all primary lobby flows are operable and understandable without a mouse.

## Automated Tests

Run unit and integration tests:

```powershell
npm test
```

Run end-to-end tests:

```powershell
npm run test:e2e
```

Required coverage includes create success, join success, empty join validation, code normalization, lobby detail rendering, host/non-host action visibility, start disabled/enabled rules, expired lobby disabled state, leave state clearing, cancellation feedback, API error toasts, loading cleanup, SignalR player join/leave/host/status/start events, connection error handling, active-lobby conflict recovery, and automatic game navigation.
