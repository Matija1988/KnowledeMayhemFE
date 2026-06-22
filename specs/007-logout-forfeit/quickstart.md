# Quickstart: Logout and Active Game Forfeit Handling

## Prerequisites

- Backend solution available in the sibling backend root (`../Host.slnx`).
- Frontend dependencies installed in this repository.
- Database configured for local backend integration tests.
- `VITE_API_BASE_URL` points to the backend host, for example `http://localhost:5168`.

## Backend Validation

1. Build backend:

   ```powershell
   dotnet build ..\Host.slnx --no-restore -m:1 /p:UseSharedCompilation=false /p:BuildInParallel=false /nr:false
   ```

2. Run focused backend tests after implementation:

   ```powershell
   dotnet test ..\Tests\Unit\Unit.csproj -m:1 --no-restore
   dotnet test ..\Tests\HostIntegrationTests\HostIntegrationTests.csproj -m:1 --no-restore
   ```

3. Verify explicit logout outside lobby/game:

   - Login as a user.
   - Call `POST /api/identity/logout` with the current bearer token.
   - Confirm protected requests with the same token are rejected.
   - Confirm a second logout is safe and does not duplicate audit outcomes.

4. Verify lobby logout:

   - Create a lobby as user 1.
   - Join as user 2.
   - Logout user 2.
   - Confirm user 2 is removed and remaining members receive a lobby update.
   - Repeat with host logout and confirm existing host-transfer/close behavior.

5. Verify active 2-player forfeit:

   - Start a 2-player game.
   - Logout the current player.
   - Confirm pending attempts are cancelled if present.
   - Confirm the forfeiting player is eliminated with reason `Forfeit`.
   - Confirm the remaining player is winner and session status is completed.

6. Verify 3-4 player continuation:

   - Start a 3- or 4-player game.
   - Logout one player.
   - Confirm the game continues while more than one non-eliminated player remains.
   - Confirm current turn skips the eliminated player.
   - Confirm the game completes when only one non-eliminated player remains.

## Frontend Validation

1. Run frontend checks:

   ```powershell
   npm test
   ```

2. Run focused e2e flows after implementation:

   ```powershell
   npx playwright test src/tests/e2e/auth-route-boundaries.spec.ts src/tests/e2e/game-realtime.spec.ts
   ```

3. Verify logout UI:

   - Login from a protected area.
   - Confirm logout control is visible and keyboard operable.
   - Trigger logout outside an active game.
   - Confirm pending state appears, local auth state clears, protected content disappears, and the user lands on the unauthenticated entry point.

4. Verify active-game confirmation:

   - Login and open an active game.
   - Choose logout.
   - Confirm a forfeit warning appears.
   - Dismiss it and confirm no logout/forfeit occurs.
   - Confirm it and verify the user is logged out.

5. Verify remaining player update:

   - Open a 2-player game in two browser contexts.
   - Logout as player 1.
   - Confirm player 2 sees forfeited status, winner outcome, completed game, disabled actions, and no stale pending prompt without refresh.

6. Verify blocked forfeited session:

   - Re-authenticate as the forfeited player.
   - Attempt to open the forfeited game URL.
   - Confirm the application shows a clear blocked-session message and no gameplay actions.

## Expected Contract Alignment

- REST logout response matches [contracts/logout-forfeit.openapi.yaml](contracts/logout-forfeit.openapi.yaml).
- Realtime events match [contracts/realtime-events.md](contracts/realtime-events.md).
- Frontend DTOs are mapped into auth/lobby/game domain models before UI consumption.
