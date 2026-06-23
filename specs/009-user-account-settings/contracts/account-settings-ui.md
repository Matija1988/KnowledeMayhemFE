# UI Contract: Account Settings

## Route

- `/account/settings`
- Requires authenticated active user through existing `ProtectedRoute`.
- Unauthenticated users are redirected to sign in.
- Deactivated or revoked-session responses clear local auth and return the user to the signed-out state.

## Entry Point

- Authenticated header/user account control opens a menu.
- Menu contains `Settings`.
- Selecting `Settings` navigates to `/account/settings`.

## Page Regions

### Profile Summary

- Shows username, email, role, and creation date.
- Does not show password, password hash, access token, token id, refresh token, or revoked-session details.
- Provides loading, error, and stale-session states.

### Username and Email Form

- Fields: username, email.
- Client validation: required username, username max 50, required email, valid email, email max 255.
- Backend conflict messages appear in this region:
  - `Username is already taken.`
  - `Email is already in use.`
- Success feedback announces that profile changes were saved.

### Password Change Form

- Fields: current password, new password, confirm new password.
- Fields are empty on render and after successful submit.
- Confirmation mismatch is shown before or during submission.
- Backend invalid-current-password message appears in this region.
- Success feedback announces that password was changed and other sessions were signed out.

### Danger Zone

- Visually separated from ordinary settings.
- Always shows warning that account deactivation may leave active lobbies or forfeit active games.
- Requires password and exact uppercase `DEACTIVATE`.
- UI text must clearly show that `DEACTIVATE` must be uppercase.
- Successful deactivation clears auth state and redirects or returns to signed-out state.

## Accessibility Requirements

- All inputs have visible labels.
- Field errors are associated with inputs through accessible descriptions.
- Form-level success/error messages use screen-reader-friendly status feedback.
- Controls support keyboard-only operation.
- Focus states are visible on all interactive elements.
- Warning, error, and success states do not rely on color alone.

## Error Handling

- `401`: clear stale local auth and navigate to sign in.
- `403`: show account unavailable/inactive message and navigate to sign in where appropriate.
- `400`: show validation detail in the relevant form region.
- `409`: show username/email conflict in profile form region.
- `429`: show rate-limit feedback without clearing local auth.
- `5xx` or network: show retryable modal/toast using existing error handling patterns.
