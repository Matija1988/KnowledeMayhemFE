# Quickstart: Lobby Game Setup Validation

## Prerequisites

- Backend API running with auth, lobby, question bank, gameplay, and SignalR enabled.
- Frontend running with `VITE_API_BASE_URL` pointing at the backend API origin.
- At least two authenticated users.
- At least one active QuestionBank category.

## Backend validation scenarios

1. Create a 2-player lobby as user A.
2. Attempt category selection as user B before joining.
   - Expected: request is rejected because user B is not a lobby member/host.
3. Join as user B.
4. Attempt category selection as user B.
   - Expected: request is rejected because only the host can configure categories.
5. Select one active category as user A.
   - Expected: lobby snapshot contains `selectedCategoryIds`, incremented `setupVersion`, `setupStatus: Pending`, and all players not ready.
6. Select `Red` as user A and `Blue` as user B.
   - Expected: lobby snapshot shows unique colors.
7. Attempt duplicate `Red` as user B.
   - Expected: request is rejected and previous colors remain unchanged.
8. Mark both players ready using current `setupVersion`.
   - Expected: lobby snapshot reaches `setupStatus: Ready`.
9. Submit start with an old `setupVersion`.
   - Expected: request is rejected as stale and latest lobby snapshot can be reloaded.
10. Submit start with the current `setupVersion`.
    - Expected: game session is created with selected category snapshot and game-player colors.

## Frontend validation scenarios

1. Open the same lobby in two browser sessions.
2. As host, select an active category.
   - Expected: both sessions display the selected category and reset readiness without refresh.
3. Select unique piece colors in both sessions.
   - Expected: selected swatches display with text labels; duplicate colors are disabled or rejected with a message.
4. Mark both players ready.
   - Expected: ready state and start eligibility update in both sessions within 2 seconds.
5. Start the game as host.
   - Expected: both clients navigate to the created game session and use configured player colors.
6. Repeat with a forced stale setup state.
   - Expected: FE shows a clear stale setup message and reloads the latest lobby snapshot.

## Realtime/reconnect validation

1. Disconnect one lobby client from SignalR.
2. Change category or color from another client.
3. Reconnect the first client.
   - Expected: client joins the lobby hub group and reconciles from an authoritative lobby snapshot before setup controls are enabled.

## Accessibility validation

1. Complete category selection, color selection, ready toggle, and start game using only keyboard input.
2. Verify focus is visible on all controls.
3. Verify color choices include text labels or non-color-only indicators.
4. Verify setup status and validation messages are announced through live regions.

## Suggested test commands

```powershell
npm test -- --run src/domain/lobby/lobbyMappers.test.ts src/api/lobbyApi.test.ts src/realtime/lobbyEvents.test.ts
npm test -- --run src/stores
npm run test:e2e -- --project=chromium
```

Backend test commands must be run from the backend solution root that contains `Modules/`, `Host/`, and `Tests/`. Run the existing host integration suite after backend implementation, focusing on lobby setup and game start transfer coverage.

## Validation results

Last implementation validation:

- `npm test`: passed, 77 test files and 237 tests.
- `npm run test:e2e -- src/tests/e2e/lobby-game-setup.spec.ts src/tests/e2e/lobby-game-setup-reconnect.spec.ts --project=chromium`: passed, 2 Playwright tests.
- `npm audit --audit-level=low`: passed, 0 vulnerabilities.
- `npm run build`: passed; Vite emitted only third-party SignalR/Rolldown annotation warnings from `node_modules`.
- `dotnet build Host/Host.csproj --no-restore -m:1 /p:UseSharedCompilation=false /p:BuildInParallel=false /nr:false`: passed from the backend solution root.
- `dotnet test Tests/Contract/Contract.csproj -m:1 --no-restore`: passed, 24 tests.
- `dotnet test Tests/HostIntegrationTests/HostIntegrationTests.csproj -m:1 --no-restore --filter "FullyQualifiedName~LobbySetup" --logger "console;verbosity=detailed"`: passed for the dedicated lobby setup backend coverage.
- `dotnet test Tests/HostIntegrationTests/HostIntegrationTests.csproj -m:1 --no-restore`: not treated as a clean full-suite gate yet because earlier full runs had health-check flakiness outside the setup changes.

Open validation gaps:

- Full Playwright suite run remains optional for broader regression coverage; dedicated lobby setup Playwright scenarios are green.
