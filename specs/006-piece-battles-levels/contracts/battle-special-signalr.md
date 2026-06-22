# SignalR Contract: Battle, Special Field, Capture, and Level Updates

Game hub URL is derived from `VITE_API_BASE_URL`:

```text
{VITE_API_BASE_URL}/hubs/game
```

All event payloads are server-authoritative and must include:

- `gameSessionId`: Game session id.
- `sequence`: Monotonic session update sequence.
- `occurredAtUtc`: Server event timestamp.

Clients must ignore duplicate or older `sequence` values. Unknown event versions or detected gaps should trigger a game snapshot refresh.

## BattleAttemptStartedEvent

Sent when a battle is accepted and the turn becomes locked.

```json
{
  "gameSessionId": "1535df8c-e4ab-4089-99f9-d65ccd19a4d1",
  "sequence": 42,
  "occurredAtUtc": "2026-06-21T12:00:00Z",
  "battleAttemptId": "aaaaaaaa-0000-0000-0000-000000000001",
  "actingPlayerId": "player-1",
  "attackingPieceId": "piece-a",
  "defendingPieceId": "piece-b",
  "sourceTileId": "tile-1",
  "targetTileId": "tile-2",
  "requiredCorrectAnswers": 2,
  "correctAnswers": 0
}
```

## BattleQuestionIssuedEvent

Sent when the current battle question changes. Payload includes safe question fields only: `battleAttemptId`, `questionAttemptId`, `questionId`, `categoryId`, `categoryName`, `questionText`, `answerOptions`, `expiresAtUtc`, `requiredCorrectAnswers`, and `correctAnswers`.

Correct answer ids and hidden correctness metadata must not be sent.

## BattleProgressUpdatedEvent

Sent after a correct answer that does not yet complete the battle. Payload includes `battleAttemptId`, `questionAttemptId`, `correctAnswers`, `requiredCorrectAnswers`, and optional `nextQuestionAttemptId`.

## BattleSucceededEvent

Sent when required correct answers are reached. Payload includes `battleAttemptId`, `attackingPieceId`, `defendingPieceId`, `capturedPieceId`, `sourceTileId`, `targetTileId`, `targetOwnerPlayerId`, `leveledPieceId`, `newLevel`, and `nextTurnPlayerId`.

## BattleFailedEvent

Sent when a battle fails due to incorrect answer, expiration, cancellation, or invalidation. Payload includes `battleAttemptId`, `reason`, `attackingPieceId`, `defendingPieceId`, `sourceTileId`, `targetTileId`, and `nextTurnPlayerId`.

## SpecialFieldAttemptStartedEvent

Sent when a special field attempt is accepted and the turn becomes locked. Payload includes `specialFieldAttemptId`, `actingPlayerId`, `pieceId`, `sourceTileId`, `targetTileId`, `requiredCorrectAnswers`, and `correctAnswers`.

## SpecialFieldQuestionIssuedEvent

Sent when the current special field question changes. Payload includes safe question fields only: `specialFieldAttemptId`, `questionAttemptId`, `questionId`, `categoryId`, `categoryName`, `questionText`, `answerOptions`, `expiresAtUtc`, `requiredCorrectAnswers`, and `correctAnswers`.

Correct answer ids and hidden correctness metadata must not be sent.

## SpecialFieldProgressUpdatedEvent

Sent after a correct answer that does not yet complete the special field attempt. Payload includes `specialFieldAttemptId`, `questionAttemptId`, `correctAnswers`, `requiredCorrectAnswers`, and optional `nextQuestionAttemptId`.

## SpecialFieldConqueredEvent

Sent when the special field attempt succeeds. Payload includes `specialFieldAttemptId`, `pieceId`, `sourceTileId`, `targetTileId`, `targetOwnerPlayerId`, `leveledPieceId`, `newLevel`, and `nextTurnPlayerId`.

## SpecialFieldFailedEvent

Sent when a special field attempt fails due to incorrect answer, expiration, cancellation, or invalidation. Payload includes `specialFieldAttemptId`, `reason`, `pieceId`, `sourceTileId`, `targetTileId`, and `nextTurnPlayerId`.

## PieceCapturedEvent

Sent when a defender becomes captured. Payload includes `pieceId`, `ownerPlayerId`, `capturedByPieceId`, `capturedAtUtc`, and `removedFromTileId`.

## PieceLeveledUpEvent

Sent when an acting piece gains a level. Payload includes `pieceId`, `ownerPlayerId`, `previousLevel`, `newLevel`, `maxLevel`, and `reason`.

## GameTurnAdvancedEvent

Sent after any battle, special field, or ordinary conquest attempt resolves and the next turn becomes authoritative. Payload includes `previousTurnPlayerId`, `currentTurnPlayerId`, `turnNumber`, and optional `resolvedAttemptId`.

## GameSnapshotRequiredEvent

Sent when the client should discard partial realtime assumptions and reload the authoritative session snapshot. Payload includes `reason` and optional `minimumSequence`.

## Client Handling Rules

- Register handlers in the centralized game SignalR service, not in presentational components.
- Map raw hub payloads into domain events before dispatching to stores.
- All progress/result announcements must be exposed through live regions.
- Non-acting players may see question/progress events but answer submission controls must remain disabled or read-only.
- Duplicate success/failure/capture/level events must be idempotent.
