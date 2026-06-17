# Feature Specification: Question Conquest and Answer Validation During Gameplay

**Feature Branch**: `004-question-conquest`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "Feature 4: Question Conquest and Answer Validation During Gameplay"

## Clarifications

### Session 2026-06-17

- Q: How should answer option selection and submission work? -> A: Selecting an answer marks it, then the player confirms with a Submit button.
- Q: Can the player close the question UI while a conquest attempt is pending? -> A: The player cannot close the question UI until the attempt is answered, expired, cancelled, or the game ends.
- Q: Who can see the active conquest question and answer options? -> A: All players can see the active question text and answer options, but only the acting player can answer.
- Q: What happens to the question UI after a conquest result is shown? -> A: The result is shown briefly, then the question UI closes automatically and focus returns to the board.
- Q: What should happen when the local question timer expires before an authoritative result arrives? -> A: The UI disables answering, shows an expired pending state, and actively requests or waits for authoritative resolution.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a Conquest Question (Priority: P1)

As the current player, I want selecting a valid empty target tile to start a question conquest attempt instead of immediately moving my piece, so that territory is earned by answering gameplay questions.

**Why this priority**: This is the core rule change for the feature. Without it, movement remains direct and the question-conquest gameplay loop does not exist.

**Independent Test**: Can be tested by loading an active game, selecting the current player's own uncaptured piece, selecting a valid adjacent empty tile, and confirming a question appears while the board position remains unchanged.

**Acceptance Scenarios**:

1. **Given** it is the current player's turn and they have selected an own uncaptured piece, **When** they select a valid adjacent empty target tile, **Then** a conquest question is requested and the piece does not move immediately.
2. **Given** a conquest question has been issued, **When** the board is displayed behind or around the question UI, **Then** the source tile, target tile, ownership, and turn state remain unchanged until an authoritative conquest result is received.
3. **Given** a conquest attempt is pending, **When** the player tries to select another piece or target tile, **Then** the movement interaction is blocked and clear feedback explains that a question attempt is already in progress.

---

### User Story 2 - Answer a Gameplay Question (Priority: P1)

As the player resolving a conquest attempt, I want to choose one of four answer options without seeing which option is correct, so that answering the question fairly determines whether the conquest succeeds.

**Why this priority**: Answer selection and submission is the decisive user action in the conquest flow and must protect answer integrity.

**Independent Test**: Can be tested by starting a conquest attempt, verifying the question UI shows exactly four answer choices with no correctness indicator, selecting one answer, confirming it is marked but not submitted, then using Submit and confirming no second answer can be submitted.

**Acceptance Scenarios**:

1. **Given** a valid conquest question is returned, **When** the question UI opens, **Then** it shows the question text, category context, exactly four answer options, and no correctness metadata or visual hints before submission.
2. **Given** the player selects an answer, **When** they have not yet confirmed submission, **Then** the selected answer is visibly and accessibly marked and no answer is submitted.
3. **Given** the player has selected an answer, **When** they activate Submit, **Then** all answer options and the Submit action become disabled while submission is pending.
4. **Given** the answer has already been submitted, **When** the player interacts with the answer options again, **Then** no duplicate answer submission is made.
5. **Given** a conquest attempt is pending, **When** the player tries to dismiss the question UI, **Then** the question remains visible until the attempt is answered, expired, cancelled, or the game ends.

---

### User Story 3 - Resolve Correct and Incorrect Conquests (Priority: P1)

As both players in the game, I want the board and turn display to update from the authoritative conquest result, so that everyone sees the same outcome after a correct, incorrect, or failed answer.

**Why this priority**: Multiplayer trust depends on correct resolution, shared board state, ownership display, and turn progression.

**Independent Test**: Can be tested by submitting a correct and an incorrect answer in controlled game states and confirming piece position, tile ownership, result feedback, and turn display match the authoritative outcome.

**Acceptance Scenarios**:

1. **Given** the player answers correctly, **When** the conquest result is applied, **Then** the piece moves to the target tile, the target tile becomes owned by the acting player, the source tile is vacated, and the turn advances.
2. **Given** the player answers incorrectly, **When** the conquest result is applied, **Then** the piece remains on the source tile, the target tile ownership does not change, and the turn advances.
3. **Given** a conquest result is received through both the answer response and a realtime event, **When** both updates are processed, **Then** the board is updated once to the same authoritative final state without duplicate feedback or stale turn data.
4. **Given** a conquest result is displayed, **When** the result has been visible for about 3 seconds, **Then** the question UI closes automatically and focus returns to the board or next actionable game area.

---

### User Story 4 - Handle Expired Attempts (Priority: P2)

As a player, I want timed conquest attempts to clearly expire and resolve as failed attempts, so that I understand why I can no longer answer and whose turn is next.

**Why this priority**: Expiration prevents stalled turns and must be understandable, but the core conquest loop can be tested without a timer when no expiration is provided.

**Independent Test**: Can be tested by receiving a question with an expiration time, waiting until it expires, and confirming answer submission is disabled and failed-attempt feedback is shown after authoritative resolution.

**Acceptance Scenarios**:

1. **Given** a question includes an expiration time, **When** the question UI is open, **Then** the player sees a countdown or time remaining indicator that does not overwhelm assistive technology.
2. **Given** the expiration time has passed, **When** the player attempts to answer, **Then** answer submission is disabled and the UI explains that the attempt expired.
3. **Given** the local expiration time has passed before an authoritative result arrives, **When** the UI disables answering, **Then** it shows an expired pending state and actively requests or waits for authoritative resolution.
4. **Given** an expired attempt is resolved, **When** the board and turn display update, **Then** the attempt is shown as failed and the turn advances according to the authoritative state.

---

### User Story 5 - Stay Synchronized Through Realtime Updates (Priority: P2)

As any participant, I want conquest results, turn changes, and expired attempts to update through realtime game updates, so that players who did not submit the answer still see the same game state without refreshing.

**Why this priority**: Realtime synchronization is essential for multiplayer play, especially for the non-acting player.

**Independent Test**: Can be tested by keeping two authenticated players in the same game, resolving a conquest attempt in one context, and confirming the other context sees the result, board update, and turn change without manual refresh.

**Acceptance Scenarios**:

1. **Given** another player starts a conquest attempt, **When** the question is issued, **Then** the non-acting player can see the question text and answer options but cannot select or submit an answer.
2. **Given** another player completes a conquest attempt, **When** the realtime result arrives, **Then** the non-acting player's board, ownership display, result feedback, and turn indicator update without refresh.
3. **Given** the client reconnects during or after a conquest attempt, **When** realtime connectivity is restored, **Then** the game refreshes to an authoritative snapshot before allowing further movement.
4. **Given** duplicate or out-of-order conquest and turn events arrive, **When** the client processes them, **Then** stale updates do not undo a newer authoritative board or turn state.

---

### Edge Cases

- A target tile becomes occupied, blocked, missing, or otherwise invalid between local target selection and conquest attempt creation.
- A player attempts to use another player's piece, a captured piece, a piece when it is not their turn, or a piece while another conquest attempt is pending.
- The question response contains fewer than or more than four answer options.
- The question response includes answer correctness data; the UI must not expose or rely on it.
- The player loses connection after receiving a question but before submitting an answer.
- The player attempts to close or dismiss the question UI while the conquest attempt is still pending.
- The player submits an answer at the same time the attempt expires.
- The game is cancelled or completed while a question attempt is pending.
- A conquest result references a missing piece, source tile, target tile, owner, or turn player.
- The acting player receives the answer response and then receives a matching realtime event for the same result.
- The non-acting player receives a conquest result event before seeing the question-issued event.
- A non-acting player sees an active question and attempts to select or submit an answer.
- Keyboard-only users must be able to open the question UI, select an answer, submit it, and return focus to the game flow.
- Screen-reader users must receive concise announcements for question availability, answer pending state, result state, expiration, and turn advancement.
- Correct, incorrect, selected, disabled, pending, and expired states must not rely on color alone.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST start a conquest attempt when the current player selects a valid empty reachable target tile, rather than moving the piece immediately.
- **FR-002**: The system MUST keep the piece position, tile ownership, and turn state unchanged while a conquest question is pending, unless an authoritative update resolves the attempt.
- **FR-003**: The system MUST block all additional movement attempts for the current player while one conquest attempt is pending.
- **FR-004**: The system MUST validate local helper conditions before requesting a conquest attempt: active game status, current turn ownership, own uncaptured piece, existing target tile, orthogonal adjacency, unblocked target, and unoccupied target.
- **FR-005**: The system MUST treat backend validation as authoritative when local helper validation and backend validation disagree.
- **FR-006**: The system MUST display a gameplay question with question text, category context, and exactly four answer options when a valid conquest attempt is issued.
- **FR-007**: The system MUST show a blocking error and prevent answer submission when a gameplay question payload is malformed, including when it does not contain exactly four answer options.
- **FR-008**: The system MUST NOT reveal, infer, store for UI use, or depend on answer correctness before the answer is submitted.
- **FR-009**: The system MUST allow the player to select exactly one answer for the current pending conquest attempt before submission.
- **FR-010**: The system MUST require an explicit Submit confirmation after answer selection before sending the selected answer.
- **FR-011**: The system MUST disable all answer options and the Submit action while answer submission is pending and after an answer has been submitted.
- **FR-012**: The system MUST keep the question UI open while a conquest attempt is pending and MUST allow dismissal only after the attempt is answered, expired, cancelled, or the game ends.
- **FR-013**: The system MUST allow all players in the game session to see active conquest question text and answer options.
- **FR-014**: The system MUST allow only the acting player for the pending conquest attempt to select and submit an answer.
- **FR-015**: The system MUST apply correct-answer results by moving the piece to the target tile, marking the target tile as owned by the acting player, vacating the source tile, showing success feedback, and advancing the turn according to the authoritative result.
- **FR-016**: The system MUST apply incorrect-answer results by keeping the piece on the source tile, leaving target tile ownership unchanged, showing failure feedback, and advancing the turn according to the authoritative result.
- **FR-017**: The system MUST display a timer or time remaining indicator when the question attempt includes an expiration time.
- **FR-018**: The system MUST disable answer submission and show expired-attempt feedback when a pending attempt expires before answer submission.
- **FR-019**: The system MUST show an expired pending state and actively request or wait for authoritative resolution when the local timer expires before a conquest result is received.
- **FR-020**: The system MUST resolve expired attempts from an authoritative result or refreshed game state before allowing further movement.
- **FR-021**: The system MUST update board state, tile ownership, result feedback, and turn display from authoritative conquest responses or realtime events.
- **FR-022**: The system MUST show conquest result feedback for approximately 3 seconds after resolution, then automatically close the question UI and return focus to the board or next actionable game area.
- **FR-023**: The system MUST avoid duplicate durable updates and duplicate user feedback when the same conquest result is received from both direct answer submission and realtime updates.
- **FR-024**: The system MUST refresh or recover authoritative game state after reconnecting from an uncertain conquest, turn, or board state.
- **FR-025**: The system MUST show centralized user-facing errors for invalid attempts, unavailable questions, failed answer submission, network failures, expired questions, and desynchronized game state.
- **FR-026**: The system MUST use blocking error presentation for invalid question payloads, unresolved expired attempts, game cancellation/completion during a question, or game state desynchronization.
- **FR-027**: The question UI MUST follow the shared dark blue and white visual system, including styled answer options, selected state, pending state, result feedback, timer warning, disabled state, and visible focus.
- **FR-028**: The question flow MUST be keyboard operable, with accessible labels, grouped answer options, concise live status updates, focus movement into the question UI, and focus recovery after resolution.
- **FR-029**: Gameplay-affecting behavior MUST remain server-authoritative; pending UI state MUST be reconciled from backend responses or realtime events.
- **FR-030**: Backend and realtime payloads MUST be mapped through typed frontend contracts and domain models before UI components consume them.

### Key Entities

- **Gameplay Question**: The question shown for a conquest attempt, including the question identity, category context, question text, four answer options, and optional expiration time. It must not expose correctness for any option.
- **Answer Option**: A selectable answer choice associated with a gameplay question. It includes an option identity and visible text only.
- **Question Attempt**: The pending or resolved challenge that links a game session, acting player, selected piece, source tile, target tile, question, status, timestamps, and optional expiration.
- **Conquest Result**: The authoritative outcome of an answered or expired attempt, including result status, whether the answer was correct, piece/tile outcome, ownership outcome, next turn player, and turn number.
- **Conquest UI State**: Transient client state for the current question, selected answer, pending request flags, expiration display, latest result feedback, and cleanup after resolution.
- **Game Session State**: The authoritative board, pieces, ownership, turn, status, and player state that conquest results update.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 95% of normal-network attempts, selecting a valid target tile presents a gameplay question within 2 seconds without moving the piece first.
- **SC-002**: 100% of valid gameplay question displays show exactly four answer choices and no correctness indicator before submission.
- **SC-003**: 100% of answer submissions require an explicit Submit confirmation after answer selection and prevent duplicate submissions from repeated clicks or keyboard activation.
- **SC-004**: 100% of correct conquest results move the piece, update target ownership, and advance the turn according to the authoritative result.
- **SC-005**: 100% of incorrect or expired conquest results keep the piece on the source tile, preserve target ownership, show failed-attempt feedback, and advance the turn according to the authoritative result.
- **SC-006**: A non-acting player sees active conquest question content, answer options, conquest result, board ownership, and turn changes without manual refresh in 95% of normal realtime connections, while never being able to submit an answer for another player's attempt.
- **SC-007**: Conquest result feedback remains visible for about 3 seconds and then returns players to the board without requiring a manual dismiss action.
- **SC-008**: 100% of locally expired attempts disable answer submission immediately and remain in an expired pending state until authoritative resolution is received or refreshed.
- **SC-009**: Reconnect after a conquest interruption restores an authoritative game state before movement is re-enabled.
- **SC-010**: The primary conquest flow can be completed with keyboard-only input and announces question, pending, result, expiration, and turn changes through accessible status feedback.
- **SC-011**: Malformed question payloads, invalid attempts, and failed submissions produce understandable feedback without committing local gameplay state.

## Assumptions

- The feature applies only to authenticated participants in an active game session.
- Only empty, unblocked, orthogonally adjacent target tiles can start a conquest attempt in this feature.
- Enemy-occupied tile conquest, piece capture, piece leveling, multi-question scoring, question explanations, and question authoring are outside this feature.
- If a question has no expiration time, the UI does not display a countdown and the attempt remains answerable until resolved by an authoritative game outcome.
- Expired attempts are treated as failed attempts in user-facing feedback.
- The backend determines question selection, answer correctness, conquest result, ownership changes, and turn advancement.
- The existing game board, turn display, authentication, centralized error handling, and realtime connection foundations are available.
- Realtime updates may duplicate direct answer responses and must be reconciled to the same final authoritative state.
