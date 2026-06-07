# Research: Authentication Foundation - Login Flow

## Decision: Establish React + TypeScript Application Foundation

**Rationale**: The constitution approves React, TypeScript, and Vite as the frontend stack.
The current repository only declares Vite, so the implementation must add the missing
application foundation before feature code can exist.

**Alternatives considered**:
- Keep plain Vite only: rejected because the constitution and feature plan require React
  components, hooks, and accessible interactive UI.
- Delay app foundation: rejected because login is itself an application screen.

## Decision: Use React Router for Route Boundaries

**Rationale**: The feature requires authenticated route readiness, redirecting logged-out
visitors to login, redirecting signed-in visitors away from login, and preventing protected
content from flashing. React Router is the standard routing layer for React single-page apps
and keeps this behavior declarative and testable.

**Alternatives considered**:
- Hand-rolled route state: rejected because it increases edge-case risk and makes later
  feature routes harder to compose.
- Defer routing: rejected because route readiness is explicit feature scope.

## Decision: Use Zustand for Auth, Loading, and Error UI State

**Rationale**: The constitution approves Zustand for client/UI state. Authenticated session
state, global loading state, and shared error display are UI/client concerns that need to be
available across login, routing, and future auth flows without prop drilling.

**Alternatives considered**:
- React Context only: workable for small state, but rejected because the constitution names
  Zustand as the approved client-state strategy and future auth/session features will benefit
  from selector-based subscriptions.
- REST request cache as auth state: rejected because server-state cache must not duplicate
  durable client auth state.

## Decision: Use Project-Owned API Wrappers for Login Request Lifecycle

**Rationale**: Login is a small server interaction with loading, error, and retry semantics.
The constitution now denies packages and package scopes associated with Shai-Hulud or
Mini Shai-Hulud supply-chain compromise. A project-owned API wrapper and feature hook provide
the required request lifecycle for this feature without introducing a denied dependency.

**Alternatives considered**:
- Raw fetch in UI components: rejected by constitution boundaries and because it makes
  centralized errors/loading harder to enforce.
- Third-party server-state package previously considered for this role: rejected because it
  is constitution-denied until explicit security re-approval.
- Generic server-state library replacement: deferred because this feature only needs one
  login request and can use a smaller project-owned helper.

## Decision: Persist Minimal Auth Session Locally for First Implementation

**Rationale**: The spec requires sign-in state to survive a normal refresh and explicitly
keeps refresh tokens and secure-cookie auth out of scope. Persisting only the access token and
boolean authenticated status satisfies the first slice while leaving room for later auth
hardening.

**Alternatives considered**:
- Memory-only session: rejected because refresh persistence is required.
- Refresh-token or secure-cookie flow: rejected because the spec marks those out of scope.

## Decision: Clear Invalid Saved Sessions Before Showing Protected Content

**Rationale**: Clarification requires expired, malformed, or rejected saved sign-in state to
be cleared and redirected to login with a non-blocking sign-in prompt. This prevents stale
auth state from leaking into authenticated views.

**Alternatives considered**:
- Silent redirect: rejected by clarification because a prompt is required.
- Blocking re-authentication screen: rejected because the first slice uses normal login for
  re-authentication.

## Decision: Use MSW for Backend-Independent Login Tests

**Rationale**: The feature can validate success, failure, invalid session, and network
outage flows without requiring a live backend. MSW also aligns with the constitution's
approved API/realtime mocking approach.

**Alternatives considered**:
- Live backend tests only: rejected because they are brittle for frontend feature validation.
- Manual fetch mocks only: rejected because request/response behavior is easier to maintain
  through reusable handlers.

## Decision: Accessibility Is a Test Target, Not Only a Review Item

**Rationale**: The spec requires keyboard-only completion, labels, visible focus, and
assistive-technology-friendly loading/error changes. These should be represented in
component tests and end-to-end validation.

**Alternatives considered**:
- Manual-only accessibility review: rejected because route/loading/error regressions are
  easy to miss.
