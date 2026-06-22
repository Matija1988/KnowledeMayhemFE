# Research: Logout and Active Game Forfeit Handling

## Decision: Current-session logout only

**Rationale**: Clarification chose invalidating only the session or token used for logout. This matches ordinary logout expectations and avoids forcing the same user out from other devices without a separate logout-all feature.

**Alternatives considered**:
- Logout all sessions: stronger security, but surprising for normal player logout.
- Let user choose current/all sessions: useful later, but expands UX and backend scope.

## Decision: Token/session revocation must be persisted server-side

**Rationale**: The frontend currently stores a bearer access token locally. Clearing local storage is not enough because the token remains usable until expiry. Backend logout must persist a revocation marker for the current token/session and reject it on protected requests after logout.

**Alternatives considered**:
- Frontend-only logout: fails acceptance criteria because protected actions could still use the old token.
- Very short token lifetime only: reduces risk but does not make explicit logout immediate.

## Decision: Logout orchestration lives in application services, not hubs or endpoint handlers

**Rationale**: Logout coordinates identity, matchmaking, gameplay, realtime, and audit behavior. Endpoint handlers and SignalR hubs should remain thin and delegate to services so behavior is testable and reusable.

**Alternatives considered**:
- Put forfeit logic directly in the identity endpoint: couples identity to gameplay internals and makes testing harder.
- Put forfeit logic in SignalR disconnect: violates the requirement that disconnect/refresh is not logout.

## Decision: Pending attempts are cancelled, not failed

**Rationale**: Clarification chose `Cancelled` and explicitly avoids failed-answer/gameplay consequences. The logout forfeit is already the consequence, and board state must remain unchanged from before the pending attempt.

**Alternatives considered**:
- Mark failed: could incorrectly affect scoring, question stats, or gameplay results.
- Fail after partial progress: more complex and contradicts the clarified cancellation outcome.

## Decision: Game completion counts non-eliminated players after forfeit

**Rationale**: Clarification resolved multiplayer completion by counting only players who remain non-eliminated after applying the logout forfeit. This makes previously eliminated players irrelevant for winner calculation and aligns with turn-skip behavior.

**Alternatives considered**:
- Count originally joined players: can keep completed games open incorrectly.
- Count active pieces only: ties winner logic to piece state and may break special cases where an active player has no pieces.

## Decision: Forfeited players are blocked from reopening the forfeited game

**Rationale**: Clarification chose a strict access-denied outcome after re-authentication. Backend read access and realtime subscription checks must reject the eliminated-by-logout player for that game, and frontend must show a clear blocked-session message rather than rendering gameplay.

**Alternatives considered**:
- Read-only access: friendlier for post-game viewing but expands permissions and UI states.
- Completed-only viewing: partial compromise but still requires special-case access.

## Decision: Frontend confirms only active-game logout

**Rationale**: Clarification chose confirmation only when logout would forfeit an active game. This protects irreversible game loss without adding friction to normal logout or lobby-only logout.

**Alternatives considered**:
- Confirm every logout: too much friction.
- Confirm lobby logout too: unnecessary because lobby removal is less destructive and existing host transfer/close rules apply.
- No confirmation: risks accidental forfeit.

## Decision: Realtime updates plus snapshot reconciliation

**Rationale**: Remaining players should see logout/forfeit results without refresh, but missed or delayed realtime events must be repaired by the next authoritative REST snapshot. Frontend stores must treat realtime events as authoritative updates and still reconcile full snapshots from `GET /api/game-sessions/{id}` or lobby reads.

**Alternatives considered**:
- Polling only: simpler but slower and unnecessary with existing SignalR.
- Optimistic frontend updates: violates server-authoritative gameplay.

## Decision: No new frontend dependencies

**Rationale**: Existing API wrappers, Zustand stores, SignalR modules, shared UI components, Vitest, React Testing Library, MSW, and Playwright are sufficient.

**Alternatives considered**:
- Add a server-state library: broad architectural change not justified for this feature.
- Add dialog/toast packages: violates dependency restraint when shared UI exists.
