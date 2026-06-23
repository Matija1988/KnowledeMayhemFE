# Implementation Plan: User Account Settings

**Branch**: `009-user-account-settings` | **Date**: 2026-06-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-user-account-settings/spec.md`

## Summary

Implement authenticated account settings across the backend identity module and frontend SPA. The backend will expose current-user profile retrieval, separate username/email update, password change with current-password verification and other-session revocation, and self-deactivation with password plus uppercase `DEACTIVATE` confirmation. The frontend will add a dedicated account settings page reachable from the user menu, map backend DTOs into account-settings domain models, provide accessible profile/edit/password/danger-zone flows, and return the user to the signed-out state after deactivation.

## Technical Context

**Language/Version**: Backend: C#/.NET backend in the adjacent KnowledgeMayhem solution. Frontend: TypeScript 6.0.3 with React 19.2.7 and Vite 8.0.16.

**Primary Dependencies**: Backend uses existing ASP.NET Core REST endpoints, endpoint authorization, EF Core persistence, Identity application services, password hashing, token revocation, lobby leave, and gameplay logout/forfeit services. Frontend uses existing React, React Router, Zustand, Tailwind CSS, Vitest, React Testing Library, Playwright, and MSW. No new runtime package is planned.

**Storage**: Backend persists user profile fields, password hash changes, active/inactive soft-deactivation state, deactivation timestamp, active authenticated session records keyed by user id and JWT `jti`, and revoked token/session records. Login records the active session, logout/deactivation ends the current session, and password change revokes all non-current active sessions until token expiry while preserving the request token. Frontend stores the bearer token through the existing auth session flow and keeps only transient form state plus latest loaded profile data from backend responses.

**Testing**: Backend unit/integration tests under the adjacent backend `Tests/IdentityTests`, `Tests/HostIntegrationTests`, and relevant contract tests for identity endpoints. Frontend Vitest/React Testing Library/MSW tests for API mapping, account settings hooks/forms, validation and error states, auth/session clearing, and route protection; Playwright for the authenticated settings happy path and deactivation sign-out flow.

**Target Platform**: ASP.NET Core backend API plus browser frontend single-page application.

**Project Type**: Cross-project web application feature touching backend identity contracts/application/infrastructure/API layers and frontend account settings routes, domain, API wrappers, and UI.

**Performance Goals**: Account profile loads within 10 seconds for 95% of authenticated users per spec success criteria; profile update/password/deactivation actions submit once and provide visible pending feedback; no account settings form causes broad gameplay/lobby rerenders because the feature remains isolated from gameplay stores.

**Constraints**: Backend remains authoritative for profile values, reserved identity uniqueness, password verification, deactivation state, session validity, lobby leave, and game forfeit consequences. Reserved usernames/emails include inactive and soft-deleted user records unless the value belongs to the current user. Account settings query/command handlers must use an active-user policy check. Frontend must not display password hashes, token values, or sensitive session data. REST calls must use the centralized API base URL, bearer Authorization header, and `credentials: "omit"`. No vulnerable, compromised, malware-advised, or constitution-denied packages are introduced.

**Repository Boundaries**: Backend paths such as `Contracts/...`, `Modules/...`, `Host/...`, and `Tests/...` are relative to the backend solution root that contains those directories. Frontend paths such as `src/...`, `package.json`, and `package-lock.json` are relative to this frontend workspace root.

**Scale/Scope**: Supports the current authenticated user's own account only. Out of scope: admin account management changes, email verification, account reactivation, multi-factor authentication, account deletion/purge, account export, avatar/profile-picture management, and password reset by email.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Server-authoritative gameplay**: Pass. This feature does not introduce gameplay state changes except deactivation consequences. Deactivation delegates active lobby handling to existing lobby leave behavior and active game handling to existing logout/forfeit behavior; frontend only reacts to backend success/failure and clears local auth after backend confirmation.
- **Typed contracts and domain boundaries**: Pass. REST endpoint contracts are documented in `contracts/account-settings.openapi.yaml`. Frontend work must add account settings DTOs/API wrappers under `src/api`, domain types/mappers under `src/domain/accountSettings`, and feature hooks/components under `src/features/accountSettings`; UI must not consume raw backend DTOs.
- **Accessible multiplayer interaction**: Pass. Account settings controls are non-gameplay, but must meet keyboard operation, labels, visible focus states, status live regions, field-level error association, and non-color-only warning/success/error indicators. The deactivation warning must remain readable and explicit about lobby/game consequences.
- **Testable realtime behavior**: Pass. No new SignalR flow is planned. Existing logout/forfeit and lobby leave services remain backend-authoritative and should be covered by backend integration tests where deactivation invokes them. Frontend tests focus on REST, auth/session state, route behavior, accessible forms, and no sensitive data rendering.
- **Secure, performant frontend delivery**: Pass. No new packages are planned. Existing centralized `httpClient` keeps bearer auth and `credentials: "omit"`. Password fields are never prefilled. Password change revokes other sessions through backend token/session infrastructure. Package-lock/audit/advisory review remains an implementation gate even though dependencies are unchanged.
- **Approved stack alignment**: Pass. Frontend stays on React, TypeScript, Vite, Zustand, Tailwind CSS, Vitest, React Testing Library, Playwright, and MSW. `@microsoft/signalr`, `dnd-kit`, and CSS Modules are not touched because this feature does not add realtime gameplay or drag-and-drop behavior.

## Project Structure

### Documentation (this feature)

```text
specs/009-user-account-settings/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- account-settings.openapi.yaml
|   `-- account-settings-ui.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md      # Phase 2 output from /speckit-tasks
```

### Source Code (backend project)

```text
Contracts/
`-- Identity/
    |-- AuthContracts.cs
    |-- LogoutContracts.cs
    `-- UserContracts.cs

Modules/
`-- Identity/
    |-- Domain/
    |   |-- ActiveUserSession.cs
    |   `-- RevokedUserSession.cs
    |-- Application/
    |   |-- Commands/
    |   |-- Queries/
    |   |-- Validation/
    |   |-- IActiveUserSessionRepository.cs
    |   `-- Mappers/
    `-- Infrastructure/
        `-- Persistence/

Tests/
|-- Contract/
|-- IdentityTests/
`-- HostIntegrationTests/
```

### Source Code (frontend project)

```text
src/
|-- api/
|   |-- accountSettingsApi.ts
|   `-- accountSettingsApi.test.ts
|-- domain/
|   `-- accountSettings/
|       |-- accountSettingsTypes.ts
|       |-- accountSettingsMappers.ts
|       `-- accountSettingsMappers.test.ts
|-- features/
|   |-- accountSettings/
|   |   |-- AccountSettingsPage.tsx
|   |   |-- AccountSettingsPage.test.tsx
|   |   |-- ProfileSettingsForm.tsx
|   |   |-- PasswordChangeForm.tsx
|   |   |-- DangerZone.tsx
|   |   `-- useAccountSettings.ts
|   `-- auth/
|       |-- AccountMenu.tsx
|       `-- LogoutButton.tsx
|-- hooks/
|   `-- useAuthSession.ts
|-- routes/
|   `-- ProtectedRoute.tsx
`-- components/
    `-- ui/
```

**Structure Decision**: Extend existing backend Identity boundaries and frontend feature/domain/API architecture. Backend keeps endpoint handlers thin in `IdentityEndpoints.cs`, adds current-user query and account commands in `Modules/Identity/Application`, reuses `User`, `RevokedUserSession`, `IUserPasswordService`, `CurrentUserPolicy`, uniqueness policy, and existing logout/forfeit/lobby behavior. Frontend uses new account settings domain/API/feature files and existing shared UI components, auth store/session hooks, route protection, toast/error systems, and dark blue visual system.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Research Summary

See [research.md](research.md). Planning decisions are resolved:

- Split current account operations into profile retrieval, identity-field update, password change, and self-deactivation instead of extending the current combined update endpoint.
- Keep email updates immediate after format and uniqueness validation; no verification state is added.
- On password change, use active session records keyed by JWT `jti` to revoke every non-current active session and keep the current request token active.
- On deactivation, verify password plus exact uppercase `DEACTIVATE`, soft-deactivate the user, apply active lobby/game consequences, revoke the current session, and clear frontend auth.
- Add no new frontend dependency.

## Phase 1: Design Summary

See [data-model.md](data-model.md), [contracts/account-settings.openapi.yaml](contracts/account-settings.openapi.yaml), [contracts/account-settings-ui.md](contracts/account-settings-ui.md), and [quickstart.md](quickstart.md).

Post-design Constitution Check remains passing:

- Backend remains authoritative for account state, uniqueness, password verification, deactivation, session revocation, and lobby/game consequences.
- REST contracts are documented before task generation; frontend tasks must map DTOs into domain models before UI use.
- Account settings UI includes keyboard-accessible forms, visible focus, associated errors, live status feedback, and explicit uppercase `DEACTIVATE` instruction.
- Required tests include backend identity command/endpoint coverage, frontend API/mapper/hook/component coverage, route protection, and Playwright happy-path/deactivation validation.
- No packages are introduced; dependency audit remains an implementation task.
