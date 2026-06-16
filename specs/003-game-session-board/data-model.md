# Data Model: Game Session & Board

## GameSession

Represents the authoritative playable game session.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable game session identifier used in `/game/:sessionId`. |
| `lobbyId` | string | Yes | Origin lobby id. |
| `status` | `GameSessionStatus` | Yes | One of `InProgress`, `Completed`, `Cancelled`. |
| `boardSeed` | string or number | Yes | Display/debug metadata only; frontend does not generate the board from it. |
| `boardWidth` | number | Yes | Positive board width from backend authority. |
| `boardHeight` | number | Yes | Positive board height from backend authority. |
| `currentTurnPlayerId` | string or null | Yes | Current turn player while in progress. |
| `turnNumber` | number | Yes | Monotonic turn counter from backend authority. |
| `startedAtUtc` | ISO UTC string | Yes | Session start timestamp. |
| `endedAtUtc` | ISO UTC string or null | Yes | Present when completed or cancelled. |
| `winnerPlayerId` | string or null | Yes | Present when backend has determined a winner. |
| `createdAtUtc` | ISO UTC string | Yes | Session creation timestamp. |
| `players` | `GamePlayer[]` | Yes | Authoritative participant list. |
| `tiles` | `BoardTile[]` | Yes | Authoritative board tiles. |
| `pieces` | `Piece[]` | Yes | Authoritative pieces. |

### Validation Rules

- `boardWidth` and `boardHeight` must be positive.
- `tiles` must not contain duplicate coordinate pairs.
- Every tile coordinate must be within `0 <= x < boardWidth` and `0 <= y < boardHeight`.
- A playable board requires exactly one tile for every coordinate in the rectangular board.
- `currentTurnPlayerId` must reference a known player while status is `InProgress`.
- Malformed or internally inconsistent snapshots are blocking errors and must not render as playable boards.

### State Transitions

```text
InProgress -> Completed
InProgress -> Cancelled
```

The frontend displays completed and cancelled as blocking states and does not expose move controls.

## GameSessionStatus

| Value | Meaning |
|-------|---------|
| `InProgress` | Players can take turns and the current player may move an eligible piece. |
| `Completed` | The game has ended and movement is unavailable. |
| `Cancelled` | The game has been cancelled and movement is unavailable. |

## GamePlayer

Represents one participant in a game session.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable player id used by pieces, turns, and ownership. |
| `gameSessionId` | string | Yes | Owning session id. |
| `userId` | string | Yes | Used to identify the current user's player. |
| `playerOrder` | number | Yes | Deterministic player ordering for the panel and turn context. |
| `displayName` | string or null | No | Preferred display label when present. |
| `isEliminated` | boolean | Yes | Eliminated players cannot act when backend marks them eliminated. |
| `createdAtUtc` | ISO UTC string | Yes | Player creation timestamp. |

### Validation Rules

- `id` and `userId` must be stable and comparable.
- `playerOrder` is used for deterministic display and should be unique within a session.
- Missing display names fall back to stable user or player identifiers.

## BoardTile

Represents one coordinate on the backend-generated board.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable tile id. |
| `gameSessionId` | string | Yes | Owning session id. |
| `x` | number | Yes | Horizontal coordinate. |
| `y` | number | Yes | Vertical coordinate. |
| `categoryId` | string or null | No | Question category indicator shown on the tile when present. |
| `ownerPlayerId` | string or null | Yes | Owning player after backend ownership changes. |
| `occupyingPieceId` | string or null | Yes | Piece currently on the tile, if any. |
| `tileType` | `TileType` | Yes | One of `Normal`, `Blocked`. |
| `createdAtUtc` | ISO UTC string | Yes | Tile creation timestamp. |

### Validation Rules

- Coordinates must be in bounds for the session dimensions.
- `ownerPlayerId`, when present, must reference a known player.
- `occupyingPieceId`, when present, must reference a known uncaptured piece.
- `Blocked` tiles are not valid movement targets.

## TileType

| Value | Meaning |
|-------|---------|
| `Normal` | The tile may be shown as a candidate target if all movement rules pass. |
| `Blocked` | The tile is not a valid target and must be visually/accessibly blocked. |

## Piece

Represents one movable unit owned by a game player.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable piece id used in move requests. |
| `gameSessionId` | string | Yes | Owning session id. |
| `ownerPlayerId` | string | Yes | Game player who owns the piece. |
| `currentTileId` | string | Yes | Current tile id from backend authority. |
| `level` | number | Yes | Starts at 1 for this feature; leveling is out of scope. |
| `isCaptured` | boolean | Yes | Captured pieces are displayed as unavailable and cannot be moved. |
| `createdAtUtc` | ISO UTC string | Yes | Piece creation timestamp. |

### Validation Rules

- `ownerPlayerId` must reference a known player.
- `currentTileId` must reference a known tile for uncaptured pieces.
- A piece is selectable only when the session is in progress, the current user owns it through
  their game player, the piece is not captured, it is that player's turn, and no move is pending.

## MoveRequest

Represents a player's move attempt.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `pieceId` | string | Yes | Selected piece id. |
| `targetX` | number | Yes | Target tile x coordinate. |
| `targetY` | number | Yes | Target tile y coordinate. |

### Validation Rules

- The frontend helper highlights only one-tile orthogonal targets.
- Diagonal, multi-tile, blocked, occupied, missing, and jumping targets are not helper-valid.
- Backend validation remains authoritative; frontend helper validity never commits durable state.

## GameActionResult

Represents authoritative move or future turn-action results.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `session` | `GameSession` | Yes | Authoritative session snapshot after the action. |
| `turn` | `TurnState` | Yes | Authoritative turn state after the action. |

## TurnState

Represents current turn metadata.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `gameSessionId` | string | Yes | Owning session id. |
| `currentTurnPlayerId` | string or null | Yes | Current player while the game is in progress. |
| `turnNumber` | number | Yes | Current turn number from backend authority. |
| `status` | string or null | No | Optional backend turn status, if returned. |

## RealtimeGameEvent

Represents authoritative game updates received from the game hub.

| Event | Payload | Effect |
|-------|---------|--------|
| `GameSessionCreated` | `GameActionResult` or `GameSession` | Store or refresh the session when relevant. |
| `GameStarted` | `GameActionResult` or `GameSession` | Load the playable session snapshot. |
| `GameMoveExecuted` | `GameActionResult` or move event with session snapshot | Apply authoritative board, pieces, ownership, and turn state. |
| `GameTileOwnershipChanged` | `GameActionResult`, `GameSession`, or tile ownership patch | Update ownership from authoritative payload or refresh snapshot. |
| `GameTurnAdvanced` | `GameActionResult`, `GameSession`, or turn event | Update current turn player and turn number. |
| `GameCompleted` | `GameActionResult` or `GameSession` | Show completed blocking state and disable movement. |
| `GameCancelled` | `GameActionResult` or `GameSession` | Show cancelled blocking state and disable movement. |

Question/conquest realtime events are intentionally ignored or logged for this feature unless they
carry a full authoritative session snapshot needed to keep the board consistent.

## ConnectionState

Represents the user's ability to receive game updates.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `status` | `idle` \| `connecting` \| `connected` \| `reconnecting` \| `disconnected` \| `error` | Yes | Displayed on the game screen. |
| `message` | string or null | No | User-facing connection issue or recovery text. |
| `lastUpdatedAtUtc` | ISO UTC string or null | No | Useful for diagnostics and tests. |

## Store State

The game store should keep:

- `session`: `GameSession | null`
- `playersById`, `tilesById`, `piecesById`: normalized authoritative lookup data
- `connection`: `ConnectionState`
- `selectedPieceId`: `string | null`
- `candidateTargets`: coordinate list derived from current authoritative state
- `pendingMove`: selected piece/target or null
- `blockingError`: malformed snapshot, completed/cancelled, unavailable, reconnect failure, or null
- `lastMoveMessage`: success or error message for live-region/toast feedback
- derived selectors for current user player, is current turn, selectable pieces, piece-on-tile,
  tile coordinates, canMove, disabled reasons, and board render cells

Authoritative data must be replaced or reconciled from mapped REST/SignalR payloads. Derived
lookup maps can be recomputed from authoritative snapshots but must not become independent
gameplay authority.
