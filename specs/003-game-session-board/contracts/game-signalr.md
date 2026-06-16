# SignalR Contract: Game Hub

## Hub URL

```text
{VITE_API_BASE_URL}/hubs/game
```

The URL must be derived from the same configured backend base URL used for REST calls.

## Authentication

The connection uses JWT bearer authentication through SignalR's access token factory:

```text
accessTokenFactory: () => accessToken
```

Browser credentials remain omitted unless a backend environment explicitly enables and requires
credentialed browser requests.

## Connection Responsibilities

The frontend game hub service owns:

- connection creation and disposal
- automatic reconnect
- event registration
- game session group join/rejoin if required by backend contract
- dispatching authoritative updates into the game store
- exposing connection status for the game screen
- requesting or receiving a fresh authoritative snapshot after reconnect

SignalR logic must not live inside presentational components.

## Client-Handled Events

Event names must align with backend hub names during implementation. The frontend must handle these semantic events:

| Event | Payload | Required frontend behavior |
|-------|---------|----------------------------|
| `GameSessionCreated` | `GameActionResultDto` or `GameSessionDto` | Store or refresh the session when it matches the viewed session. |
| `GameStarted` | `GameActionResultDto` or `GameSessionDto` | Load the playable session snapshot and clear stale lobby handoff state. |
| `GameMoveExecuted` | `GameActionResultDto` or `GameMoveExecutedEventDto` | Apply authoritative board, piece, ownership, and turn state; clear matching pending move. |
| `GameTileOwnershipChanged` | `GameActionResultDto`, `GameSessionDto`, or `GameTileOwnershipChangedEventDto` | Update ownership from the authoritative payload or request a fresh session snapshot. |
| `GameTurnAdvanced` | `GameActionResultDto`, `GameSessionDto`, or `GameTurnAdvancedEventDto` | Update current turn player, turn number, and live-region message. |
| `GameCompleted` | `GameActionResultDto` or `GameSessionDto` | Show completed blocking state and disable movement. |
| `GameCancelled` | `GameActionResultDto` or `GameSessionDto` | Show cancelled blocking state and disable movement. |

The backend may also emit conquest/question events. Feature 3 does not expose conquest/question UI;
the frontend should ignore those events unless they include a full authoritative session snapshot
that must be reconciled to keep the board current.

## Event DTO Shapes

```ts
type GameActionResultDto = {
  session: GameSessionDto;
  turn: TurnStateDto;
};

type GameMoveExecutedEventDto = {
  gameSessionId: string;
  pieceId: string;
  fromX?: number;
  fromY?: number;
  targetX: number;
  targetY: number;
  session?: GameSessionDto;
  turn?: TurnStateDto;
};

type GameTileOwnershipChangedEventDto = {
  gameSessionId: string;
  tileId: string;
  ownerPlayerId: string | null;
  session?: GameSessionDto;
};

type GameTurnAdvancedEventDto = {
  gameSessionId: string;
  currentTurnPlayerId: string | null;
  turnNumber: number;
  session?: GameSessionDto;
  turn?: TurnStateDto;
};
```

If the backend sends full `GameSessionDto` snapshots for events, the frontend should prefer those
snapshots over local patching. If an event only contains a patch and the patch cannot be safely
applied to the current known session, the frontend should refresh the full session before changing
durable board state.

## Reconnect Behavior

On reconnect, the frontend must refresh or receive a fresh authoritative game session snapshot
before trusting stale state. During reconnect snapshot refresh:

- connection status is visible
- movement is disabled
- pending move state is reconciled against the refreshed session
- selected piece and candidate target hints are cleared if the refreshed state invalidates them

Duplicate or out-of-order events must not resurrect stale board, turn, completed, or cancelled state.
