# Quickstart: Piece Battles, Special Fields, and Level Progression

## Prerequisites

- Backend exposes the battle/special REST and SignalR contracts documented in `contracts/`.
- `VITE_API_BASE_URL` points to the backend origin, for example `http://localhost:5168`.
- Two authenticated player accounts are available for multiplayer validation.
- At least one board category has enough active valid questions to exercise repeat and no-repeat behavior.

## Local Validation Commands

```powershell
npm test
npm run build
npm audit --audit-level=low
```

Optional focused e2e validation:

```powershell
npm run test:e2e -- battle
```

## Manual Validation Scenarios

### Enemy Battle Success

1. Start a two-player game.
2. Put Player 1's active piece adjacent to Player 2's active piece through normal gameplay or seeded test state.
3. As Player 1, target the enemy-occupied tile.
4. Confirm the battle question panel opens within 10 seconds, progress starts at `0 / defender level + 1`, and Player 2 sees the same question/progress read-only.
5. Submit the required number of correct answers.
6. Confirm the defender is captured, the attacker moves to the target tile, ownership changes, level progression is shown, and the turn advances for both players.

### Enemy Battle Failure

1. Start an eligible battle.
2. Submit an incorrect answer.
3. Confirm both pieces remain on original tiles, ownership is unchanged, failure feedback is shown, and the turn advances.

### Special Field Success

1. Move an active piece adjacent to an unoccupied special tile.
2. Start special field conquest.
3. Confirm the attempt requires exactly three correct answers.
4. Submit three correct answers.
5. Confirm the piece moves to the special field, ownership changes, the acting piece gains level progression up to max level 3, and no captured piece is restored.

### Special Field Failure Or Expiration

1. Start a special field attempt.
2. Submit an incorrect answer or let the active question expire.
3. Confirm the piece remains on the source tile, ownership is unchanged, result feedback explains the failure/expiration, and the turn advances.

### Pending Attempt Restrictions

1. Start any battle, special field, or ordinary conquest attempt.
2. Try to move another piece, start another attempt, or manually end the turn.
3. Confirm controls are disabled or the backend rejection is shown without local board mutation.

### Captured Piece Behavior

1. Capture a defender.
2. Confirm captured state is visually and textually indicated.
3. Confirm the captured piece cannot move, attack, defend, occupy a tile, or be targeted.

### Level Cap

1. Progress the same piece through repeated successful captures or special field conquests.
2. Confirm level never exceeds 3.

### Opponent Synchronization

1. Keep both players connected in separate browser contexts.
2. Complete a battle and a special field attempt from Player 1's session.
3. Confirm Player 2 sees question, progress, capture, movement, ownership, level, and turn changes without refresh within the target 2-second window.
4. Record any interaction where the 2-second target is missed and include browser console/network context in the validation notes.

### Reconnect Recovery

1. Disconnect or refresh one player's browser during a pending attempt.
2. Rejoin the game session.
3. Confirm the client reloads the authoritative board and current pending attempt state without stale positions.

### Accessibility Pass

1. Complete battle and special field flows using keyboard only.
2. Confirm visible focus is maintained.
3. Confirm question, progress, result, level-up, expiration, turn, and connection changes are announced through live regions.
4. Confirm special/captured/level states are not conveyed by color alone.

### Question Selection And Repeat Fallback

1. Start a battle or special field attempt in a category with enough active valid questions for the required answer count.
2. Confirm the attempt does not repeat a question within that attempt.
3. Start a battle or special field attempt in a seeded category with too few active valid questions for the required answer count.
4. Confirm the attempt can still complete and repeated questions do not expose hidden correctness metadata before resolution.

### Audit Verification

1. Complete one successful battle, one failed battle, one successful special field conquest, and one failed or expired special field attempt.
2. Confirm frontend-visible result payloads and UI states expose only safe correlation identifiers needed to match backend/operator-visible audit records for battle start, participating piece ids, required correct answer count, submitted answer ids, battle result, special field result, piece capture, piece level-up, and turn advancement.
3. Confirm backend/operator-visible audit records contain the durable correctness and result details for each completed attempt.
4. Confirm frontend-visible logs, UI messages, and browser console output do not expose correct answer text or hidden correctness metadata before resolution.

### Frontend Telemetry Verification

1. Trigger one backend problem-details rejection for battle and one for special field without local board mutation.
2. Trigger a SignalR reconnect or `GameSnapshotRequiredEvent` recovery path.
3. Trigger or simulate a stale realtime event with an older sequence than the current snapshot.
4. Confirm frontend diagnostics record non-sensitive event names, game/session identifiers where safe, correlation identifiers where safe, timing markers, and recovery outcomes.
5. Confirm telemetry payloads and browser logs do not include correct answer text, hidden correctness flags, or unsubmitted answer correctness metadata.

## Contract References

- REST planning contract: `contracts/battle-special.openapi.yaml`
- SignalR planning contract: `contracts/battle-special-signalr.md`
- Domain entities and validation: `data-model.md`

## Expected Automated Coverage

- API wrapper tests for battle and special field start/answer endpoints.
- API wrapper tests for backend problem-details rejection handling without local board mutation.
- Mapper tests proving safe question DTOs do not expose correctness metadata and preserve active-valid/no-repeat fallback metadata safely.
- Store tests for pending attempt lock, result reconciliation, duplicate/out-of-order event handling, and reconnect snapshot refresh.
- Component tests for actor-only answer submission, spectator read-only mode, progress display, result banners, captured/level indicators, and keyboard behavior.
- Frontend telemetry tests for battle/special command failures, SignalR reconnect recovery, snapshot-required recovery, stale event rejection, and timing markers without hidden answer metadata.
- Playwright two-player flow covering battle success/failure, special field success/failure synchronization, under-10-second battle start, and 2-second opponent-update timing.
- Audit verification checklist coverage for every completed battle and special field attempt.

## Implementation Notes

- Do not add new runtime packages unless a later task explicitly justifies and audits them.
- Regenerate or reconcile frontend REST types from the backend OpenAPI contract when available.
- Keep SignalR hub URLs derived from `VITE_API_BASE_URL`.
- Include package-lock review and `npm audit --audit-level=low` in implementation verification.
- Treat audit persistence as backend-owned, but verify frontend contracts, result payloads, and operator-facing validation steps expose enough identifiers to correlate audit records without leaking answer correctness early.
- Treat frontend telemetry as non-authoritative diagnostics only; never use telemetry events for gameplay validation, scoring, progression, or answer correctness.

## Validation Log

- 2026-06-21: `npm test` passed with 63 test files and 187 tests.
- 2026-06-21: `npm run build` passed after running outside the sandbox because Vite/Rolldown child-process spawning hit Windows `EPERM` in the sandbox. Build emitted non-blocking Rolldown `INVALID_ANNOTATION` warnings from `@microsoft/signalr`.
- 2026-06-21: `npm audit --audit-level=low` passed with 0 vulnerabilities.
- 2026-06-21: Board rendering performance review completed. `GameTile` and `GamePiece` are memoized, game state keeps normalized lookup maps, and battle/special pending state is isolated in `battleStore`. `selectBoardCells` sorts per render, which is acceptable for the current 2-4 player board size; revisit only if board dimensions grow materially.
- 2026-06-21: `npm test` passed with 73 test files and 218 tests after adding battle/special mapper, store, realtime, hook, component, fixture, and accessibility coverage.
- 2026-06-21: `npm run build` passed outside the sandbox after TypeScript test fixture fixes; build emitted the same non-blocking Rolldown `INVALID_ANNOTATION` warnings from `@microsoft/signalr`.
- 2026-06-21: `npm audit --audit-level=low` passed with 0 vulnerabilities after remediation edits.
