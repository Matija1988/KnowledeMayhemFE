# Data Model: Question Conquest and Answer Validation During Gameplay

## GameplayQuestion

Represents the active question issued for a conquest attempt.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `questionAttemptId` | string | Yes | Links the question to the pending attempt. |
| `questionId` | string | Yes | Stable question identifier. |
| `gameSessionId` | string | Yes | Session the attempt belongs to. |
| `playerId` | string | Yes | Acting player allowed to answer. |
| `pieceId` | string | Yes | Piece attempting conquest. |
| `sourceTileId` | string | Yes | Tile the piece currently occupies. |
| `targetTileId` | string | Yes | Empty tile being conquered. |
| `categoryId` | string | Yes | Category used for question selection/display. |
| `categoryName` | string or null | No | Human-readable category display when available. |
| `questionText` | string | Yes | Visible question text. |
| `answerOptions` | `GameplayAnswerOption[]` | Yes | Exactly four answer options. |
| `expiresAtUtc` | string or null | No | Optional answer expiration time. |

### Validation Rules

- `questionAttemptId`, `questionId`, `gameSessionId`, `playerId`, `pieceId`, `sourceTileId`, `targetTileId`, `categoryId`, and `questionText` must be non-empty.
- `answerOptions` must contain exactly four options.
- Answer options must not expose correctness or any equivalent correctness hint.
- `expiresAtUtc`, when present, must be a valid future or current timestamp when displayed; expired timestamps enter expired pending handling.

## GameplayAnswerOption

Represents one selectable answer choice.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable option identifier submitted by the acting player. |
| `text` | string | Yes | Visible answer text. |

### Validation Rules

- `id` and `text` must be non-empty.
- No `isCorrect`, `correct`, score, or answer-key field may be consumed by UI.

## QuestionAttempt

Represents the lifecycle of one conquest challenge.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Attempt identifier. |
| `gameSessionId` | string | Yes | Parent game session. |
| `playerId` | string | Yes | Acting player. |
| `pieceId` | string | Yes | Piece being used. |
| `sourceTileId` | string | Yes | Starting tile. |
| `targetTileId` | string | Yes | Tile being conquered. |
| `questionId` | string | Yes | Issued question. |
| `status` | `QuestionAttemptStatus` | Yes | Current attempt status. |
| `createdAtUtc` | string | Yes | Attempt creation time. |
| `answeredAtUtc` | string or null | No | Time the answer was accepted, if answered. |
| `expiresAtUtc` | string or null | No | Optional expiration time. |

### Status Values

- `Pending`: Question has been issued and can be answered by the acting player unless locally or authoritatively expired.
- `Succeeded`: Correct answer resolved the conquest.
- `Failed`: Incorrect answer resolved the conquest.
- `Expired`: Attempt expired before a valid answer was accepted.
- `Cancelled`: Attempt was cancelled by game cancellation, completion, or authoritative invalidation.

### State Transitions

```text
Pending -> Succeeded
Pending -> Failed
Pending -> Expired
Pending -> Cancelled
```

Resolved attempts do not return to `Pending`.

## ConquestResult

Represents the authoritative outcome of an answered or expired attempt.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `questionAttemptId` | string | Yes | Attempt being resolved. |
| `resultStatus` | `QuestionAttemptStatus` | Yes | `Succeeded`, `Failed`, `Expired`, or `Cancelled`. |
| `isCorrect` | boolean | Yes | Result indicator after submission/resolution only. |
| `pieceId` | string | Yes | Affected piece. |
| `sourceTileId` | string | Yes | Original tile. |
| `targetTileId` | string | Yes | Target tile. |
| `currentTileId` | string | Yes | Authoritative tile occupied by piece after resolution. |
| `ownerPlayerId` | string or null | No | Authoritative target owner after resolution. |
| `nextTurnPlayerId` | string or null | No | Next player to act, if game continues. |
| `turnNumber` | number | Yes | Authoritative turn number after resolution. |
| `session` | `GameSession` or null | No | Full authoritative session snapshot when included. |

### Validation Rules

- Result status must be a resolved status, not `Pending`.
- `turnNumber` must be non-negative.
- If no full session snapshot is included, referenced piece/tile/player identifiers must be reconciled against the current game session or trigger a refresh.
- Correct results move the piece to the target tile and assign target ownership to the acting player.
- Incorrect and expired results keep the piece on the source tile and preserve target ownership unless the authoritative snapshot says otherwise.

## ConquestUiState

Transient client state for question display and interaction.

| Field | Type | Notes |
|-------|------|-------|
| `question` | `GameplayQuestion` or null | Active question visible to all players. |
| `selectedAnswerId` | string or null | Acting player's selected answer before Submit. |
| `pendingAttempt` | boolean | Attempt creation is in progress. |
| `pendingAnswer` | boolean | Submit is in progress. |
| `expiredPending` | boolean | Local timer expired; awaiting authoritative resolution. |
| `lastResult` | `ConquestResult` or null | Most recent result for feedback. |
| `resultVisibleUntilUtc` | string or null | About 3 seconds after result display begins. |
| `blockingError` | string or null | Malformed question or unresolved desync state. |
| `liveMessage` | string | Announcement text for assistive technology. |

### State Rules

- Only one active question is allowed for the current game session.
- Non-acting players can view `question` but cannot set `selectedAnswerId` or submit.
- Selecting an answer does not submit it.
- Submit requires a selected answer and an active pending question.
- `expiredPending` disables answer submission until an authoritative result or refresh resolves the attempt.
- `lastResult` drives temporary result feedback and then clears/returns focus after about 3 seconds.

## GameSession Interaction

Existing game session entities remain authoritative for:

- board dimensions
- tiles and tile ownership
- pieces and piece positions
- current turn player
- turn number
- game status
- completion/cancellation state

Conquest modifies game session state only through authoritative conquest results, full game snapshots, or realtime events.
