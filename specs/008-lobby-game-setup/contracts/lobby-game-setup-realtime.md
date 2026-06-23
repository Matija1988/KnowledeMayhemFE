# Realtime Contract: Lobby Game Setup

SignalR hub: `{VITE_API_BASE_URL}/hubs/lobbies`

All events are authoritative hints. The client must reconcile by applying the included full lobby snapshot or by refetching the lobby when a payload cannot be mapped safely.

## Events

### `LobbySetupChanged`

Published after any setup-affecting change.

```json
{
  "lobby": {
    "id": "guid",
    "code": "ABC123",
    "hostUserId": "guid",
    "status": "Open",
    "maxPlayers": 2,
    "expiresAtUtc": "2026-06-22T18:00:00Z",
    "createdAtUtc": "2026-06-22T17:45:00Z",
    "startedAtUtc": null,
    "closedAtUtc": null,
    "selectedCategoryIds": ["guid"],
    "setupStatus": "Pending",
    "setupVersion": 4,
    "updatedAtUtc": "2026-06-22T17:50:00Z",
    "players": [
      {
        "userId": "guid",
        "joinedAtUtc": "2026-06-22T17:45:10Z",
        "selectedPieceColor": "Red",
        "isReady": false
      }
    ]
  },
  "reason": "CategoriesUpdated"
}
```

Allowed `reason` values:

- `CategoriesUpdated`
- `PlayerColorSelected`
- `PlayerReadyChanged`
- `PlayerJoined`
- `PlayerLeft`
- `HostTransferred`
- `SetupRecalculated`

### `LobbyStartedEvent`

Existing start event is extended so the handoff can include configured setup.

```json
{
  "lobbyId": "guid",
  "sessionId": "guid",
  "initialState": {
    "lobbyId": "guid",
    "orderedPlayerIds": ["guid", "guid"],
    "createdAtUtc": "2026-06-22T17:55:00Z",
    "selectedCategoryIds": ["guid"],
    "playerColors": {
      "guid": "Red",
      "guid-2": "Blue"
    }
  }
}
```

## Client Handling Rules

- Map the payload through central realtime contracts before store updates.
- Replace lobby setup state from the full snapshot.
- Announce setup changes through the existing lobby live region.
- If mapping fails, show a safe validation message and refetch `/api/lobbies/{lobbyId}`.
- On reconnect, join the lobby group and request/refetch the latest lobby snapshot before enabling setup actions.
