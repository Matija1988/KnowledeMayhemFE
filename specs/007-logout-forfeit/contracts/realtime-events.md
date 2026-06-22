# Realtime Contracts: Logout and Active Game Forfeit Handling

All event names and payloads are planning contracts. Backend `Contracts.Realtime` records and frontend `src/realtime/*Events.ts` types must be aligned before implementation is complete.

## Lobby Events

### `LobbyUpdated`

Emitted when logout removes a lobby member, transfers host, or closes the lobby.

```json
{
  "lobbyId": "uuid",
  "status": "Waiting|Started|Closed",
  "hostUserId": "uuid|null",
  "players": [],
  "reason": "playerLoggedOut|hostTransferred|lobbyClosed"
}
```

## Game Events

### `PlayerForfeited`

Emitted when explicit logout eliminates a player from an active game.

```json
{
  "gameSessionId": "uuid",
  "playerId": "uuid",
  "userId": "uuid",
  "eliminatedAtUtc": "date-time",
  "eliminationReason": "forfeit",
  "disabledPieceIds": ["uuid"],
  "cancelledAttempt": {
    "attemptId": "uuid",
    "kind": "conquest|battle|specialField",
    "status": "cancelled",
    "cancelledAtUtc": "date-time"
  }
}
```

### `PendingAttemptCancelled`

Emitted when a logout-forfeit cancels a pending attempt.

```json
{
  "gameSessionId": "uuid",
  "attemptId": "uuid",
  "kind": "conquest|battle|specialField",
  "playerId": "uuid",
  "cancelledAtUtc": "date-time",
  "reason": "logoutForfeit"
}
```

## Existing Events Reused

- `GameTurnAdvanced` is emitted if forfeit moves turn to the next non-eliminated player.
- `GameSnapshotRequired` is emitted when clients should reload an authoritative snapshot.
- A game-completed event or snapshot-required event must make winner/completion visible if the game ends due to forfeit. If no existing game-completed event exists, add `GameCompleted`.

### `GameCompleted`

```json
{
  "gameSessionId": "uuid",
  "winnerPlayerId": "uuid",
  "endedAtUtc": "date-time",
  "reason": "forfeit"
}
```

## Frontend Handling Rules

- Apply events only through centralized realtime modules and domain stores.
- Clear pending question/attempt UI when `PendingAttemptCancelled` or `PlayerForfeited` references the visible attempt.
- Disable or remove forfeited player pieces based on the authoritative event/snapshot.
- Remove stale available actions for eliminated players and completed sessions.
- If an event payload is incomplete or arrives out of order, request or load an authoritative game snapshot.
