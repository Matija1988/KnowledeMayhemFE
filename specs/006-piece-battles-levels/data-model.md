# Data Model: Piece Battles, Special Fields, and Level Progression

## Piece

Represents a movable player piece in an active game session.

**Fields**:

- `id`: Stable piece identifier.
- `gameSessionId`: Owning game session.
- `ownerPlayerId`: Player who owns the piece.
- `currentTileId`: Current occupied tile, absent when captured.
- `level`: Integer level, starting at 1 and capped at 3.
- `isCaptured`: Whether the piece is out of active play.
- `capturedAtUtc`: Capture timestamp when applicable.
- `isActive`: Derived as not captured and assigned to a current tile.

**Validation rules**:

- New session pieces start at level 1.
- Level cannot exceed 3 in this release.
- Captured pieces cannot move, attack, defend, occupy tiles, or be selected as valid targets.
- Level progression is applied only by authoritative battle/special success outcomes.

## Board Tile

Represents a board location with category, ownership, and occupancy.

**Fields**:

- `id`: Stable tile identifier.
- `gameSessionId`: Owning game session.
- `x`, `y`: Board coordinates.
- `categoryId`: Question category used for attempts on this tile.
- `tileType`: `normal`, `special`, or `blocked`.
- `ownerPlayerId`: Current owner, if any.
- `occupyingPieceId`: Active occupying piece, if any.

**Validation rules**:

- Blocked tiles cannot be targeted by battle or special field attempts.
- Battle target must be reachable, enemy-occupied, and not occupied by the acting player.
- Special field target must be reachable, special, and unoccupied.
- Ownership changes only after authoritative success outcomes.

## Battle Attempt

Represents an attack from one active piece against an adjacent enemy piece.

**Fields**:

- `id`: Attempt identifier.
- `gameSessionId`: Owning game session.
- `actingPlayerId`: Player who initiated the battle.
- `attackingPieceId`: Active attacking piece.
- `defendingPieceId`: Active defending piece.
- `sourceTileId`: Attacker starting tile.
- `targetTileId`: Defender tile.
- `categoryId`: Target tile question category.
- `requiredCorrectAnswers`: Defender level plus one.
- `correctAnswers`: Current correct answer count.
- `status`: `pending`, `succeeded`, `failed`, `expired`, or `cancelled`.
- `currentQuestionAttemptId`: Active question attempt, if pending.
- `createdAtUtc`, `completedAtUtc`: Lifecycle timestamps.

**State transitions**:

- `pending -> succeeded`: Required correct answer count reached.
- `pending -> failed`: Incorrect answer submitted.
- `pending -> expired`: Active question expires.
- `pending -> cancelled`: Server cancels due stale session/turn state.

**Validation rules**:

- Only the current-turn player can start or answer.
- Another pending conquest, battle, or special field attempt blocks start.
- Incorrect answer and expiration preserve board state and advance the turn.
- Success captures defender, moves attacker, changes target ownership, applies level progression, and advances the turn.

## Special Field Attempt

Represents a current-turn attempt to conquer an unoccupied special field.

**Fields**:

- `id`: Attempt identifier.
- `gameSessionId`: Owning game session.
- `actingPlayerId`: Player who initiated the attempt.
- `pieceId`: Active acting piece.
- `sourceTileId`: Piece starting tile.
- `targetTileId`: Special tile target.
- `categoryId`: Target tile question category.
- `requiredCorrectAnswers`: Always 3 in this release.
- `correctAnswers`: Current correct answer count.
- `status`: `pending`, `succeeded`, `failed`, `expired`, or `cancelled`.
- `currentQuestionAttemptId`: Active question attempt, if pending.
- `createdAtUtc`, `completedAtUtc`: Lifecycle timestamps.

**State transitions**:

- `pending -> succeeded`: Three correct answers reached.
- `pending -> failed`: Incorrect answer submitted.
- `pending -> expired`: Active question expires.
- `pending -> cancelled`: Server cancels due stale session/turn state.

**Validation rules**:

- Target must be reachable, special, and unoccupied.
- Success moves the acting piece, changes ownership, applies level progression only to the acting piece, and advances the turn.
- Failure or expiration preserves board state and advances the turn.

## Question Attempt

Represents one issued question inside a battle or special-field attempt.

**Fields**:

- `id`: Question attempt identifier.
- `parentAttemptId`: Battle or special attempt identifier.
- `questionId`: Question identifier.
- `categoryId`: Category identifier.
- `categoryName`: Display category.
- `questionText`: Safe question text.
- `answerOptions`: Safe answer option identifiers and text.
- `selectedAnswerId`: Submitted answer, only after resolution.
- `status`: `pending`, `correct`, `incorrect`, or `expired`.
- `expiresAtUtc`: Optional expiration timestamp.

**Validation rules**:

- Safe payloads must not expose correct answer ids or correctness metadata before resolution.
- All players may view question text/options/progress.
- Only the acting player can submit an answer.
- Submitted answer must belong to the issued question.

## Battle/Special Result

Represents a resolved attempt outcome delivered by REST response or realtime event.

**Fields**:

- `attemptId`: Resolved attempt identifier.
- `gameSessionId`: Owning session.
- `status`: Final attempt status.
- `reason`: `completed`, `incorrect-answer`, `expired`, `invalidated`, or `cancelled`.
- `movedPieceId`: Piece moved on success.
- `capturedPieceId`: Captured defender for battle success.
- `leveledPieceId`: Piece leveled on success.
- `newLevel`: New level when progression is applied.
- `changedTiles`: Source/target tile changes.
- `nextTurnPlayerId`: Authoritative next current-turn player.
- `sequence`: Monotonic event/snapshot sequence for stale update rejection.

**Validation rules**:

- Result application must be idempotent for duplicate realtime events.
- Older sequence values must not overwrite newer snapshot state.
- Result feedback must not reveal hidden correctness before resolution.

## Realtime Gameplay Event

Represents an authoritative message received from the game SignalR hub.

**Event families**:

- Battle: started, question issued, progress updated, succeeded, failed.
- Special field: started, question issued, progress updated, conquered, failed.
- Piece: captured, leveled up.
- Session: turn advanced, snapshot required.

**Validation rules**:

- Events must include `gameSessionId`, `sequence`, and enough ids to reconcile against local state.
- Unknown event versions or stale sequences trigger a snapshot refresh instead of partial application.
- Presentational components consume mapped domain events, not raw hub payloads.
