# Research: Question Conquest and Answer Validation During Gameplay

## Decision: Use Project-Owned Conquest REST Wrappers

**Decision**: Add a dedicated conquest API wrapper that uses the existing API base URL, authenticated JSON request helper, bearer token, JSON headers, and `credentials: "omit"` defaults.

**Rationale**: The project already centralizes API behavior in project-owned wrappers. Reusing that pattern preserves CORS/auth behavior, error normalization, and typed domain boundaries without adding a server-state dependency.

**Alternatives considered**:

- Calling conquest endpoints directly from components: rejected because it bypasses typed contracts, shared error handling, and domain mapping.
- Introducing a new data-fetching library: rejected because this feature does not require new dependency risk or cache semantics beyond existing hooks/stores.

## Decision: Keep Conquest State Separate From Durable Game State

**Decision**: Store current question, selected answer, pending attempt/submission flags, timer-derived expired state, result feedback timing, and cleanup state in a dedicated conquest store. Keep authoritative board, piece, ownership, turn, status, and session snapshots in the game store.

**Rationale**: Conquest UI state is transient and can be cleared after resolution. Board and turn state are durable multiplayer truth and must only update from authoritative responses/events. Separate stores make duplicate reconciliation and selector subscriptions easier to test.

**Alternatives considered**:

- Put all conquest state in the game store: rejected because it mixes durable board truth with modal/timer UI state and increases rerender risk.
- Keep conquest state only in component-local state: rejected because realtime events, reconnect handling, route-level coordination, and result timing need centralized testable state.

## Decision: Valid Target Selection Starts Attempt Creation

**Decision**: Change valid target activation so it starts a conquest attempt instead of submitting a move. The selected piece remains on the source tile until a correct authoritative result arrives.

**Rationale**: The feature changes the gameplay rule: one answered question resolves the turn. Local helper validation still protects obvious invalid interactions, but backend validation remains authoritative.

**Alternatives considered**:

- Keep direct movement and show a question afterward: rejected because it would commit durable movement before answer validation.
- Optimistically move then revert on wrong answer: rejected by the server-authoritative gameplay principle and poor multiplayer trust.

## Decision: Validate Question Payloads Strictly

**Decision**: Require exactly four answer options and reject question payloads that expose answer correctness or omit required identity/text fields.

**Rationale**: The spec requires exactly four options and forbids exposing correctness. Blocking malformed question UI is safer than presenting misleading or insecure answer choices.

**Alternatives considered**:

- Render any number of answers: rejected because acceptance criteria require exactly four options.
- Ignore unexpected correctness fields silently: rejected because it risks accidental UI leakage and weakens test coverage.

## Decision: Use Explicit Answer Selection Plus Submit

**Decision**: Selecting an answer marks it; submitting requires a separate Submit action. Submission disables answer controls and prevents duplicates.

**Rationale**: This matches the clarification result, reduces accidental answers, improves keyboard/screen-reader flow, and creates a clear pending boundary.

**Alternatives considered**:

- Answer click immediately submits: rejected due to accidental selection risk.
- Support both immediate click submission and explicit Submit: rejected because split behavior complicates accessibility and duplicate prevention.

## Decision: Non-Dismissible Pending Question UI

**Decision**: Keep the question UI open while an attempt is pending. It may close only after the attempt is answered, expired, cancelled, or the game ends.

**Rationale**: A hidden pending attempt would make the board feel stuck and could encourage duplicate interactions. Non-dismissible pending UI makes the one-question-per-turn rule visible.

**Alternatives considered**:

- Allow closing and reopening: rejected because it adds recovery state and creates ambiguity around pending attempts.
- Allow closing after answer selection: rejected because the attempt is still unresolved before Submit.

## Decision: All Players See Questions, Only Acting Player Answers

**Decision**: Show active question text and answer options to all game participants, but enable answer selection and Submit only for the acting player.

**Rationale**: This follows clarification and keeps the non-acting player synchronized with the acting player's turn while preserving answer authorization.

**Alternatives considered**:

- Hide question content from non-acting players: rejected because the clarified game experience is shared visibility.
- Show only category/timer to non-acting players: rejected because it does not meet the clarified expectation.

## Decision: Result Feedback Auto-Closes After About 3 Seconds

**Decision**: Show conquest result feedback for about 3 seconds, then close the question UI and return focus to the board or next actionable area.

**Rationale**: Three seconds gives players enough time to perceive the outcome without requiring an extra dismissal action on every turn.

**Alternatives considered**:

- Require manual dismissal: rejected because it adds friction to every turn.
- Close immediately and show only a lightweight banner: rejected because it can make answer feedback easy to miss.

## Decision: Local Expiration Enters Expired Pending State

**Decision**: When the local timer reaches expiration before an authoritative result arrives, disable answer submission, show expired pending feedback, and actively request or wait for authoritative resolution before movement resumes.

**Rationale**: The UI must respond immediately to time expiry while respecting backend authority for turn advancement, board state, and final result.

**Alternatives considered**:

- Wait only for realtime expiration: rejected because the acting player could see active answer controls after local time expires.
- Keep answer enabled until backend rejects it: rejected because it creates a misleading interaction.

## Decision: Extend Centralized Game SignalR Handling

**Decision**: Add conquest-related event parsing and dispatch to the existing game realtime layer. Dispatch authoritative board/session updates to the game store and transient attempt/question/result updates to the conquest store.

**Rationale**: The constitution requires centralized SignalR lifecycle and event handling. Existing game hub infrastructure already manages reconnect status and snapshot refresh.

**Alternatives considered**:

- Open a second conquest-specific hub connection: rejected because it adds lifecycle complexity and duplicate reconnect behavior.
- Handle events in presentational components: rejected by the SignalR architecture rule.

## Decision: No New Runtime Dependency

**Decision**: Implement timers, modal state, answer controls, and reconciliation using existing React, Zustand, SignalR, and shared UI primitives.

**Rationale**: Existing dependencies are sufficient. Avoiding new packages reduces security review scope and aligns with the constitution.

**Alternatives considered**:

- Add a timer/countdown package: rejected because the timer behavior is simple and testable with existing tools.
- Add a modal/dialog package: rejected because the project already has shared UI modal primitives.
