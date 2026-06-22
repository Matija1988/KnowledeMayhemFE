# Feature Specification: Piece Battles, Special Fields, and Level Progression

**Feature Branch**: `006-piece-battles-levels`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: "Feature 8. Piece Battles, Special Fields, and Level Progression. Implement advanced gameplay mechanics: attacking enemy pieces, resolving multi-question battles, conquering special fields, and progressing piece levels."

## Clarifications

### Session 2026-06-21

- Q: Should battle and special field attempts reuse the same question during one multi-question attempt? -> A: Allow repeats only if the target category has too few active valid questions to satisfy the attempt without repetition.
- Q: What is the lifecycle of captured pieces? -> A: Captured pieces stay out of active play unless restored by a future special-field reward.
- Q: What happens when a question expires during a battle or special field attempt? -> A: Expiration fails the whole attempt without board changes and advances the turn.
- Q: Who can see battle and special field questions while an attempt is active? -> A: All players see question text, answer options, and progress; only the acting player can submit answers.
- Q: What reward does special field conquest grant in this release? -> A: Successful special field conquest only levels up the acting piece in this release.

## Scope Boundary

This specification is the frontend implementation slice for piece battles, special fields, and level progression. Backend-owned guarantees such as authoritative command validation, durable state transitions, audit persistence, question correctness, and SignalR broadcast generation are treated as external contracts that the frontend consumes, validates, and reconciles. Backend implementation of those guarantees belongs in the backend battle/special-field feature specification and tasks.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Attack Enemy Pieces (Priority: P1)

Current-turn players can attack an adjacent enemy piece by moving onto its occupied tile. The attack starts a locked battle sequence driven by questions from the target tile category. The attacking player must answer enough questions correctly to capture the defender; one incorrect answer immediately fails the battle.

**Why this priority**: Enemy-piece battles are the core gameplay expansion and unlock the most visible player value: direct contest between pieces instead of only empty-tile conquest.

**Independent Test**: Can be fully tested by starting a two-player game, placing an acting player's piece next to an enemy piece, starting an attack, answering battle questions, and verifying capture or failure outcomes.

**Acceptance Scenarios**:

1. **Given** it is Player 1's turn and Player 1 has a piece adjacent to Player 2's piece, **When** Player 1 attacks the enemy-occupied tile, **Then** a battle starts and Player 1's turn remains locked until the battle resolves.
2. **Given** a battle against a level 1 defending piece, **When** the attacker answers two battle questions correctly, **Then** the defending piece is captured, the attacking piece moves to the target tile, ownership changes to Player 1, and the turn advances.
3. **Given** an active battle, **When** the attacker answers any battle question incorrectly, **Then** the battle fails, both pieces remain on their original tiles, ownership does not change, and the turn advances.
4. **Given** it is not Player 2's turn, **When** Player 2 attempts to start an attack, **Then** the action is rejected and no battle starts.
5. **Given** Player 1 selects a piece owned by another player, **When** Player 1 attempts an attack with that piece, **Then** the action is rejected and no battle starts.

---

### User Story 2 - Conquer Special Fields (Priority: P1)

Current-turn players can attempt to conquer unoccupied special fields. A special field attempt requires three correct answers from the field's category, fails immediately on an incorrect answer, and locks the acting player's turn until resolved.

**Why this priority**: Special fields give the board meaningful strategic objectives beyond enemy-piece battles and ordinary empty-tile conquest.

**Independent Test**: Can be fully tested by starting a game with a reachable unoccupied special field, starting a special field attempt, answering three questions correctly or one incorrectly, and verifying board, ownership, level, and turn outcomes.

**Acceptance Scenarios**:

1. **Given** it is the acting player's turn and their piece is adjacent to an unoccupied special field, **When** the player selects that special field, **Then** a special field attempt starts and requires three correct answers.
2. **Given** a special field attempt is active, **When** the player answers three questions correctly, **Then** the piece moves to the special field, the field becomes owned by the acting player, the acting piece gains level progression, and the turn advances.
3. **Given** a special field attempt is active, **When** the player answers any question incorrectly, **Then** the attempt fails, the piece remains on its source tile, ownership does not change, and the turn advances.
4. **Given** a special field is occupied, **When** a player attempts a special field conquest on it, **Then** the action is rejected unless it qualifies as an enemy-piece battle.

---

### User Story 3 - Progress Piece Levels (Priority: P2)

Pieces start at level 1 and increase in level after successful enemy captures or successful special field conquests, up to a configured maximum. Higher-level defending pieces require more correct answers to capture.

**Why this priority**: Level progression adds long-term strategy and makes successful actions feel meaningful across a game session.

**Independent Test**: Can be tested by completing successful battles and special field conquests with the same piece, confirming level changes, maximum-level limits, and defender-level battle difficulty.

**Acceptance Scenarios**:

1. **Given** a level 1 piece succeeds in capturing an enemy piece, **When** the battle resolves, **Then** the attacking piece increases by one level.
2. **Given** a level 2 defending piece is attacked, **When** the battle starts, **Then** the attacker must answer three questions correctly to succeed.
3. **Given** a piece is already at maximum level, **When** it completes a successful capture or special field conquest, **Then** its level does not exceed the maximum.
4. **Given** a piece fails a battle or special field attempt, **When** the attempt resolves, **Then** the piece does not gain a level.

---

### User Story 4 - Keep Multiplayer State Synchronized (Priority: P2)

All players see battle starts, question progress, captures, special field outcomes, level-ups, and turn changes from authoritative game updates. Reconnecting players recover the current authoritative game state and do not continue from stale board positions.

**Why this priority**: Advanced gameplay only works if every participant sees the same board, turn, piece, and attempt state.

**Independent Test**: Can be tested with two player sessions by starting battles and special field attempts in one session and verifying the other session receives the same board state, attempt status, piece capture, level, ownership, and turn state without manual refresh.

**Acceptance Scenarios**:

1. **Given** Player 1 starts a battle, **When** Player 2 is viewing the same game, **Then** Player 2 sees that a battle is pending and cannot act out of turn.
2. **Given** a battle or special field question is active, **When** non-acting players view the game, **Then** they see the question text, answer options, and progress but cannot submit an answer.
3. **Given** a battle succeeds, **When** the result is applied, **Then** all connected players see the defending piece captured, the attacker on the target tile, updated ownership, any level-up, and the advanced turn.
4. **Given** a player reconnects during a pending battle or special field attempt, **When** the game reloads, **Then** the player sees the current authoritative attempt state and board state.
5. **Given** duplicate or out-of-order realtime updates arrive, **When** the client processes them, **Then** stale updates do not overwrite newer authoritative board state.

### Edge Cases

- A player attempts to attack a blocked tile, an empty normal tile through battle flow, a non-adjacent tile, or a tile outside the board.
- A player attempts to attack their own piece or use a piece that is already captured.
- A player attempts to move, attack with, or target a captured piece before a valid restoration reward exists.
- A defender level or special field requires more correct answers than unique active valid questions for the target category; the system may reuse active valid questions rather than blocking the attempt.
- A question attempt expires while a battle or special field attempt is pending; the whole attempt fails, board state remains unchanged, and the turn advances.
- A player disconnects after receiving a question but before answering.
- A player submits an answer that does not belong to the issued question.
- A player tries to manually end turn or start another move while any conquest, battle, or special field attempt is pending.
- A piece reaches maximum level and receives another progression reward.
- A capture targets a tile whose state has changed since the attacker opened the question UI.
- Realtime events are missed, duplicated, delayed, or received after a reconnect snapshot.
- Battle and special field question UIs must remain keyboard operable, visibly focused, screen-reader understandable, and not dependent on color-only status.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow the current turn player to start a battle by targeting a reachable enemy-occupied tile with one of their own active pieces.
- **FR-002**: The system MUST reject battle starts when the requester is not the current turn player, the attacking piece is not theirs, the target is unreachable, the target is blocked, the target is not enemy-occupied, or the attacking piece is captured.
- **FR-003**: The system MUST lock the acting player's turn while a battle, ordinary conquest, or special field attempt is pending.
- **FR-004**: The system MUST prevent a player with any pending attempt from moving another piece, starting another attempt, or manually ending the turn.
- **FR-005**: The system MUST determine battle difficulty from the defending piece level using required correct answers equal to defender level plus one.
- **FR-006**: The system MUST issue battle questions from the target tile category and only from active valid questions.
- **FR-006a**: The system SHOULD avoid repeating the same question within one battle or special field attempt while enough active valid questions are available, but MAY repeat questions when the category lacks enough active valid questions to complete the required answer count.
- **FR-007**: The system MUST keep answer correctness hidden from players until an answer is submitted and resolved.
- **FR-008**: The system MUST increment battle progress for each correct answer and resolve the battle as successful once required correct answers are reached.
- **FR-009**: The system MUST fail a battle immediately on the first incorrect answer.
- **FR-009a**: The system MUST fail the whole battle when a battle question expires, preserve board state, and advance the turn.
- **FR-010**: The system MUST capture the defending piece, remove it from the board tile, move the attacking piece to the target tile, update tile ownership, award progression, mark the battle succeeded, and advance the turn after a successful battle.
- **FR-010a**: Captured pieces MUST remain out of active board play and unavailable for movement or attack unless a future special-field reward explicitly restores them.
- **FR-011**: The system MUST leave both pieces on their original tiles, preserve target ownership, mark the battle failed, and advance the turn after a failed battle.
- **FR-012**: The system MUST allow current-turn players to start a special field attempt on a reachable unoccupied special tile.
- **FR-013**: The system MUST require exactly three correct answers to conquer a special field.
- **FR-014**: The system MUST fail a special field attempt immediately on the first incorrect answer.
- **FR-014a**: The system MUST fail the whole special field attempt when a special field question expires, preserve board state, and advance the turn.
- **FR-015**: The system MUST move the piece to the special tile, update ownership, award progression, mark the special field conquered, and advance the turn after successful special field conquest.
- **FR-015a**: In this release, successful special field conquest MUST award level progression only to the acting piece and MUST NOT restore captured pieces.
- **FR-016**: The system MUST leave the piece on its source tile, preserve ownership, mark the attempt failed, and advance the turn after failed special field conquest.
- **FR-017**: The system MUST start every piece at level 1 for new game sessions.
- **FR-018**: The system MUST increase a piece's level after successful enemy capture or successful special field conquest.
- **FR-019**: The system MUST enforce a maximum piece level of 3 for the initial release and MUST NOT allow levels above that maximum.
- **FR-020**: The system MUST clearly show piece level, captured state, battle progress, special field status, and pending attempt state to all relevant players.
- **FR-020a**: The system MUST show active battle and special field question text, answer options, and progress to all players in the game, while allowing only the acting player to submit answers.
- **FR-021**: The system MUST provide player-facing result feedback for successful battle, failed battle, successful special field conquest, failed special field conquest, capture, level-up, expiration, and turn advancement.
- **FR-022**: The frontend MUST subscribe to and process backend-authoritative updates for battle started, battle question issued, battle succeeded, battle failed, special field attempt started, special field conquered, special field failed, piece captured, piece leveled up, and turn advanced.
- **FR-023**: Gameplay-affecting behavior MUST remain server-authoritative; frontend pending UI state MUST be reconciled from backend responses, realtime events, or refreshed authoritative snapshots.
- **FR-024**: Frontend interpretation of authoritative game update messages MUST be consistent before players see board, attempt, level, capture, or turn changes.
- **FR-025**: Interactive battle and special field controls MUST support keyboard operation, accessible labels, visible focus states, and screen-reader-friendly status updates.
- **FR-026**: The frontend MUST preserve and display safe audit correlation identifiers exposed by backend contracts for battle starts, participating piece ids, required correct answer count, submitted answer ids, battle result, special field result, piece capture, piece level-up, and turn advancement; durable audit record creation is backend-owned.
- **FR-027**: Client-facing logs and player-visible messages MUST NOT expose correct answer text or hidden correctness metadata before resolution.
- **FR-028**: The frontend MUST surface structured backend validation failures for every battle and special field command without mutating local board state, including failures for game session status, current turn, piece ownership, reachability, tile type, enemy ownership when applicable, pending attempt status, answer-question relationship, and expiration.

### Key Entities *(include if feature involves data)*

- **Piece**: A movable game piece owned by a player, with current tile, level, captured state, restoration eligibility, and progression state.
- **Board Tile**: A board location with coordinates, category, ownership, occupancy, and tile type such as normal, blocked, or special.
- **Battle Attempt**: A pending or resolved attack on an enemy piece, including attacker, defender, involved pieces, source and target tiles, required correct answers, current progress, status, creation time, and completion time.
- **Special Field Attempt**: A pending or resolved attempt to conquer an unoccupied special tile, including acting player, piece, source and target tiles, required correct answers, progress, status, creation time, and completion time.
- **Question Attempt**: A question issued as part of battle or special field progression, including answer options, selected answer, correctness result, status, and expiration.
- **Piece Level Progression**: The rules and recorded outcome that determine when an acting piece gains a level and whether the maximum level has been reached.
- **Realtime Gameplay Event**: An authoritative update that informs connected players about attempt starts, questions, results, captures, level-ups, ownership changes, movement, and turn advancement.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a two-player game, a current-turn player can start an eligible enemy-piece battle in under 10 seconds from selecting their piece.
- **SC-002**: 100% of invalid battle starts for wrong turn, wrong piece owner, blocked target, unreachable target, own-piece target, or captured attacking piece are rejected without changing board state.
- **SC-003**: 100% of successful battles capture the defender, move the attacker, update ownership, apply eligible level progression, and advance the turn consistently for all players.
- **SC-004**: 100% of failed battles leave both pieces and tile ownership unchanged and advance the turn consistently for all players.
- **SC-005**: In a reachable special field flow, players can complete successful special conquest with exactly three correct answers and grant level progression to the acting piece only.
- **SC-006**: 100% of failed special field attempts leave the piece and tile ownership unchanged and advance the turn.
- **SC-007**: Piece level never exceeds the configured maximum during repeated successful captures and special field conquests.
- **SC-008**: Connected opponents see battle, special field, capture, level-up, ownership, movement, and turn updates within 2 seconds for 95% of normal-network interactions.
- **SC-009**: Reconnecting players recover an authoritative board and pending attempt state without stale piece positions or stale turn state.
- **SC-010**: Battle and special field answer options expose no hidden correctness metadata before resolution in 100% of player-facing payloads and UI states.
- **SC-011**: Primary battle and special field flows can be completed with keyboard-only input and announce question, progress, result, level-up, and turn changes to assistive technology.
- **SC-012**: Staff or test operators can use frontend-visible safe correlation identifiers and validation notes to verify backend audit records for battle start, answer submission, battle result, special field result, capture, level-up, and turn advancement for every completed attempt.

## Assumptions

- Incorrect battle answers fail the battle immediately for the initial release.
- Incorrect special field answers fail the special field attempt immediately for the initial release.
- Special fields require three correct answers to conquer.
- The initial maximum piece level is 3.
- Existing ordinary empty-tile conquest remains available and distinct from enemy-piece battle and special field conquest.
- Captured-piece restoration is future scope and is not awarded by successful special field conquest in this release.
- Existing authentication, game session, question bank, turn, and realtime foundations remain in place.
- Questions for battle and special field attempts use the target tile's assigned category.
- If a category lacks enough unique active valid questions for an attempt, questions may repeat within that attempt so the battle or special field can still be resolved.
- Captured pieces are removed from active board play but remain available for history, audit, result display, and possible restoration by a future special-field reward.
