# Research: Piece Battles, Special Fields, and Level Progression

## Decision: Use A Unified Pending Attempt Lock

**Decision**: Treat ordinary conquest, enemy battles, and special field attempts as mutually exclusive pending attempts for the current session/turn.

**Rationale**: The specification requires players to resolve the current attempt before moving another piece, starting another attempt, or manually ending the turn. A unified lock gives UI controls one source of truth for disabling actions and mirrors backend-authoritative session state.

**Alternatives considered**:

- Separate locks per attempt type: rejected because a player could start a battle while a special field attempt remains pending.
- Local-only UI disablement: rejected because reconnecting and second-client players must receive authoritative pending state.

## Decision: Keep Durable Board State Backend-Authoritative

**Decision**: Apply movement, capture, ownership, level, turn, and attempt status changes only from REST responses, SignalR events, or refreshed snapshots.

**Rationale**: The constitution requires shared gameplay truth across players. Battle and special-field outcomes depend on answer correctness and validation that the frontend must not know in advance.

**Alternatives considered**:

- Optimistic move/capture rendering: rejected because incorrect answers, expiration, stale target state, or duplicate updates could visibly desync players.
- UI-only reconciliation after local animations: rejected because animation state could be mistaken for durable board state.

## Decision: Separate Transient Attempt UI From Game Session Snapshot

**Decision**: Store pending question display, selected answer, submission state, countdown, and local focus state separately from the durable game session snapshot.

**Rationale**: It keeps raw backend DTOs out of UI components while preserving a clean distinction between temporary interaction state and authoritative board state.

**Alternatives considered**:

- Embed all attempt state directly into board tiles/pieces: rejected because question and answer UI state is not part of board topology.
- Keep everything in React component state: rejected because reconnect, realtime events, and opponent views need centralized reconciliation.

## Decision: Prefer Unique Questions Per Attempt With Fallback Repeats

**Decision**: Request active valid questions from the target tile category and avoid repeats within an attempt when enough active questions exist. Allow repeats only when the category cannot satisfy the required count uniquely.

**Rationale**: This honors the clarification while avoiding blocked gameplay for sparse categories.

**Alternatives considered**:

- Hard require unique questions: rejected because some categories may not have enough active valid questions.
- Always allow random repeats: rejected because it weakens the intended multi-question challenge.

## Decision: Fail The Whole Attempt On Incorrect Or Expired Question

**Decision**: Any incorrect answer or question expiration fails the whole battle/special attempt, preserves board state, and advances the turn.

**Rationale**: The spec clarifications define the initial release as strict. A single outcome rule also simplifies UI copy, result mapping, and audit validation.

**Alternatives considered**:

- Track strikes or partial failures: rejected as out of scope for the initial release.
- Expire only the current question: rejected because clarification explicitly says expiration fails the whole attempt.

## Decision: Captured Pieces Remain Out Of Active Play

**Decision**: Captured pieces are marked captured/inactive and cannot move, attack, defend, occupy tiles, or be targeted until a future restoration reward exists.

**Rationale**: The clarification excludes restoration in this release while preserving captured pieces for history, audit, and result display.

**Alternatives considered**:

- Remove captured pieces from all frontend state: rejected because result screens and future restoration need identity/history.
- Auto-restore after turn cycle: rejected as an unrequested gameplay rule.

## Decision: Special Field Reward Is Acting-Piece Level Progression Only

**Decision**: Successful special field conquest moves the acting piece, changes ownership, and awards level progression to that piece only.

**Rationale**: This is the clarified release scope and avoids mixing special field conquest with future captured-piece restoration rewards.

**Alternatives considered**:

- Restore captured piece as a reward: rejected by clarification.
- Random reward table: rejected as undefined and harder to test.

## Decision: Extend Existing Question UI Patterns

**Decision**: Reuse the existing safe-question mapping and modal/panel interaction style, adding battle/special progress, actor gating, and spectator read-only states.

**Rationale**: Existing conquest work already solved hidden-answer DTO mapping and safe question display. Extending it reduces drift and keeps answer secrecy consistent.

**Alternatives considered**:

- Build a separate quiz engine: rejected because it duplicates existing logic.
- Inline questions directly on board tiles: rejected because multi-question flow, focus management, and screen-reader status are better handled in a dedicated panel/modal.

## Decision: Map Dedicated Battle/Special Realtime Events

**Decision**: Add typed handling for attempt started, question issued, progress updated, succeeded/failed, captured, leveled up, turn advanced, and snapshot-required events.

**Rationale**: Dedicated event names make multiplayer synchronization observable and testable, while snapshot-required gives a recovery path for missed or stale updates.

**Alternatives considered**:

- One generic game-updated event only: rejected because UI needs specific accessible announcements and progress/result transitions.
- Client polling after every answer: rejected because it increases backend load and delays opponent updates.

## Decision: Add No New Runtime Dependency

**Decision**: Implement this feature using the current approved stack and existing UI/testing tools.

**Rationale**: The feature needs typed state, REST wrappers, SignalR event handling, and accessible UI; the current stack already covers those needs.

**Alternatives considered**:

- Add a server-state library: rejected because the constitution requires project-owned API wrappers unless a future amendment approves one.
- Add a quiz/form wizard package: rejected because the UI flow is specific and small enough for existing components.
