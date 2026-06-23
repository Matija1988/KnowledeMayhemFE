# Feature Specification: User Account Settings

**Feature Branch**: `009-user-account-settings`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "12. User Account Settings. Implement user account settings so authenticated users can view and update their personal data, change password, and deactivate their own account after password confirmation."

## Clarifications

### Remediation 2026-06-23

- Active authenticated sessions are tracked by user id and JWT `jti`; login records an active session, logout/deactivation ends the current session, and password change revokes every non-current active session for the user until token expiry while keeping the request token active.
- Reserved usernames and emails include values on any existing non-purged user account record, including inactive or soft-deleted accounts, unless the value belongs to the current user.

### Session 2026-06-23

- Q: Should email changes require a verification step before becoming active? → A: Email update is immediate after format and uniqueness validation; no verification step in this feature.
- Q: What should happen to active sessions after a password change? → A: Revoke other active sessions; keep the current session active.
- Q: How strict should the deactivation confirmation text be? → A: Confirmation text must exactly match uppercase `DEACTIVATE`, and the UI must clearly show users that uppercase is required.
- Q: Where should the Settings option open account settings? → A: Settings opens a dedicated account settings page.
- Q: Should deactivation warn about lobby/game consequences? → A: Always show a general warning that deactivation may leave active lobbies or forfeit active games.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Current Account Settings (Priority: P1)

As an authenticated user, I want to open account settings from the application header and see my current username, email, and role so that I can verify what account I am using before making changes.

**Why this priority**: Viewing current account data is the entry point for all account settings actions and gives users confidence before editing personal information.

**Independent Test**: Sign in as a normal active user, open the user menu, choose Settings, and verify the settings view displays the current username, email, and role without showing password or sensitive session data.

**Acceptance Scenarios**:

1. **Given** an active authenticated user, **When** the user opens the header user menu and selects Settings, **Then** a dedicated account settings page opens with the user's current username, email, and role.
2. **Given** the account settings view is open, **When** profile data is displayed, **Then** password hash, password value, token values, and sensitive session data are not displayed.
3. **Given** an unauthenticated visitor, **When** they attempt to access account settings, **Then** they are prevented from viewing account data and are directed to sign in.

---

### User Story 2 - Update Username and Email (Priority: P1)

As an authenticated user, I want to update my username and email so that I can keep my account identity and contact information current.

**Why this priority**: Username and email updates are core account management actions and must be self-service for active users.

**Independent Test**: Sign in as an active user, change username and email to valid available values, save each change, and verify the updated values appear after the operation completes.

**Acceptance Scenarios**:

1. **Given** an active authenticated user with account settings open, **When** the user enters a valid available username and saves, **Then** the username is updated and success feedback is shown.
2. **Given** the requested username is already used by another account, **When** the user saves the username change, **Then** the change is rejected with the message "Username is already taken."
3. **Given** an active authenticated user with account settings open, **When** the user enters a valid available email and saves, **Then** the email is updated and success feedback is shown.
4. **Given** the requested email is already used by another account, **When** the user saves the email change, **Then** the change is rejected with the message "Email is already in use."
5. **Given** the user submits the same username or email already assigned to their own account, **When** the user saves, **Then** the request succeeds without duplicate-value errors.

---

### User Story 3 - Change Password (Priority: P1)

As an authenticated user, I want to change my password by entering my current password and confirming the new password so that I can keep my account secure.

**Why this priority**: Password change is a high-value security function and must be protected by current-password verification.

**Independent Test**: Sign in as an active user, submit current password plus matching new password fields, verify success, then verify incorrect current password and mismatched confirmation are rejected with clear messages.

**Acceptance Scenarios**:

1. **Given** an active authenticated user, **When** the user enters the correct current password and matching valid new password values, **Then** the password is changed and success feedback is shown.
2. **Given** the current password is incorrect, **When** the user submits the password change, **Then** the change is rejected with a clear invalid-current-password message.
3. **Given** the new password and confirmation do not match, **When** the user submits the password change, **Then** the change is rejected before the password is changed.
4. **Given** the settings form is displayed, **When** the user views password fields, **Then** password inputs are empty and no password value is prefilled or displayed.

---

### User Story 4 - Deactivate Own Account (Priority: P2)

As an authenticated user, I want to deactivate my own account only after entering my password and explicit confirmation text so that accidental or unauthorized deactivation is prevented.

**Why this priority**: Account deactivation is destructive and security-sensitive; it must be clearly separated from ordinary settings and must also respect active lobby/game consequences.

**Independent Test**: Sign in as an active user, open the danger zone, enter the required confirmation text and correct password, submit deactivation, and verify the user is logged out and cannot sign in again.

**Acceptance Scenarios**:

1. **Given** an active authenticated user, **When** the user enters the correct password and confirmation text `DEACTIVATE`, **Then** the account is deactivated, the user is logged out, and the current session is no longer usable.
2. **Given** the confirmation text is missing or does not exactly match uppercase `DEACTIVATE`, **When** the user attempts deactivation, **Then** deactivation is rejected and no account state changes.
3. **Given** the password is incorrect, **When** the user attempts deactivation, **Then** deactivation is rejected with a clear password verification error.
4. **Given** the user is in an active lobby, **When** deactivation succeeds, **Then** existing lobby leave behavior is applied before logout completes.
5. **Given** the user is in an active game session, **When** deactivation succeeds, **Then** existing logout/forfeit behavior is applied before logout completes.
6. **Given** an account has been deactivated, **When** the user attempts to sign in or call authenticated account actions, **Then** access is rejected.

---

### Edge Cases

- What happens when a user attempts to access account settings after their account has already been deactivated in another session?
- What happens when another user takes the requested username or email between the time the settings form loads and the user submits?
- What happens when profile data changes in another session while the settings form is open?
- How does the feature handle expired or revoked sessions during save, password change, or deactivation?
- How does the danger-zone flow prevent accidental deactivation through keyboard-only use while remaining fully accessible?
- How are account actions handled when the user is currently in a lobby or active game and deactivation triggers lobby leave or gameplay forfeit behavior?
- How are user-correctable validation failures shown without exposing sensitive security details?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an account settings entry point for authenticated users from the application header or navigation.
- **FR-002**: The account settings entry point MUST use a user icon or equivalent account control that opens a menu containing a Settings option.
- **FR-002a**: The Settings option MUST open a dedicated account settings page.
- **FR-003**: The system MUST allow an active authenticated user to retrieve their own current profile.
- **FR-004**: The current profile MUST include user id, username, email, role, and creation date.
- **FR-005**: Current profile responses and account settings views MUST NOT include password hash, password value, token values, or sensitive session data.
- **FR-006**: The system MUST prevent users from viewing or updating another user's account through account settings.
- **FR-007**: The system MUST reject account settings actions for deactivated users.
- **FR-008**: The system MUST allow an active authenticated user to update their own username.
- **FR-009**: Username updates MUST require a non-empty username no longer than 50 characters.
- **FR-010**: Username updates MUST enforce uniqueness across active and reserved usernames according to existing account identity rules.
- **FR-010a**: Reserved usernames MUST include usernames on inactive or soft-deleted user account records unless the username belongs to the current user.
- **FR-011**: Updating to the user's unchanged current username MUST succeed without duplicate-value errors.
- **FR-012**: Username conflicts MUST produce a clear user-correctable error message: "Username is already taken."
- **FR-013**: The system MUST allow an active authenticated user to update their own email.
- **FR-014**: Email updates MUST require a non-empty valid email no longer than 255 characters.
- **FR-015**: Email updates MUST enforce uniqueness across active and reserved emails according to existing account identity rules.
- **FR-015a**: Reserved emails MUST include emails on inactive or soft-deleted user account records unless the email belongs to the current user.
- **FR-016**: Updating to the user's unchanged current email MUST succeed without duplicate-value errors.
- **FR-017**: Email conflicts MUST produce a clear user-correctable error message: "Email is already in use."
- **FR-017a**: Accepted email updates MUST become active immediately after validation succeeds; email verification is not part of this feature.
- **FR-018**: The system MUST allow an active authenticated user to change their own password.
- **FR-019**: Password change MUST require current password, new password, and new-password confirmation.
- **FR-020**: Password change MUST verify the current password before changing the stored password.
- **FR-021**: Password change MUST require the new password and confirmation to match.
- **FR-022**: New passwords MUST satisfy the configured password strength requirements.
- **FR-023**: Password change failures caused by an incorrect current password MUST produce a clear user-correctable invalid-current-password error.
- **FR-024**: Password fields MUST never be prefilled or displayed as plain account data.
- **FR-024a**: Successful password change MUST revoke the user's other active sessions while keeping the current session active.
- **FR-024b**: Active sessions MUST be tracked by user id and JWT `jti` so password change can revoke all non-current active sessions until their token expiry.
- **FR-025**: The system MUST allow an active authenticated user to deactivate their own account.
- **FR-026**: Account deactivation MUST be presented in a clearly separated danger zone.
- **FR-026a**: The danger zone MUST always show a general warning that account deactivation may leave active lobbies or forfeit active games.
- **FR-027**: Account deactivation MUST require password confirmation.
- **FR-028**: Account deactivation MUST require explicit confirmation text equal to `DEACTIVATE`.
- **FR-028a**: Account deactivation confirmation MUST be case-sensitive and the settings UI MUST clearly tell users that uppercase `DEACTIVATE` is required.
- **FR-029**: Successful account deactivation MUST mark the account inactive and record the deactivation time.
- **FR-030**: Successful account deactivation MUST revoke or invalidate the user's current authenticated session and log the user out.
- **FR-031**: Deactivated users MUST be prevented from signing in.
- **FR-032**: Deactivated users MUST be prevented from performing authenticated account settings actions.
- **FR-032a**: Account settings query and command handlers MUST use an active-user authorization/policy check, not only a generic authenticated-user check.
- **FR-033**: If a deactivating user is in an active lobby, the system MUST apply existing lobby leave behavior.
- **FR-034**: If a deactivating user is in an active game session, the system MUST apply existing logout/forfeit behavior.
- **FR-035**: Expected validation and domain failures MUST be returned as user-correctable outcomes rather than unhandled failures.
- **FR-036**: The frontend MUST show required-field and invalid-email validation feedback before or during submission.
- **FR-037**: The frontend MUST show backend username conflict, email conflict, and invalid-current-password messages in the relevant settings area.
- **FR-038**: The frontend MUST show success feedback after successful username, email, or password updates.
- **FR-039**: The frontend MUST redirect or return the user to the signed-out state after successful account deactivation.
- **FR-040**: Account settings controls MUST support keyboard operation, accessible labels, visible focus states, and screen-reader-friendly status feedback.
- **FR-041**: Backend account data remains authoritative for profile values, uniqueness, password verification, deactivation state, and session validity.

### Key Entities *(include if feature involves data)*

- **Current User Profile**: The authenticated user's account summary, including user id, username, email, role, and creation date.
- **Account Identity Fields**: Editable username and email values governed by required-field, length, format, and uniqueness rules.
- **Password Change Request**: Current password plus new password and confirmation used to verify the user and change their credential.
- **Account Deactivation Request**: Password confirmation plus explicit confirmation text used to deactivate the current account and trigger logout/session invalidation.
- **Account Deactivation State**: The user's inactive status and deactivation timestamp used to block future sign-in and account actions.
- **Active User Session**: A persisted authenticated session keyed by user id and JWT `jti`, used to end current logout/deactivation sessions and revoke non-current sessions after password change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of authenticated users can open account settings and see their username and email in under 10 seconds during usability testing.
- **SC-002**: Users can update a valid username or email in under 1 minute without administrator assistance.
- **SC-003**: 100% of duplicate username and duplicate email attempts show clear user-correctable messages without changing account data.
- **SC-004**: 100% of password change attempts with incorrect current password or mismatched confirmation are rejected without changing the password.
- **SC-005**: 100% of profile and settings displays omit password hashes, password values, token values, and sensitive session data.
- **SC-006**: 100% of successful account deactivations log the user out and prevent subsequent sign-in for the deactivated account.
- **SC-007**: 100% of successful account deactivations from lobby or active game contexts apply the expected lobby leave or game forfeit consequences.
- **SC-008**: The primary settings and deactivation flows can be completed with keyboard-only input and provide visible focus plus understandable status or validation feedback.

## Assumptions

- Existing authentication, logout/session revocation, lobby leave, and gameplay logout/forfeit behavior will be reused for account deactivation consequences.
- Account settings are available only to active authenticated users.
- Username and email uniqueness checks are backend-authoritative; frontend validation is convenience only.
- Existing password strength policy remains the source of truth for new password acceptance.
- The settings experience is implemented as a dedicated account settings page reachable from the user menu.
- Deactivation is soft deletion, preserving required historical records while preventing login and authenticated account activity.
