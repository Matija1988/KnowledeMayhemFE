# Research: Question Bank Management

## Decision: Use Project-Owned Question Bank REST Wrappers

**Rationale**: The project already centralizes API base URL resolution, bearer auth, JSON handling, `credentials: "omit"`, and error normalization through project-owned wrappers. Question Bank should follow the same pattern to preserve CORS/auth behavior and keep feature components away from raw fetch calls.

**Alternatives considered**:
- Introduce a server-state library: rejected because the constitution currently requires project-owned API wrappers/hooks and no new dependency is needed.
- Call fetch directly from components: rejected because it violates domain boundaries and duplicates auth/error behavior.

## Decision: Map Backend DTOs Into Question Bank Domain Models

**Rationale**: Backend contracts distinguish public question read responses, management question responses, category responses, paged responses, and answer write requests. Mapping them into domain models prevents UI drift and keeps public/gameplay answer secrecy separate from management answer correctness.

**Alternatives considered**:
- Use backend DTOs directly in UI: rejected because DTO field names and public/management shapes differ.
- Share gameplay conquest mappers: rejected because gameplay intentionally hides correctness before submission while management must show correct-answer indicators.

## Decision: Derive Roles From Auth Token Claims

**Rationale**: Existing frontend auth stores the access token and already parses JWT claims for user identity. Role-aware redirect and route protection can extend this parsing to recognize standard role claim names and choose the highest known role when multiple roles are present.

**Alternatives considered**:
- Add a separate user-profile request before redirect: deferred unless backend requires it; it adds latency and complexity.
- Hardcode role by username/test fixture: rejected because it would not reflect production authorization.

## Decision: Add Role-Protected Routes Before Rendering Management Data

**Rationale**: Management screens must not briefly expose data to players. A route-level guard can check auth and role before mounting management pages, while API calls still rely on backend authorization as the final authority.

**Alternatives considered**:
- Hide only management buttons inside pages: rejected because pages and data could still render for unauthorized users.
- Depend only on backend 403 responses: rejected because it produces a poor and potentially leaky user experience.

## Decision: Keep Question Bank Store Focused On Transient UI State

**Rationale**: Categories/questions are backend-authoritative. The store should track current lists, selected records, filters, pagination, pending operations, field errors, and conflict/blocking state, while API responses refresh durable data.

**Alternatives considered**:
- Store no feature state and keep everything local: rejected because filters, pagination, selected records, and pending/error state are shared across management subviews.
- Duplicate all REST cache indefinitely: rejected because stale management data is risky and conflicts must be handled explicitly.

## Decision: Fixed Four-Answer Editor With Radio-Style Correct Selection

**Rationale**: Both feature requirements and backend validation require exactly four answers and exactly one correct answer. A fixed editor prevents invalid add/remove behavior and makes keyboard and screen-reader behavior predictable.

**Alternatives considered**:
- Dynamic add/remove answer rows with validation: rejected because users could enter invalid intermediate counts and the UI would be more complex without product value.
- Checkboxes for correctness: rejected because they allow multiple selections unless extra logic corrects the interaction after the fact.

## Decision: Block Stale Saves And Require Reload

**Rationale**: The clarified behavior prioritizes data integrity over convenience. If the backend rejects a save as stale or conflicting, the UI should show a conflict message and force reload before retrying to avoid overwriting another staff user's changes.

**Alternatives considered**:
- Last write wins: rejected because it can silently destroy staff edits.
- Merge non-conflicting edits: rejected for this slice because question answer replacement and soft delete semantics make merges risky.

## Decision: No New Runtime Dependencies

**Rationale**: Existing React, router, Zustand, API wrappers, global loading/error stores, test stack, and CSS are sufficient. Avoiding new dependencies reduces supply-chain review scope.

**Alternatives considered**:
- Add a form library: rejected because the forms are limited and can be handled with project-owned validation.
- Add a table/grid library: rejected because pagination/filtering needs are simple and custom accessible table markup is sufficient.
