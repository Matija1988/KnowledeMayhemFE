# Quickstart: User Account Settings

## Prerequisites

- Backend API is running with the Identity module enabled.
- Frontend dev server is configured with `VITE_API_BASE_URL` pointing at the backend origin.
- At least one active user account exists.
- For conflict scenarios, a second active account exists with a known username and email.

## Backend Validation

1. Build the backend solution.
2. Run identity and host integration tests that cover:
   - `GET /api/identity/users/me` returns only current-user sanitized profile fields.
   - `PUT /api/identity/users/me` updates username/email and accepts unchanged own values.
   - Duplicate username returns `Username is already taken.`
   - Duplicate email returns `Email is already in use.`
   - `PUT /api/identity/users/me/password` rejects incorrect current password and mismatched confirmation.
   - Successful password change revokes other active session records for the same user by JWT `jti` but keeps the current request session active.
   - `POST /api/identity/users/me/deactivation` requires password and exact uppercase `DEACTIVATE`.
   - Successful deactivation soft-deactivates the user, revokes current session, blocks future login, and applies active lobby/game consequences when present.

Expected outcome: all backend tests pass and no profile/account response contains password hash, plain password, token values, or sensitive session records.

## Frontend Validation

1. Install dependencies if needed.
2. Run `npm test`.
3. Run `npm run build`.
4. Run Playwright account settings scenarios once backend support is available.

Required frontend checks:

- Authenticated user can open Settings from the account menu and land on `/account/settings`.
- Unauthenticated visitor cannot view account settings.
- Profile summary displays username, email, role, and creation date only.
- Username/email form shows client validation and backend conflict messages in the profile area.
- Password form starts empty, rejects mismatched confirmation, shows invalid-current-password errors, and clears fields after success.
- Danger zone always displays lobby/game consequence warning.
- Deactivation confirmation clearly requires uppercase `DEACTIVATE`.
- Successful deactivation clears auth and returns user to signed-out state.
- Timed manual validation confirms the settings page opens and displays username/email in under 10 seconds.
- Timed manual validation confirms a valid username/email update can be completed in under 1 minute.

## Manual Smoke Flow

1. Sign in as an active user.
2. Open the account menu and choose Settings.
3. Update username and email to valid available values.
4. Attempt duplicate username and duplicate email using values from another account.
5. Change password with an incorrect current password, then with the correct current password and matching new password.
6. Sign out and sign back in with the new password.
7. Return to Settings, enter the correct password and uppercase `DEACTIVATE`, then submit.
8. Confirm the app returns to signed-out state and the deactivated account cannot sign in.

## Timed Outcome Checks

1. Start a timer immediately before selecting Settings from the authenticated account menu.
2. Stop when username and email are visible on `/account/settings`; expected result is under 10 seconds.
3. Start a timer before editing a valid username or email.
4. Stop when success feedback appears and the updated value is visible; expected result is under 1 minute.

## Active Lobby/Game Consequence Smoke Flow

1. Sign in and join or create a lobby.
2. Deactivate the account from Settings.
3. Confirm the lobby applies existing leave/host-transfer/close behavior.
4. Repeat from an active 1v1 game.
5. Confirm the deactivating player forfeits, the remaining player wins, and the deactivated user is signed out.
