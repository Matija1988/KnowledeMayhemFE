# Data Model: User Account Settings

## CurrentUserProfile

Represents sanitized profile data for the authenticated active user.

**Fields**

- `id`: Guid, required.
- `username`: string, required, max 50 characters.
- `email`: string, required, valid email, max 255 characters.
- `roleId`: Guid, required.
- `role`: string, required.
- `createdAt`: DateTime UTC, required.
- `updatedAt`: DateTime UTC, optional.
- `isActive`: bool, required.
- `deactivatedAt`: DateTime UTC, optional. May map to existing `DeletedAt` if the backend keeps one soft-deletion timestamp.

**Rules**

- Must describe only the authenticated current user.
- Must never include password hashes, plain passwords, tokens, token ids, revoked-session rows, or sensitive session metadata.
- Deactivated users cannot retrieve this profile.

## AccountIdentityUpdate

Represents a request to update username and email.

**Fields**

- `username`: string, required, trimmed, max 50 characters.
- `email`: string, required, trimmed, valid email, max 255 characters.

**Rules**

- Request applies only to the current authenticated user.
- Same username/email already assigned to this same user succeeds.
- Username uniqueness must be enforced across active and reserved usernames according to existing identity rules.
- Email uniqueness must be enforced across active and reserved emails according to existing identity rules.
- Reserved usernames and emails include any existing non-purged inactive or soft-deleted user account record unless the value belongs to the current user.
- Username conflicts return user-correctable message `Username is already taken.`
- Email conflicts return user-correctable message `Email is already in use.`

## PasswordChangeRequest

Represents a request to change the current user's password.

**Fields**

- `currentPassword`: string, required.
- `newPassword`: string, required, must satisfy configured password strength policy.
- `confirmNewPassword`: string, required, must equal `newPassword`.

**Rules**

- Request applies only to the current authenticated active user.
- Current password must be verified before changing the stored password hash.
- Password fields must never be returned to the frontend or prefilled.
- On success, revoke the user's other active sessions while keeping the current session active.
- Other active sessions are discovered from persisted `ActiveUserSession` records keyed by user id and JWT `jti`.
- Incorrect current password returns a clear invalid-current-password outcome.
- Mismatched new password confirmation is rejected without changing the password.

## AccountDeactivationRequest

Represents a destructive self-deactivation request.

**Fields**

- `password`: string, required.
- `confirmationText`: string, required, must exactly equal uppercase `DEACTIVATE`.

**Rules**

- Request applies only to the current authenticated active user.
- Password must be verified before deactivation.
- Confirmation match is case-sensitive.
- On success, apply active lobby leave behavior if the user is in a lobby.
- On success, apply active game logout/forfeit behavior if the user is in an active game session.
- On success, mark account inactive, record deactivation timestamp, revoke current session/token, and return a response that allows frontend logout.

## AccountDeactivationState

Represents persisted account inactivity after self-deactivation or admin soft deletion.

**Fields**

- `isActive`: bool, required.
- `deactivatedAt`: DateTime UTC, optional.
- `updatedAt`: DateTime UTC, optional.

**State Transitions**

- `Active -> Deactivated`: when self-deactivation succeeds or admin soft-delete succeeds.
- `Deactivated -> Active`: out of scope for this feature.

**Rules**

- Deactivated accounts cannot authenticate.
- Deactivated accounts cannot perform authenticated account settings actions.
- Historical gameplay, lobby, and audit records remain preserved.

## ActiveUserSession

Represents an authenticated session created by a successful login and identified by JWT `jti`.

**Fields**

- `id`: Guid, required.
- `userId`: Guid, required.
- `tokenId`: string, required, maps to JWT `jti`.
- `issuedAtUtc`: DateTime UTC, required.
- `expiresAtUtc`: DateTime UTC, required.
- `endedAtUtc`: DateTime UTC, optional.
- `revocationReason`: string, optional.

**Rules**

- Login creates an active session record for the issued token.
- Logout and account deactivation end the current session and revoke the current token.
- Password change ends/revokes every non-current active session for the user until token expiry.
- The current password-change request token remains active.
- Expired sessions no longer count as active.

## Frontend AccountSettingsViewModel

Represents mapped account settings data consumed by UI components.

**Fields**

- `profile`: `CurrentUserProfile`.
- `profileForm`: username/email draft values and field validation state.
- `passwordForm`: current/new/confirm draft values and field validation state.
- `deactivationForm`: password/confirmation draft values and field validation state.
- `status`: idle/loading/saving/success/error state for each form area.

**Rules**

- Derived from backend DTOs through account settings mappers.
- Password draft values are local only and cleared after success or route leave.
- Deactivation success clears auth/session state and navigates to signed-out state.
