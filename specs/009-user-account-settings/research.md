# Research: User Account Settings

## Decision: Split account settings backend operations by intent

**Decision**: Add separate current-user operations for profile retrieval, username/email update, password change, and self-deactivation. Preserve the existing admin user-management endpoints and avoid exposing admin-style user updates through account settings.

**Rationale**: The existing `PUT /api/identity/users/me` accepts username, email, and password together, which does not match the spec's independent profile edit and password change stories. Separate commands allow focused validation, clearer error messages, and safer password handling.

**Alternatives considered**: Extend the existing combined update endpoint. Rejected because it would keep password update coupled to ordinary profile editing and would make unchanged username/email, current-password verification, and password-field UX harder to express correctly.

## Decision: Current profile endpoint returns sanitized own-account data only

**Decision**: Expose `GET /api/identity/users/me` for authenticated active users. Return id, username, email, role id/name, created date, updated date, active state, and deactivation timestamp where appropriate. Do not return password hash, token identifiers, revoked-session data, or sensitive session details.

**Rationale**: The frontend needs a stable settings read model for the dedicated page. Returning only current-user data satisfies privacy requirements and avoids user-id enumeration.

**Alternatives considered**: Reuse `GET /api/identity/users/{userId}`. Rejected because that endpoint is elevated-user oriented and would require the frontend to know or trust a user id route.

## Decision: Immediate email update without verification

**Decision**: Apply accepted email updates immediately after non-empty, max-length, format, and uniqueness validation.

**Rationale**: Clarification explicitly excludes email verification from this feature. Keeping email state simple avoids pending-email persistence and notification scope.

**Alternatives considered**: Add pending email and verification token workflow. Rejected as out of scope for this feature.

## Decision: Password change revokes other sessions through active session records, keeps current session

**Decision**: Add password-change behavior that verifies the current password, validates new password and confirmation, updates the password hash, and revokes other active sessions while leaving the bearer token used for the request valid. The backend will persist active authenticated sessions keyed by user id and JWT `jti`; login records an active session, logout/deactivation ends the current session, and password change revokes every non-current active session until token expiry.

**Rationale**: This matches clarification and balances security with user experience. The current token must not be blacklisted by the password-change operation.

**Alternatives considered**: Revoke every session including current. Rejected because clarification says to keep the current session active. Rely only on the existing revoked-token table. Rejected because a blacklist alone cannot discover every other active token that needs revocation.

## Decision: Reserved identity values include inactive and soft-deleted users

**Decision**: Treat any existing non-purged user account record as reserving its username and email, including inactive and soft-deleted users, unless the submitted value belongs to the current user.

**Rationale**: This makes "reserved" deterministic and prevents identity reuse that could confuse historical gameplay, audit, or account records.

**Alternatives considered**: Enforce uniqueness only across active users. Rejected because the spec requires reserved identity values and soft deletion preserves historical records.

## Decision: Account settings handlers require an active-user policy

**Decision**: Current-user account settings query and command handlers must call an active-user policy check rather than only checking that a token is authenticated.

**Rationale**: Deactivated accounts may still present stale tokens until revocation propagates; account settings actions must be blocked by account state as well as token validity.

**Alternatives considered**: Rely only on login blocking and token revocation. Rejected because stale or already-issued tokens could still reach account endpoints.

## Decision: Deactivation delegates lobby/game consequences to existing logout behavior

**Decision**: Self-deactivation verifies password and uppercase `DEACTIVATE`, applies existing active-lobby leave behavior and active-game logout/forfeit behavior, soft-deactivates the account, revokes the current token/session, and returns a response that lets the frontend clear auth.

**Rationale**: The logout/forfeit feature already defines intentional logout consequences for active games, and the spec says deactivation must apply those existing consequences. Reusing that behavior keeps game resolution server-authoritative.

**Alternatives considered**: Implement separate deactivation-specific lobby/game handling. Rejected because it risks divergent outcomes from logout and duplicates domain behavior.

## Decision: Frontend uses dedicated account settings domain/API/feature files

**Decision**: Add `src/api/accountSettingsApi.ts`, `src/domain/accountSettings/*`, and `src/features/accountSettings/*`. Add a protected `/account/settings` route and a dedicated authenticated account menu/header control that exposes Settings and Logout actions.

**Rationale**: The frontend constitution requires API/domain boundaries and a dedicated settings page. Existing shared UI components cover form styling, buttons, inputs, errors, toasts, and modals without new dependencies.

**Alternatives considered**: Place settings logic inside auth feature files only or overload the existing logout button as the settings entry point. Rejected because account settings has its own domain, contracts, page, and validation flows beyond login/logout, and the spec requires a user account control/menu.

## Decision: No new dependencies

**Decision**: Use existing React, React Router, Zustand where state is needed, Tailwind/shared UI classes, Vitest/RTL/MSW, and Playwright.

**Rationale**: The feature is forms, REST, and route/session handling. Existing stack is sufficient and avoids supply-chain risk.

**Alternatives considered**: Add a form library or data-fetching library. Rejected because project-owned hooks and controlled forms are adequate for the small number of settings forms.
