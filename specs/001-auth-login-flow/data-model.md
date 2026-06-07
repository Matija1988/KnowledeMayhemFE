# Data Model: Authentication Foundation - Login Flow

## LoginCredentials

Represents the credentials a logged-out user submits to request access.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `usernameOrEmail` | string | Yes | Trimmed value must not be empty |
| `password` | string | Yes | Must not be empty |

## LoginResult

Represents the successful backend response before domain mapping.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `accessToken` | string | Yes | Must be non-empty |

## AuthenticatedSession

Represents the frontend's minimal signed-in state.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `accessToken` | string or null | Yes | Non-empty when authenticated |
| `isAuthenticated` | boolean | Yes | True only when a usable access token exists |
| `invalidReason` | string or null | No | Set when a saved session is cleared due to expiry, malformed data, or rejection |

### State Transitions

```text
LoggedOut -> Authenticating -> Authenticated
LoggedOut -> Authenticating -> LoginFailed -> LoggedOut
Authenticated -> InvalidSavedSession -> LoggedOut
Authenticated -> SignedOut -> LoggedOut
```

Rules:

- A successful login creates an `AuthenticatedSession`.
- A failed login must not create or preserve an authenticated session.
- Expired, malformed, or rejected saved session data must be cleared before protected
  content is shown.
- Authenticated session state must remain separate from gameplay, quiz, and multiplayer
  session state.

## AuthError

Represents the normalized user-facing error shown through the shared error experience.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Clear, user-facing text |
| `message` | string | Yes | Non-technical and actionable |
| `displayMode` | `toast` or `modal` | Yes | Common login failures use `toast`; severe blocking failures may use `modal` |

## LoadingState

Represents shared in-progress state for auth-related operations.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `isLoading` | boolean | Yes | True only while an operation is in progress |
| `operation` | string or null | No | Identifies the current auth operation, such as `login` |

Rules:

- Loading must be cleared after both successful and failed login attempts.
- Duplicate login submissions are blocked while `isLoading` is true for login.

## ProtectedDestination

Represents a route or screen that requires signed-in state.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `path` | string | Yes | Must point to a frontend route |
| `requiresAuth` | boolean | Yes | True for authenticated areas |
| `fallback` | string | Yes | Login page for logged-out or invalid-session users |

Rules:

- Logged-out users are routed to login.
- Signed-in users can access protected destinations.
- Signed-in users who open login are routed to the lobby entry point.
