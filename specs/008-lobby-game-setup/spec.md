# Feature Specification: Lobby Game Setup

**Feature Branch**: `008-lobby-game-setup`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "XI. Lobby Game Setup - Implement game setup configuration inside the lobby before the game session starts. Hosts select categories, players select unique piece colors and readiness, setup is transferred to the game, real-time updates are broadcast, and validation/auditing is required."

## Clarifications

### Session 2026-06-22

- Q: When a new player joins after existing players have selected colors and marked ready, what happens to existing readiness state? -> A: Existing players keep readiness; the new player starts without a color and not ready.
- Q: After a lobby starts a game session, what happens if a selected category is later deactivated in Question Bank? -> A: The game uses the category snapshot captured at start; later category changes do not affect the active game.
- Q: What should happen when a player submits ready or start using a stale lobby setup snapshot? -> A: The backend rejects the stale action; the frontend shows a message and automatically reloads the latest lobby snapshot.
- Q: Must the host also select a color and mark themselves ready before starting the game? -> A: Yes, the host is a player and must have a valid color and ready status before starting.
- Q: If host transfer occurs before game start, what happens to setup state? -> A: Selected categories and player colors are preserved, but readiness resets for all remaining players.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Host Configures Game Categories (Priority: P1)

As a lobby host, I can choose which active question categories will be used in the upcoming game so the session starts with agreed content.

**Why this priority**: A game cannot be started under this feature unless at least one active category is selected, so category setup is the foundation for the rest of the lobby readiness flow.

**Independent Test**: Create an open lobby as host, select one or more active categories, verify all lobby members can see the selected categories, and verify non-host players cannot change them.

**Acceptance Scenarios**:

1. **Given** an open lobby with a host and active categories available, **When** the host selects one or more active categories, **Then** the lobby displays the selected categories to all joined players.
2. **Given** an open lobby with selected categories, **When** a non-host player attempts to modify the category selection, **Then** the change is rejected and the current selection remains unchanged.
3. **Given** an open lobby, **When** the host attempts to select no categories, inactive categories, or categories that do not exist, **Then** the change is rejected with a clear validation message.
4. **Given** players have marked themselves ready, **When** the host changes selected categories, **Then** every player's ready status is reset.

---

### User Story 2 - Players Choose Unique Piece Colors (Priority: P1)

As a joined lobby player, I can choose my own piece color from an allowed list so my pieces are visually distinguishable when the game starts.

**Why this priority**: Player colors are required before readiness and are transferred into gameplay, making them part of the minimum setup needed to start a configured session.

**Independent Test**: Join a lobby as two players, have each player select a different allowed color, verify duplicate and invalid colors are rejected, and verify each player can change only their own color while the lobby is open.

**Acceptance Scenarios**:

1. **Given** an open lobby with joined players, **When** a player selects an allowed unused color, **Then** the lobby displays that color for that player to all lobby members.
2. **Given** another player already selected a color, **When** a player attempts to select the same color, **Then** the selection is rejected and both existing color assignments remain unchanged.
3. **Given** a player selected a valid color and is ready, **When** that player changes color while the lobby is open, **Then** only that player's ready status is reset.
4. **Given** the lobby has started or closed, **When** a player attempts to change color, **Then** the change is rejected.

---

### User Story 3 - Players Mark Readiness and Host Starts (Priority: P1)

As lobby participants, each player can mark themselves ready after choosing a valid color, and the host can start only when all setup requirements are satisfied.

**Why this priority**: Readiness gates the game start and prevents incomplete or unfair setup from entering gameplay.

**Independent Test**: Configure categories, have all players choose unique colors and mark ready, then verify the host can start the game; repeat with each missing requirement and verify start is blocked.

**Acceptance Scenarios**:

1. **Given** a player has not selected a valid color, **When** the player attempts to mark ready, **Then** readiness is rejected with a clear message.
2. **Given** the host has not selected at least one active category, **When** all players attempt to become ready or the host attempts to start, **Then** the lobby cannot become ready to start.
3. **Given** an open, unexpired lobby with 2 to 4 players, at least one active category selected, all players including the host with unique valid colors, and all players including the host ready, **When** the host starts the game, **Then** the game session starts successfully.
4. **Given** one or more setup requirements are missing, **When** the host attempts to start, **Then** start is rejected and the lobby remains open.
5. **Given** the host has a stale lobby setup snapshot, **When** the host attempts to start the game, **Then** the action is rejected, the latest lobby setup is loaded, and the host sees a clear message.

---

### User Story 4 - Setup Transfers Into Gameplay (Priority: P2)

As a player, when the configured lobby starts a game, the game uses the selected categories and each player's selected piece color.

**Why this priority**: Setup value is only complete if it becomes authoritative gameplay state and remains consistent for all players after start.

**Independent Test**: Start a configured lobby, inspect the resulting game session, and verify selected categories are the only categories available for generated board content and each game player carries the selected color.

**Acceptance Scenarios**:

1. **Given** a lobby with selected categories, **When** the game starts, **Then** the created game session records the same selected categories.
2. **Given** players selected unique colors in the lobby, **When** the game starts, **Then** each game player has the same piece color selected in the lobby.
3. **Given** a configured game has started, **When** the board content is generated, **Then** playable category assignments come only from the selected active categories.
4. **Given** a configured game has started, **When** a selected category is later changed or deactivated outside the game, **Then** the active game continues using the category snapshot captured at start.

---

### User Story 5 - Realtime Setup Visibility (Priority: P2)

As any lobby member, I see category, color, readiness, and start eligibility changes without needing to refresh the page.

**Why this priority**: Lobby setup is collaborative; stale setup state causes confusion and failed start attempts.

**Independent Test**: Open the same lobby in two authenticated browser sessions, make setup changes in one session, and verify the other session reflects the changes and start eligibility automatically.

**Acceptance Scenarios**:

1. **Given** multiple players are viewing the same lobby, **When** the host changes categories, **Then** every connected player sees the updated categories and reset readiness state.
2. **Given** multiple players are viewing the same lobby, **When** a player changes color or readiness, **Then** every connected player sees the updated player setup state.
3. **Given** a player reconnects after missing setup updates, **When** the lobby state is reloaded, **Then** the player sees the authoritative setup state.

### Edge Cases

- Host changes selected categories after players are ready; all players become not ready and start is blocked until they confirm readiness again.
- Player changes color after becoming ready; only that player becomes not ready.
- Two players attempt to select the same available color at nearly the same time; only one selection succeeds and all clients reconcile to the same authoritative lobby state.
- A player attempts to mark ready or start the game from stale setup state; the backend rejects the action, the UI shows a clear message, and the latest lobby snapshot is loaded automatically.
- Selected category becomes inactive before game start; the lobby is no longer start-ready and the host must select at least one currently active category.
- A player leaves after selecting a color or becoming ready; their color becomes available and start eligibility is recalculated for remaining players.
- A player joins after other players are ready; existing players keep their readiness, the new player starts without a color and not ready, and start eligibility is recalculated.
- Host transfer occurs before game start; selected categories and remaining player colors are preserved, every remaining player's readiness is reset, and start eligibility is recalculated for the new host.
- Lobby expires while setup is incomplete; category changes, color changes, readiness changes, and game start are rejected.
- Client reconnects or misses setup events; the lobby screen refreshes to the authoritative setup snapshot.
- Keyboard-only users can select categories, choose colors, mark readiness, and start the game; setup status is announced without relying on color alone.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST store a lobby's selected question categories, setup status, setup version, and last setup update time.
- **FR-002**: The system MUST store each lobby player's selected piece color and readiness state.
- **FR-003**: The host MUST be able to select one or more active question categories while the lobby is open and not expired.
- **FR-004**: Non-host lobby members MUST be able to read selected categories but MUST NOT modify them.
- **FR-005**: Category selection MUST reject empty selections, duplicate category identifiers, inactive categories, and categories that do not exist.
- **FR-006**: Category selections MUST be locked once the game starts.
- **FR-007**: When the host changes selected categories before game start, the system MUST reset readiness for every joined lobby player.
- **FR-008**: Joined lobby players MUST be able to select their own piece color while the lobby is open and not expired.
- **FR-009**: The system MUST allow only the colors Red, Blue, Green, Yellow, Purple, and Orange for lobby piece color selection.
- **FR-010**: The system MUST reject a color selection when another current lobby player already has that color.
- **FR-011**: Players MUST NOT be able to change another player's piece color.
- **FR-012**: When a player changes their selected piece color before game start, the system MUST reset that player's readiness state.
- **FR-013**: Color selections MUST be locked once the game starts.
- **FR-014**: A joined player MUST be able to mark only their own readiness state while the lobby is open and not expired.
- **FR-015**: A player MUST NOT be able to become ready until they have selected a valid, unique piece color.
- **FR-016**: The lobby MUST NOT be considered start-ready until it has 2 to 4 joined players, at least one active selected category, every joined player has a unique valid color, every joined player is ready, the lobby is open, and the lobby is not expired.
- **FR-017**: The host MUST be blocked from starting the game unless every setup readiness requirement is satisfied.
- **FR-018**: When the host starts a setup-ready lobby, the game session MUST include the selected category references.
- **FR-019**: When the host starts a setup-ready lobby, each game player MUST include the piece color selected by that lobby player.
- **FR-020**: Board category assignment for the created game MUST use only the lobby's selected active categories captured at game start.
- **FR-021**: The system MUST broadcast lobby setup changes for category selection, player color selection, readiness changes, setup status changes, and game start so connected lobby members can update without manual refresh.
- **FR-022**: Reconnected clients MUST reconcile lobby setup from an authoritative lobby snapshot before allowing setup actions.
- **FR-023**: The system MUST expose user-friendly validation messages for failed category, color, readiness, and start attempts.
- **FR-024**: The system MUST record setup audit/logging information for category selection changes, color changes, readiness changes, failed setup validation attempts, and game start setup snapshots.
- **FR-025**: Gameplay-affecting behavior MUST remain server-authoritative; pending UI state MUST be reconciled from backend responses or realtime events.
- **FR-026**: REST and realtime payloads MUST be mapped through typed frontend contracts and domain models before UI components consume them.
- **FR-027**: Interactive setup controls MUST include keyboard operation, accessible labels, visible focus states, and screen-reader-friendly status updates.
- **FR-028**: When a new player joins a lobby after existing players are ready, existing players MUST keep their readiness state while the new player starts without a selected color and not ready.
- **FR-029**: After a configured game starts, later Question Bank category changes MUST NOT change the active game session's selected category snapshot.
- **FR-030**: Ready and start-game requests made from stale lobby setup state MUST be rejected, and the frontend MUST display a clear message before automatically reconciling to the latest authoritative lobby snapshot.
- **FR-031**: The host MUST be treated as a joined player for setup readiness and MUST have a unique valid color and ready status before starting the game.
- **FR-032**: If host transfer occurs before game start, selected categories and remaining player color selections MUST be preserved, all remaining players' readiness states MUST be reset, and start eligibility MUST be recalculated for the new host.

### Key Entities *(include if feature involves data)*

- **Lobby Setup**: The game setup state attached to a lobby, including selected category references, setup status, and when setup was last changed.
- **Lobby Player Setup**: Per-player setup state inside a lobby, including selected piece color and readiness.
- **Question Category Reference**: A selected active category that is allowed to influence board content after game start.
- **Game Player Setup Snapshot**: The player setup values transferred from lobby into gameplay when a game session starts.
- **Game Session Category Snapshot**: The selected category set transferred from lobby into gameplay when a game session starts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A host can configure categories, all players can select colors and readiness, and the host can start a valid 2-player lobby in under 2 minutes during normal use.
- **SC-002**: 100% of invalid setup attempts in the acceptance scenarios are rejected without changing durable lobby or game state.
- **SC-003**: 100% of started games created from configured lobbies retain the exact selected category set and player color assignments from the lobby.
- **SC-004**: Connected lobby members see setup changes within 2 seconds under normal local development conditions, without refreshing the page.
- **SC-005**: After reconnecting, a player sees the authoritative lobby setup state before making additional setup changes.
- **SC-006**: The complete lobby setup flow can be completed with keyboard-only input and communicates selection, readiness, validation, and start status without relying on color alone.
- **SC-007**: Setup validation reduces failed game-start attempts caused by incomplete category, color, or readiness state to zero for users following on-screen guidance.

## Assumptions

- Existing authentication and lobby membership rules remain authoritative for identifying hosts and joined players.
- Existing question category activation rules define whether a category is active and selectable for gameplay.
- The allowed color list for this feature is Red, Blue, Green, Yellow, Purple, and Orange.
- Lobbies continue to support 2 to 4 players for game start.
- Setup state is editable only while the lobby is open and not expired.
- If a selected category is later deactivated before start, start readiness is recalculated and the host must update category selection.
- Existing lobby and game start screens will be extended rather than replaced by a separate setup page.
