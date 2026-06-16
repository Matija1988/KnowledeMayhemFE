# Feature Specification: Game Session & Board

**Feature Branch**: `003-game-session-board`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "Implement the first playable game screen after a lobby starts. The frontend must render the server-created game session, display the deterministic board, show players and turn state, allow the current player to move one of their pieces, and update the UI from authoritative backend responses and SignalR events. Backend gameplay endpoints and game realtime hub contracts are provided for session reads, moves, turn state, and future conquest/question flows."

## Clarifications

### Session 2026-06-16

- Q: Should Feature 3 include a standalone End Turn control, or should successful movement be the only way to advance turns? -> A: No standalone End Turn control; successful movement advances turn automatically.
- Q: What should the player see if the backend sends an internally inconsistent board snapshot? -> A: Show a blocking error and prevent movement until a valid snapshot is loaded.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Started Game Session (Priority: P1)

A player who starts or joins a game session opens the game screen and sees the current
authoritative session state, including the board, players, pieces, turn number, current turn,
game status, and connection state.

**Why this priority**: The game screen is the first playable surface after the lobby flow and
must reliably show the backend-created board before any interaction can be trusted.

**Independent Test**: A tester signs in, opens a valid game session route, and verifies that
the board dimensions, tiles, pieces, player order, current turn, game status, and loading/error
states match the returned session state.

**Acceptance Scenarios**:

1. **Given** an authenticated session participant has a valid game session id, **When** they open the game screen, **Then** the current game state is loaded and displayed.
2. **Given** the backend returns board dimensions, tiles, and pieces, **When** the board renders, **Then** every tile appears at its backend-provided coordinate and every active piece appears on its current tile.
3. **Given** game state is loading, unavailable, or internally inconsistent, **When** the user opens the game screen, **Then** loading or centralized blocking error feedback appears without showing stale or partial board state.

---

### User Story 2 - Understand Board, Players, and Turn State (Priority: P2)

A player can understand whose turn it is, which pieces belong to which players, which player
they are, what tile ownership exists, and which tiles are blocked or occupied.

**Why this priority**: Players need clear board and turn context before movement can be
usable, fair, or accessible.

**Independent Test**: A tester views a populated game state and verifies player panel order,
current-player marker, current-turn indicator, piece ownership, piece levels, tile ownership,
blocked/occupied states, and non-color-only indicators.

**Acceptance Scenarios**:

1. **Given** the game has multiple players, **When** the player panel renders, **Then** players appear in deterministic player order with current-player and eliminated/captured information where present.
2. **Given** tiles have ownership, blocked, occupied, selected, or valid-target states, **When** the board renders, **Then** each state is visually and accessibly distinguishable without relying on color alone.
3. **Given** the turn changes, **When** the new turn state is displayed or received, **Then** the turn indicator and screen-reader announcement identify the current turn player and turn number.

---

### User Story 3 - Move Own Piece on Turn (Priority: P3)

The current player can select one of their own uncaptured pieces, see orthogonally adjacent
candidate targets, submit a move, and see the board update only after backend confirmation.

**Why this priority**: Movement is the first playable action and must preserve
server-authoritative gameplay correctness.

**Independent Test**: A tester signs in as the current turn player, selects their own piece,
verifies only legal adjacent helper targets are highlighted, submits a legal move, and confirms
the piece position, tile ownership, current turn, and turn number update from the authoritative
response or realtime event.

**Acceptance Scenarios**:

1. **Given** it is the current user's turn and they have an uncaptured piece, **When** they select that piece, **Then** orthogonally adjacent unblocked and unoccupied candidate targets are highlighted.
2. **Given** a candidate target is selected, **When** the move request is submitted, **Then** pending move feedback appears and duplicate move submission is blocked.
3. **Given** the backend confirms the move, **When** the response or realtime event is applied, **Then** selected state is cleared, the board updates, ownership changes are shown when present, and the displayed turn advances.

---

### User Story 4 - Reject Invalid or Unauthorized Movement (Priority: P4)

Players are prevented from attempting clearly invalid moves and receive centralized feedback
when the backend rejects a move.

**Why this priority**: Invalid movement handling protects game fairness and helps players
recover without guessing what went wrong.

**Independent Test**: A tester attempts to move while not current turn, select another
player's piece, move a captured piece, target a diagonal, blocked, occupied, or missing tile,
and verifies that either the frontend helper blocks the attempt or backend rejection is shown
through centralized feedback.

**Acceptance Scenarios**:

1. **Given** it is not the current user's turn, **When** they view the board, **Then** their move controls are disabled or unavailable with understandable feedback.
2. **Given** a user selects another player's piece or a captured piece, **When** they attempt movement, **Then** no move is submitted and clear feedback explains why.
3. **Given** the backend rejects a move, **When** the error is returned, **Then** a centralized toast or blocking modal appears based on severity and no durable board state is changed locally.

---

### User Story 5 - Stay Updated Through Game Events (Priority: P5)

Session participants see move, ownership, turn, status, completion, cancellation, and reconnect
updates without manual refresh.

**Why this priority**: Multiplayer gameplay needs all participants to converge on the same
authoritative state.

**Independent Test**: A tester simulates move executed, tile ownership changed, turn advanced,
game completed, game cancelled, connection loss, reconnect, duplicate events, and stale events;
the store and UI update only from authoritative snapshots or accepted event payloads.

**Acceptance Scenarios**:

1. **Given** a participant is viewing a game, **When** a move executed event arrives, **Then** the board, pieces, ownership, and turn state update consistently.
2. **Given** the realtime connection reconnects, **When** the client resumes updates, **Then** it refreshes or receives an authoritative session snapshot before trusting stale state.
3. **Given** the game is completed or cancelled, **When** that state is received, **Then** the game status is shown as blocking state and further moves are unavailable.

### Edge Cases

- A logged-out user opens a game route.
- An authenticated user opens a game session they do not participate in.
- The game session is not found, unavailable, completed, or cancelled.
- The backend returns a board with missing, duplicate, or out-of-bounds tile coordinates; the player sees a blocking error and movement stays unavailable until a valid snapshot loads.
- A tile references an occupying piece that is missing from the piece list; the player sees a blocking error and movement stays unavailable until a valid snapshot loads.
- A piece references a missing tile; the player sees a blocking error and movement stays unavailable until a valid snapshot loads.
- A player list has eliminated players or missing display names.
- The current user id cannot be derived from authenticated state.
- The current user is not the current turn player.
- The current user attempts to select another player's piece.
- A selected piece becomes captured, moved, or invalid because a newer authoritative update arrives.
- A target tile is diagonal, more than one tile away, blocked, occupied, missing, or no longer valid.
- A move request is pending while a SignalR event changes board or turn state.
- A move response succeeds but a later SignalR event carries a newer authoritative snapshot.
- The realtime connection drops, reconnects, receives duplicate events, or receives out-of-order events.
- The game hub cannot connect because of CORS, authentication, or network failure.
- Keyboard-only and assistive-technology users need to inspect board state, select pieces, choose targets, and hear turn/move/status changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST require authenticated session participation before showing a game session.
- **FR-002**: The game screen MUST load and display the authoritative game session for the route session id.
- **FR-003**: The game screen MUST show game status, turn number, current turn player, connection status, loading state, and centralized error state.
- **FR-004**: The board MUST render using backend-provided board width, board height, tile coordinates, tiles, and pieces.
- **FR-005**: The frontend MUST NOT generate board layout, infer missing tiles, or commit durable gameplay state independently of backend responses or realtime events.
- **FR-005a**: If an authoritative board snapshot is internally inconsistent, the game screen MUST show a blocking error, prevent movement, and wait for a valid authoritative snapshot instead of rendering a partial playable board.
- **FR-006**: Tiles MUST show tile type, ownership, question category indicator, occupied state, selected state, valid-target hint, and blocked state where applicable.
- **FR-007**: Tile state MUST be understandable without relying on color alone.
- **FR-008**: Pieces MUST show owner identity, level, captured state, current position, current-user ownership, and whether the piece is selectable.
- **FR-009**: The player panel MUST show players in deterministic order with current-player and eliminated indicators when present.
- **FR-010**: The current turn indicator MUST identify the current turn player and turn number.
- **FR-011**: The current user MUST be able to select one of their own uncaptured pieces only when it is their turn and the game is in progress.
- **FR-012**: The frontend helper MUST highlight only orthogonally adjacent target tiles for the selected piece.
- **FR-013**: The frontend helper MUST NOT treat diagonal, multi-tile, blocked, occupied, missing, or jumping targets as valid candidate moves.
- **FR-014**: Submitting a move MUST send the selected piece and target coordinate to the backend using authenticated access.
- **FR-015**: Pending move state MUST prevent duplicate move submission and show move feedback.
- **FR-016**: Successful move confirmation MUST clear selected piece state, clear candidate target hints, update board state, update tile ownership when present, and advance displayed turn state from the authoritative response or event.
- **FR-017**: Illegal or rejected moves MUST show centralized user-facing feedback and MUST NOT change durable board state locally.
- **FR-018**: The feature MUST NOT expose a standalone End Turn or skip-turn control; successful movement is the only user action that advances the turn in this feature.
- **FR-019**: Game API calls MUST use the configured backend base URL, authenticated bearer access, accepted JSON responses, JSON request bodies when needed, and omitted browser credentials by default.
- **FR-020**: Game REST payloads and realtime payloads MUST be mapped into frontend domain models before UI components consume them.
- **FR-021**: Game realtime connection logic MUST be centralized outside presentational components.
- **FR-022**: Game realtime updates MUST handle game session created, game started, move executed, tile ownership changed, turn advanced, game completed, and game cancelled events.
- **FR-023**: Reconnect behavior MUST refresh or receive an authoritative game session snapshot before stale state is trusted.
- **FR-024**: Duplicate or out-of-order realtime events MUST NOT resurrect stale board, turn, completed, or cancelled state.
- **FR-025**: Loading state MUST appear for initial game retrieval, move request, and reconnect snapshot refresh.
- **FR-026**: Common game API and network errors MUST route through centralized error handling.
- **FR-027**: Blocking states such as game cancelled, game completed, session unavailable, malformed board snapshot, or unrecoverable reconnect failure MAY use modal display.
- **FR-028**: The game UI MUST follow the shared dark blue and white visual design system and MUST NOT rely on browser-default styling.
- **FR-029**: The board MUST be keyboard navigable and MUST expose piece selection and target choice by keyboard.
- **FR-030**: Turn changes, move success/failure, connection state, and game status changes MUST be announced through appropriate live regions or equivalent screen-reader-understandable updates.
- **FR-031**: Board and piece rendering SHOULD avoid unnecessary full-board rerenders through derived lookup data, stable component boundaries, or equivalent performance-conscious rendering.
- **FR-032**: The feature MUST NOT implement quiz question conquest, answer validation, capturing, piece leveling, diagonal movement, multi-tile movement, special chess rules, advanced animations, spectator mode, or in-game chat.

### Key Entities *(include if feature involves data)*

- **Game Session**: The authoritative playable session containing status, board dimensions, seed, turn state, timestamps, winner, players, tiles, and pieces.
- **Game Player**: A participant in a game session with user identity, deterministic order, display name, and eliminated state.
- **Board Tile**: A coordinate on the board with category, ownership, occupancy, type, and created timestamp.
- **Piece**: A player's movable unit with owner, current tile, level, captured state, and created timestamp.
- **Move Request**: A request to move one selected piece to a target coordinate during the current player's turn.
- **Turn State**: The current turn player, turn number, and turn lifecycle status.
- **Game Realtime Event**: An authoritative game update such as move executed, ownership changed, turn advanced, completed, cancelled, or session snapshot.
- **Connection State**: The user's current ability to receive game updates and reconnect snapshots.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of authenticated participants can open a valid game session and see board, player, and turn state within 5 seconds under normal network conditions.
- **SC-002**: 100% of rendered boards use backend-provided dimensions and tile coordinates, with no inferred missing tiles.
- **SC-003**: 100% of active, uncaptured pieces are displayed on their backend-provided current tile.
- **SC-004**: 100% of frontend candidate target hints exclude diagonal, multi-tile, blocked, occupied, and missing targets.
- **SC-005**: 100% of submitted move attempts include the selected piece and target coordinate and block duplicate submissions while pending.
- **SC-006**: 100% of successful move confirmations update board, piece, ownership when present, current turn player, and turn number from authoritative state.
- **SC-007**: 100% of illegal move responses produce centralized feedback without committing durable local board changes.
- **SC-008**: 100% of covered realtime move, ownership, turn, completion, cancellation, and reconnect events update the store from authoritative payloads without manual refresh.
- **SC-009**: A keyboard-only user can inspect the board, identify the current turn, select an eligible piece, choose a valid target, and receive move/turn/status feedback.
- **SC-010**: Game API and realtime connection errors produce user-facing toast or modal feedback in all covered error scenarios.

## Assumptions

- Users already have authenticated frontend state from the authentication and lobby features.
- A successful lobby start navigates to `/game/:sessionId`.
- The backend remains authoritative for board generation, player order, turn advancement, movement legality, tile ownership, completion, and cancellation.
- The move endpoint for this feature accepts the selected piece and target coordinate.
- One successful move automatically advances the turn; skip-turn and standalone end-turn UI are deferred to a later feature.
- Starting pieces are level 1 for this feature; level changes are out of scope.
- Question conquest endpoints and events are planned for a later feature and are not exposed as playable UI here.
- Display names are shown when provided by game session state; otherwise stable user/player identifiers may be shown.
- Browser credentialed requests remain disabled by default.
