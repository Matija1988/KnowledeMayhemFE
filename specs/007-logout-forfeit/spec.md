# Feature Specification: Logout and Active Game Forfeit Handling

**Feature Branch**: `007-logout-forfeit`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "Feature X. Logout and Active Game Forfeit Handling. Implement backend logout functionality and define gameplay consequences when a user intentionally logs out while participating in an active game session. Extend the specification to include implementation of the related player-facing application behavior."

## Clarifications

### Session 2026-06-22

- Q: When should the application require confirmation before logout? -> A: Require confirmation only when logout would forfeit an active game.
- Q: Which players count when deciding whether a logout forfeit completes a multiplayer game? -> A: Count only non-eliminated players after applying the logout forfeit.
- Q: How should pending attempts be recorded when logout interrupts them? -> A: Mark pending attempts as cancelled and do not count them as failed gameplay actions.
- Q: Can a forfeited player view the forfeited game session after re-authentication? -> A: Block the forfeited player from opening that game session entirely.
- Q: Which authenticated sessions should explicit logout invalidate? -> A: Invalidate only the current session or token used for logout.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Logout Safely Outside Gameplay (Priority: P1)

As an authenticated user, I can explicitly log out so that my active session is no longer usable, without accidental disconnects or browser refreshes being treated as logout.

**Why this priority**: Logout is the entry point for the entire feature and must be reliable before gameplay consequences can be applied.

**Independent Test**: Can be tested by signing in, choosing logout, confirming the session can no longer be used, and confirming refresh or temporary realtime disconnect does not trigger logout.

**Acceptance Scenarios**:

1. **Given** an authenticated user who is not in a lobby or active game, **When** the user explicitly logs out, **Then** the logout completes successfully and the user's active session is invalidated.
2. **Given** an authenticated user with an active browser session, **When** the browser refreshes or temporarily loses realtime connection, **Then** no logout or forfeit is recorded.
3. **Given** a user has logged out, **When** the same session is used for another protected action, **Then** the action is rejected and the user must authenticate again.

---

### User Story 2 - Use Logout From the Application (Priority: P1)

As an authenticated user, I can log out from the visible application shell so that I understand when logout is in progress, when it succeeds, and where I am taken afterward.

**Why this priority**: Backend logout behavior is not useful unless the user can intentionally trigger it from the application and receives clear feedback.

**Independent Test**: Can be tested by signing in from each primary user area, choosing logout, confirming a pending state appears, and verifying the user is returned to an unauthenticated state.

**Acceptance Scenarios**:

1. **Given** an authenticated user is in the lobby, gameplay, question-bank, or another protected area, **When** the user chooses logout, **Then** the application asks for logout through the authenticated session and shows a non-duplicating pending state until the result is known.
2. **Given** logout succeeds, **When** the application receives confirmation, **Then** locally stored authenticated state is cleared, protected views are no longer available, active realtime connections are stopped or ignored, and the user is shown the unauthenticated entry point.
3. **Given** logout cannot be completed because the session is already invalid, **When** the user chooses logout, **Then** the application still clears local authenticated state and shows the unauthenticated entry point without displaying a blocking technical error.
4. **Given** logout fails for a recoverable reason, **When** the user remains authenticated, **Then** the application shows a clear retryable message and does not silently remove the user from the current protected context.
5. **Given** logout would forfeit an active game, **When** the user chooses logout, **Then** the application requires explicit confirmation before sending the logout request.

---

### User Story 3 - Leave Lobby on Logout (Priority: P1)

As a player waiting in a lobby, I can explicitly log out and be removed from the lobby so other players see an accurate lobby state.

**Why this priority**: Lobby membership must stay accurate and must not block other players from starting or filling lobbies.

**Independent Test**: Can be tested by joining a lobby, logging out, and verifying all remaining users see the lobby update.

**Acceptance Scenarios**:

1. **Given** a non-host user is in an active lobby, **When** the user logs out, **Then** the user is removed from the lobby and remaining lobby participants are notified.
2. **Given** the lobby host logs out, **When** there are eligible remaining members, **Then** existing host-transfer rules are applied and the updated lobby is visible to all remaining members.
3. **Given** the lobby host logs out and no eligible member remains, **When** the logout completes, **Then** existing lobby close rules are applied.

---

### User Story 4 - Forfeit Active Two-Player Game (Priority: P1)

As a player in a two-player game, if I explicitly log out, I intentionally forfeit and the remaining player wins immediately.

**Why this priority**: Two-player games cannot continue meaningfully after one player intentionally leaves, and the remaining player needs a clear outcome.

**Independent Test**: Can be tested by starting a two-player game, logging out as one player, and verifying the remaining player is declared the winner.

**Acceptance Scenarios**:

1. **Given** a two-player game is in progress, **When** one player explicitly logs out, **Then** that player is marked eliminated by forfeit and cannot take further actions in that game.
2. **Given** a two-player game is in progress, **When** one player forfeits through logout, **Then** the game is completed, the remaining player is the winner, and the end time is recorded.
3. **Given** the forfeiting player has pieces on the board, **When** the forfeit is applied, **Then** those pieces are removed or disabled so they cannot affect future gameplay.

---

### User Story 5 - Continue Multiplayer Game After Forfeit (Priority: P2)

As a player in a three- or four-player game, if another player logs out, the game continues with the remaining active players and turn order skips the eliminated player.

**Why this priority**: Larger games should not be abandoned when one player intentionally leaves.

**Independent Test**: Can be tested by starting a three- or four-player game, logging out one player, and verifying turn order and game continuation.

**Acceptance Scenarios**:

1. **Given** a three- or four-player game is in progress, **When** one player logs out, **Then** the player is eliminated by forfeit and the game continues with non-eliminated players.
2. **Given** the forfeiting player has the current turn, **When** forfeit is applied, **Then** the turn advances to the next non-eliminated player.
3. **Given** only one non-eliminated player remains after logout, **When** forfeit is applied, **Then** the game is completed and that remaining player is the winner.

---

### User Story 6 - Cancel Pending Attempt on Forfeit (Priority: P2)

As any remaining player, I need pending conquest, battle, or special-field attempts by a forfeiting player to be cancelled so the board does not change after the player leaves.

**Why this priority**: Pending attempts can otherwise leave the game blocked or mutate board state after the actor has forfeited.

**Independent Test**: Can be tested by starting each attempt type, logging out before resolution, and confirming no move, capture, or ownership transfer occurs.

**Acceptance Scenarios**:

1. **Given** a player has a pending conquest attempt, **When** the player logs out, **Then** the attempt is cancelled and the target tile ownership and piece positions remain unchanged.
2. **Given** a player has a pending battle attempt, **When** the player logs out, **Then** the attempt is cancelled, no piece is captured, and no piece level changes.
3. **Given** a player has a pending special-field attempt, **When** the player logs out, **Then** the attempt is cancelled and the special field owner remains unchanged.
4. **Given** a pending attempt is cancelled because of logout, **When** audit and gameplay outcomes are reviewed, **Then** the attempt is not counted as a failed answer or failed gameplay action.

---

### User Story 7 - See Forfeit Outcomes in the Application (Priority: P2)

As a remaining player, I need the game screen to update when another player logs out so I can immediately understand who forfeited, whose turn is next, and whether the game is complete.

**Why this priority**: The gameplay experience must stay consistent for connected players after a forfeit; otherwise users may keep seeing stale pieces or blocked turns.

**Independent Test**: Can be tested by starting two-player and multiplayer games in separate user sessions, logging out as one player, and verifying all remaining player screens update without manual refresh.

**Acceptance Scenarios**:

1. **Given** a remaining player is viewing an active game, **When** another player forfeits through logout, **Then** the game board, player list, turn indicator, disabled pieces, and available actions update without requiring manual refresh.
2. **Given** logout completes a two-player game, **When** the remaining player receives the update, **Then** the application shows the win outcome and prevents additional gameplay actions for the completed session.
3. **Given** logout eliminates a player in a three- or four-player game, **When** the game continues, **Then** the eliminated player is shown as inactive or forfeited and the remaining player whose turn is next can act.
4. **Given** the logging-out player had a pending attempt dialog or question flow open, **When** logout consequences are applied, **Then** remaining players do not see stale pending action prompts and the board reflects the unchanged pre-attempt state.

---

### User Story 8 - Notify and Audit Logout Outcomes (Priority: P2)

As a player or operator, I need logout, forfeit, turn, and game-completion outcomes to be visible in real time and auditable later.

**Why this priority**: Remaining players need immediate feedback, and operators need a reliable record for disputes, ranking, and support.

**Independent Test**: Can be tested by logging out from each participation state and verifying realtime updates and audit records.

**Acceptance Scenarios**:

1. **Given** a user logs out while in a lobby or game, **When** the logout consequences are applied, **Then** affected connected users receive updated state.
2. **Given** logout causes a player forfeit, **When** the operation completes, **Then** an audit record includes the user, timestamp, affected lobby or game, forfeit result, winner when applicable, and any pending attempt cancellation.
3. **Given** logout completes a game with rankings enabled, **When** the winner is determined, **Then** the ranking outcome is queued or recorded according to existing ranking rules.

### Edge Cases

- Logout occurs when the user is authenticated but has no active lobby or game participation.
- Logout occurs while the user is lobby host and multiple eligible replacement hosts exist.
- Logout occurs while the user is both in an active lobby and an active game reference due to stale state; the active game consequence takes precedence and stale lobby membership is cleaned up if present.
- Logout occurs while the user's current turn is active and there is a pending unanswered question.
- Logout occurs after the user has partially progressed through a pending conquest, battle, or special-field attempt; the attempt is cancelled and does not count as a failed gameplay action.
- Logout occurs while the user's current turn is active but no pending attempt exists.
- Logout occurs after the game has already completed or the lobby has already closed.
- Two users attempt to log out from the same game at nearly the same time.
- Logout occurs in a multiplayer game that already has previously eliminated players; completion is evaluated only after the logging-out player is eliminated.
- Remaining players reconnect after the forfeit event and need the latest authoritative session state.
- Duplicate logout requests are received for the same user session.
- A temporary network disconnect, page reload, or realtime reconnection occurs and must not create logout, elimination, or audit records.
- The user chooses logout from different protected areas, including lobby, active game, completed game, and staff-only management screens.
- The user chooses logout while in an active game and dismisses the confirmation; no logout or forfeit is applied.
- The logout request is submitted more than once because the user clicks repeatedly or uses the keyboard repeatedly while the first logout is pending.
- Logout succeeds but the application still has stale local player, lobby, or game state cached from before logout.
- A remaining player's screen is open while another player forfeits, but the realtime update arrives before or after the next manual state refresh.
- A forfeited user's browser remains open on an old game screen after logout and attempts another gameplay action.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated user to explicitly log out.
- **FR-002**: Logout MUST invalidate the current session or token used for logout so it cannot be used for protected actions after logout.
- **FR-003**: Logout MUST be triggered only by explicit user action; network disconnects, browser refreshes, and temporary realtime disconnects MUST NOT count as logout.
- **FR-004**: Logout MUST complete successfully when the user is not participating in any active lobby or active game.
- **FR-005**: On logout, the system MUST check whether the user is participating in an active lobby.
- **FR-006**: If the user is only in an active lobby, the system MUST remove the user from that lobby.
- **FR-007**: If the logging-out user is the lobby host, the system MUST apply existing host-transfer or lobby-close rules.
- **FR-008**: On logout, the system MUST check whether the user is participating in an active game session.
- **FR-009**: If the user is participating in an active game session, logout MUST be treated as an intentional forfeit.
- **FR-010**: A forfeiting game player MUST be marked eliminated and unable to take further actions in that game.
- **FR-011**: The forfeit outcome MUST record the elimination timestamp and reason.
- **FR-012**: A forfeiting player's active pieces MUST be removed from active play or otherwise disabled so they cannot be moved, captured, or used for ownership changes after forfeit.
- **FR-013**: If a two-player game is active when one player forfeits, the system MUST complete the game immediately.
- **FR-014**: In a completed two-player forfeit game, the forfeiting player MUST receive the loss and the remaining player MUST be set as winner.
- **FR-015**: When a game completes due to forfeit, the system MUST record the completion time.
- **FR-016**: In a three- or four-player game, logout MUST eliminate only the forfeiting player and continue the game with remaining non-eliminated players.
- **FR-017**: Turn order MUST skip eliminated players.
- **FR-018**: If the forfeiting player had the current turn, the system MUST advance the turn to the next non-eliminated player.
- **FR-019**: If only one non-eliminated player remains after forfeit, the system MUST complete the game and set that remaining player as winner.
- **FR-019a**: Multiplayer completion after logout MUST be evaluated by counting only players who remain non-eliminated after the logout forfeit is applied.
- **FR-020**: If the forfeiting player has a pending conquest, battle, or special-field attempt, the system MUST cancel the attempt before applying final forfeit outcome.
- **FR-021**: Cancelled pending attempts caused by logout MUST preserve the pre-attempt gameplay state, including no piece movement, capture, level change, ownership transfer, failed answer count, or failed gameplay-action count.
- **FR-022**: Remaining lobby members and game participants MUST receive realtime updates for logout-related lobby changes, player forfeit, player elimination, turn advancement, and game completion when applicable.
- **FR-023**: Reconnecting participants MUST receive an authoritative state that reflects the forfeit and any resulting lobby or game completion.
- **FR-024**: Logout and forfeit handling MUST create audit records including timestamp, user, affected lobby, affected game, pending attempt cancellation, winner when applicable, and final outcome.
- **FR-025**: Audit and logging MUST NOT expose sensitive authentication token values.
- **FR-026**: If ranking or scoring already exists for completed games, forfeit-completed games MUST trigger the existing ranking or scoring outcome process.
- **FR-027**: Duplicate logout requests for the same already-logged-out session MUST be safe and MUST NOT duplicate forfeit, ranking, or audit outcomes.
- **FR-028**: Gameplay-affecting behavior MUST remain authoritative; any pending user-facing state MUST be reconciled from confirmed system responses or realtime updates.
- **FR-029**: Logout and gameplay update data MUST be represented consistently across user-facing screens so stale or invalid local state is not shown as actionable.
- **FR-030**: Interactive logout controls MUST include keyboard operation, accessible labels, visible focus states, and screen-reader-friendly status updates where relevant.
- **FR-031**: The application MUST provide an explicit logout control from every protected user area where a signed-in user can reasonably remain active.
- **FR-032**: When logout is requested, the application MUST prevent duplicate logout submissions while the first request is pending.
- **FR-033**: While logout is pending, the application MUST show user-facing progress feedback without blocking assistive technology users from understanding the current state.
- **FR-034**: After successful logout, the application MUST clear local authenticated state, participant identity, lobby state, game state, pending attempt state, and protected navigation state that belong to the logged-out user.
- **FR-035**: After successful logout, the application MUST route the user to an unauthenticated entry point and prevent protected views from rendering until the user authenticates again.
- **FR-036**: If logout reports that the session is already invalid, the application MUST treat the user as logged out locally and route to an unauthenticated entry point.
- **FR-037**: If logout fails while the session remains valid, the application MUST keep the user in the current protected context and show a retryable error message.
- **FR-038**: Remaining players' game screens MUST update player status, active pieces, current turn, pending attempt prompts, available actions, and game outcome after a logout-forfeit event without requiring manual refresh.
- **FR-039**: If realtime logout-forfeit updates are missed or delayed, the next loaded game or lobby state MUST reconcile the application to the authoritative outcome and remove stale actions.
- **FR-040**: A forfeited user's still-open game screen MUST not allow further gameplay actions after logout or after receiving a state update that marks the player eliminated.
- **FR-041**: If logout would forfeit an active game, the application MUST require explicit user confirmation before submitting logout.
- **FR-042**: If the user dismisses an active-game logout confirmation, the application MUST leave the user authenticated and MUST NOT apply logout, lobby removal, or forfeit consequences.
- **FR-043**: After re-authentication, a forfeited player MUST be blocked from opening the forfeited game session.
- **FR-044**: When a forfeited player attempts to open the forfeited game session after re-authentication, the application MUST show a clear access-denied or forfeited-session message and MUST NOT render gameplay actions.
- **FR-045**: Explicit logout MUST NOT invalidate the same user's other active sessions unless a separate logout-all feature is introduced.

### Key Entities

- **User Session**: Represents one authenticated access instance for a user. Key attributes include user identity, session validity, logout timestamp, and revocation state for that specific session.
- **Lobby Participation**: Represents a user's membership in an active lobby. Key attributes include lobby id, user id, host status, and membership status.
- **Game Session**: Represents an active or completed game. Key attributes include current status, current turn player, participating players, winner, completion time, and turn number.
- **Game Player**: Represents a user's player identity within a game. Key attributes include player id, user id, player order, elimination status, elimination timestamp, and elimination reason.
- **Piece**: Represents a player's board piece. Key attributes include owner, current tile when active, level, captured state, and active/inactive status.
- **Pending Attempt**: Represents an unresolved conquest, battle, or special-field action. Key attributes include attempt type, acting player, source tile, target tile, status, progress, and cancellation outcome.
- **Logout Audit Record**: Represents the durable record of logout consequences. Key attributes include timestamp, user id, affected lobby id, affected game session id, forfeit status, pending attempt cancellation, and winner when applicable.
- **Application Auth State**: Represents what the signed-in application currently believes about the user's authenticated status. Key attributes include signed-in status, user identity, protected-area access, pending logout status, and last logout outcome.
- **Visible Game State**: Represents the game state shown to a player on screen. Key attributes include board pieces, player statuses, turn indicator, pending prompt visibility, available actions, completion status, and winner display.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of explicit logout attempts by authenticated users return a clear success or already-logged-out outcome.
- **SC-002**: 100% of protected actions using a logged-out session are rejected after logout completes.
- **SC-003**: In two-player active games, logout determines the remaining winner and completes the game within 2 seconds under normal operating conditions.
- **SC-004**: In three- or four-player active games, logout removes the forfeiting player from turn eligibility and advances turn when needed within 2 seconds under normal operating conditions.
- **SC-005**: 100% of logout-forfeit cases with pending conquest, battle, or special-field attempts leave board position, tile ownership, captures, and levels unchanged from before the pending attempt.
- **SC-006**: 100% of remaining connected participants receive a visible lobby or game state update after logout consequences are applied.
- **SC-007**: 100% of logout-forfeit outcomes produce an audit record with user, timestamp, affected session context, and final outcome.
- **SC-008**: No logout, forfeit, elimination, or audit record is created from browser refresh, temporary network loss, or temporary realtime disconnect in test scenarios.
- **SC-009**: Reconnecting users see an authoritative snapshot reflecting logout, elimination, turn, and completion state with no stale active-player actions available.
- **SC-010**: The primary logout flow can be completed with keyboard-only input and announces completion or required re-authentication status to assistive technologies.
- **SC-011**: In 100% of protected user areas, a signed-in user can intentionally start logout without needing to navigate to a separate hidden page.
- **SC-012**: Duplicate logout activation during a pending logout produces no duplicate user-facing requests, duplicate audit outcomes, or conflicting navigation.
- **SC-013**: After logout success or already-invalid-session response, protected application content is no longer visible to the logged-out user within 1 second under normal operating conditions.
- **SC-014**: In connected two-player and multiplayer test sessions, remaining player screens reflect forfeit, turn, board, and game-completion changes within 2 seconds under normal operating conditions without manual refresh.

## Assumptions

- Existing authentication and authorization behavior will be reused, and logout will extend that behavior rather than introduce a separate identity system.
- Explicit logout applies only to the current authenticated session or token used to perform logout, not to other active sessions for the same user.
- "Explicit logout" means a user-selected logout command from the application or an authenticated logout request sent on the user's behalf.
- Existing lobby host-transfer and lobby-close rules remain authoritative and are not redefined by this feature.
- Pending attempts cancelled due to logout use the cancellation outcome, not a failed answer or failed gameplay outcome.
- Forfeit is irreversible for the affected game session.
- Players eliminated by logout forfeit cannot view the forfeited game session after re-authentication; they must see a clear blocked-access outcome instead.
- Ranking or scoring updates are required only when the existing product has ranking/scoring behavior available for completed games.
- This feature covers intentional logout consequences, not inactivity timers or automatic disconnected-player forfeits.
- The player-facing application already has protected areas, local authenticated state, and gameplay/lobby screens that can be updated to consume logout and forfeit outcomes.
- Staff users who enter management screens are still authenticated users and need the same logout behavior as players, even when no lobby or game participation exists.
