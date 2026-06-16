# Feature Specification: Lobby View, Start, and Manage

**Feature Branch**: `002-lobby-manage`

**Created**: 2026-06-07

**Status**: Draft

**Input**: User description: "Implement the authenticated frontend lobby experience where users can create a lobby, join by code, view lobby members, leave a lobby, cancel a lobby as host, and start a game when the lobby is valid. Backend lobby rules include authenticated access, unique join codes, max 4 players, min 2 players to start, host-only start/cancel, host transfer on leave, automatic close when empty, and realtime broadcasts for lobby changes."

## Clarifications

### Session 2026-06-16

- Q: How should the frontend handle an authenticated user who already has another active lobby when they try to create or join? -> A: Show the existing active lobby and navigate the user to it.
- Q: What should happen after the host successfully starts a valid lobby? -> A: Automatically navigate to the game session.
- Q: What should happen after the host successfully cancels a lobby? -> A: Navigate back to lobby landing with cancellation feedback.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Lobby as Authenticated User (Priority: P1)

An authenticated user opens the lobby landing view, creates a new lobby, sees the lobby code,
and enters the lobby room where members and lobby status are visible.

**Why this priority**: Lobby creation is the minimum path that lets one player host a
multiplayer session and invite others.

**Independent Test**: A tester signs in, creates a lobby with an allowed player limit, lands
in the lobby room, sees the lobby code, host identity, player count, status, expiration time,
and copy-code action.

**Acceptance Scenarios**:

1. **Given** an authenticated user is on the lobby landing view, **When** they create a lobby with an allowed player limit, **Then** they enter a lobby room showing the code, status, host, player list, max players, and expiration time.
2. **Given** a lobby has been created, **When** the host uses the copy-code action, **Then** the invite code is copied or clear feedback explains why it could not be copied.
3. **Given** lobby creation is in progress, **When** the user waits for completion, **Then** loading feedback is visible and duplicate creation is blocked.

---

### User Story 2 - Join Lobby by Code (Priority: P2)

An authenticated user enters an invite code, joins an open lobby, and sees the current lobby
state without needing a page refresh.

**Why this priority**: Joining by code is the core guest flow required for multiplayer.

**Independent Test**: A tester signs in as a non-host user, enters a mixed-case lobby code,
confirms it is normalized, joins successfully, and sees the lobby room with read-only
non-host actions.

**Acceptance Scenarios**:

1. **Given** an authenticated user enters a valid lobby code, **When** they submit the join form, **Then** the code is normalized and they enter the matching lobby room.
2. **Given** the join code field is empty, **When** the user submits the join form, **Then** field-level validation appears and no join attempt is made.
3. **Given** the user is not the host, **When** they view the lobby room, **Then** start and cancel actions are not available to them and the leave action remains available.

---

### User Story 3 - Manage Lobby as Host (Priority: P3)

The host can manage an open lobby, cancel it, or start the game only when the lobby satisfies
the start rules.

**Why this priority**: Host management turns the waiting room into a controlled game start
experience and prevents invalid sessions.

**Independent Test**: A tester signs in as host, verifies start is disabled with fewer than
two players, sees it enabled with two to four players in an open, unexpired lobby, starts the
lobby, and is automatically taken to the game session.

**Acceptance Scenarios**:

1. **Given** the host is in an open lobby with fewer than two players, **When** they view actions, **Then** start is disabled with an understandable reason.
2. **Given** the host is in an open, unexpired lobby with two to four players, **When** they start the lobby, **Then** the lobby enters started state and the user is automatically taken to the game session.
3. **Given** the host cancels an open lobby, **When** cancellation succeeds, **Then** the user returns to the lobby landing view with cancellation feedback.

---

### User Story 4 - Stay Updated Through Lobby Events (Priority: P4)

Lobby participants see player, host, status, and start changes as they happen without manual
refresh.

**Why this priority**: Multiplayer lobbies rely on shared state; users need confidence that
the room they see matches the authoritative backend state.

**Independent Test**: A tester simulates lobby updates for player join, player leave, host
change, lobby cancellation, lobby close, and lobby start; the lobby room updates visibly and
announces meaningful changes.

**Acceptance Scenarios**:

1. **Given** a participant is viewing a lobby, **When** another player joins or leaves, **Then** the player list and count update and the change is announced.
2. **Given** the host changes, **When** the update is received, **Then** the host badge moves to the new host.
3. **Given** the lobby starts, **When** the start update is received, **Then** the user is automatically taken to the game session or shown a clear recovery action if navigation fails.

### Edge Cases

- A user attempts to create or join a lobby while not authenticated.
- A user submits an empty or whitespace-only lobby code.
- A user enters a lobby code with lowercase letters or surrounding whitespace.
- A lobby is full.
- A lobby is not found.
- A lobby has already started, closed, cancelled, or expired.
- A user is already in the same lobby or another active lobby.
- The backend reports that the user already has an active lobby while creating or joining; the frontend shows that existing lobby and navigates the user to it.
- A non-host attempts to start or cancel a lobby.
- A host leaves and host ownership transfers.
- The last player leaves and the lobby closes automatically.
- A start request is pending while another event changes lobby status.
- A realtime connection drops, reconnects, or receives duplicate/out-of-order updates.
- The lobby is started but automatic navigation to the game session fails.
- The lobby is cancelled while participants are viewing it.
- The copy-code action is unavailable or denied by the browser.
- Lobby controls are used with keyboard-only input and assistive technology.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST require authenticated state before users can create, join, read, leave, cancel, or start lobbies.
- **FR-002**: The lobby landing view MUST show create-lobby and join-lobby actions, loading feedback, and centralized error feedback.
- **FR-003**: Users MUST be able to create a lobby with an allowed maximum player count of 2, 3, or 4, defaulting to 4.
- **FR-004**: After successful lobby creation, the system MUST store the current lobby state and show the lobby room.
- **FR-005**: Users MUST be able to join an open lobby by code.
- **FR-006**: Join codes MUST be trimmed and normalized to uppercase before submission.
- **FR-007**: Empty join codes MUST show validation feedback and MUST NOT submit a join request.
- **FR-007a**: When a create or join attempt reveals that the current user already has an active lobby, the system MUST show that lobby and navigate the user to its lobby room.
- **FR-008**: The lobby room MUST display lobby code, status, player count, maximum players, player list, host indicator, expiration time, and connection status.
- **FR-009**: Users MUST be able to copy the lobby code and receive success or failure feedback.
- **FR-010**: The current user MUST be visually identified in the player list when identity data is available.
- **FR-011**: The host MUST be visually identified.
- **FR-012**: Only the host MUST be able to see or use start and cancel actions.
- **FR-013**: Non-host players MUST see read-only lobby status and a leave action.
- **FR-014**: Any participant MUST be able to leave an open lobby.
- **FR-015**: After the current user leaves, the system MUST clear current lobby state and return them to the lobby landing view.
- **FR-016**: If the lobby closes automatically after leaving, the system MUST show user-facing feedback.
- **FR-017**: The host MUST be able to cancel an open lobby.
- **FR-018**: After successful cancellation, the system MUST update lobby status, navigate the current user back to the lobby landing view, and show cancellation feedback.
- **FR-019**: The host MUST be able to start an open, unexpired lobby only when two to four players are present.
- **FR-020**: Start MUST be disabled when fewer than two players are present, more than four players are present, the current user is not host, the lobby is not open, the lobby is expired, or a start request is pending.
- **FR-021**: On successful start, the system MUST preserve the returned session handoff data and automatically navigate the user to the game session.
- **FR-022**: The frontend MUST display expiration time and treat expired lobbies as not startable while relying on backend responses as authoritative.
- **FR-023**: Lobby state MUST update from authoritative API responses and realtime lobby events.
- **FR-024**: Realtime lobby connection logic MUST be centralized and MUST NOT live inside presentational components.
- **FR-025**: Realtime updates MUST handle player joined, player left, lobby started, lobby closed, lobby cancelled, and host changed when provided.
- **FR-026**: Loading state MUST appear for create, join, read, leave, cancel, and start operations and MUST clear on success or failure.
- **FR-027**: Buttons MUST prevent duplicate submissions while the related operation is pending.
- **FR-028**: API and network errors MUST route through centralized error handling.
- **FR-029**: Common lobby errors MUST appear as non-blocking messages by default.
- **FR-030**: Blocking lobby states such as cancellation, closure, lost access, or failed game handoff MAY use modal display.
- **FR-031**: All lobby API calls MUST use the configured backend base URL and authenticated bearer access.
- **FR-032**: Browser credentials MUST remain omitted unless a backend environment explicitly allows and requires credentialed browser requests.
- **FR-033**: Lobby API payloads and realtime payloads MUST be mapped into frontend domain models before UI consumption.
- **FR-034**: The lobby UI MUST follow the shared dark blue and white visual design system and MUST NOT rely on browser-default form or button styling.
- **FR-035**: Lobby controls MUST provide accessible labels, visible focus states, disabled reasons where practical, and screen-reader-understandable status changes.
- **FR-036**: Player join, leave, host, and status updates MUST be announced through an appropriate live region.
- **FR-037**: Modal dialogs MUST trap focus and support Escape close where safe.
- **FR-038**: The feature MUST NOT implement gameplay board rendering, quiz question flow, game session board state, in-lobby chat, public lobby browsing, friend invites, ready-checks unless required by backend contract, or profile display names unless already available from auth/user context.

### Key Entities *(include if feature involves data)*

- **Lobby**: A multiplayer waiting room with an id, invite code, host, status, player limit, expiration, timestamps, and players.
- **Lobby Player**: A user currently associated with a lobby, including their identity and join time.
- **Lobby Status**: The authoritative lifecycle state of a lobby: open, started, closed, or cancelled.
- **Lobby Action Result**: The outcome of create, join, leave, cancel, or start operations, including updated lobby state and any game-session handoff data.
- **Realtime Lobby Event**: An authoritative update indicating player, host, status, or start changes.
- **Connection State**: The user's current ability to receive realtime lobby updates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of authenticated users can create a lobby and see its lobby room in under 5 seconds under normal network conditions.
- **SC-002**: 95% of authenticated users can join an existing lobby by valid code in under 5 seconds under normal network conditions.
- **SC-003**: 100% of empty join-code submissions show validation feedback without attempting to join.
- **SC-004**: 100% of host-only start and cancel controls are hidden or disabled for non-host users.
- **SC-005**: 100% of start attempts from the UI are blocked unless the user is host and the lobby is open, unexpired, and has two to four players.
- **SC-006**: 100% of successful player join/leave realtime events update the visible player list without a page refresh.
- **SC-007**: 100% of expired lobbies shown in the UI disable the start action.
- **SC-008**: A keyboard-only user can create a lobby, join a lobby, copy a code, leave a lobby, and operate available host actions.
- **SC-009**: Lobby API and network errors produce a user-facing toast or modal message in 100% of covered error scenarios.
- **SC-010**: 100% of lobby API calls use authenticated access and omit browser credentials by default.

## Assumptions

- Users already have authenticated frontend state from the authentication foundation.
- The authenticated user identity includes or can derive a stable user id for host/current-player checks.
- The backend remains authoritative for lobby validity, start eligibility, membership, host transfer, expiration, and closure.
- The default lobby route is `/lobby`, lobby rooms use a lobby id route, and successful starts automatically navigate users to a game-session route.
- Realtime lobby events may arrive after initial lobby details are loaded and must reconcile with the latest known lobby state.
- Display names are not required unless already available from existing auth or user context.
- Browser credentialed requests remain disabled by default.
- Backend responses for active-lobby conflicts include enough information to identify or retrieve the existing active lobby.
