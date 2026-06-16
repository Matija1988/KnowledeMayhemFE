# Data Model: Lobby View, Start, and Manage

## Lobby

Represents the authoritative waiting room shown to participants.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Stable lobby identifier used in lobby room routes. |
| `code` | string | Yes | Unique invite code displayed and copied by users. |
| `hostUserId` | string | Yes | User id of the current host. |
| `status` | `LobbyStatus` | Yes | One of `Open`, `Started`, `Closed`, `Cancelled`. |
| `maxPlayers` | number | Yes | Allowed values are 2, 3, or 4. |
| `expiresAtUtc` | ISO UTC string | Yes | Used for visible expiration and start-disable checks. |
| `createdAtUtc` | ISO UTC string | Yes | Creation timestamp. |
| `startedAtUtc` | ISO UTC string or null | Yes | Present when the lobby has started. |
| `closedAtUtc` | ISO UTC string or null | Yes | Present when the lobby has closed. |
| `players` | `LobbyPlayer[]` | Yes | Current participant list from backend authority. |

### Validation Rules

- `maxPlayers` must be 2, 3, or 4.
- `players.length` must not exceed `maxPlayers`.
- Start is allowed from the UI only when status is `Open`, the current user is host, the lobby is not expired, no start request is pending, and there are 2 to 4 players.
- Expiration is evaluated in the UI for disabled states, but backend responses remain authoritative.
- Host display is derived from `hostUserId` and the current authenticated user's id.

### State Transitions

```text
Open -> Started
Open -> Cancelled
Open -> Closed
Started -> Closed
```

Host transfer may occur while the lobby is open when the host leaves. The lobby closes
automatically when the last player leaves. Realtime events and refreshed lobby details must
reconcile with the latest known lobby state.

## LobbyPlayer

Represents one authenticated participant in a lobby.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `userId` | string | Yes | Used for host and current-player checks. |
| `joinedAtUtc` | ISO UTC string | Yes | Join timestamp for ordering or display if needed. |

### Validation Rules

- `userId` must be stable and comparable with the authenticated user id.
- Display names are not required unless already available from auth or user context.

## LobbyStatus

Represents the lobby lifecycle state.

| Value | Meaning |
|-------|---------|
| `Open` | Players may join and participants may leave; host may cancel or start when valid. |
| `Started` | The lobby has produced a game session handoff. |
| `Closed` | The lobby is no longer active, usually because it emptied or expired. |
| `Cancelled` | The host cancelled the lobby. |

## StartLobbyResult

Represents the successful handoff from lobby to game session.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `sessionId` | string | Yes | Used to navigate to `/game/:sessionId`. |
| `initialState` | `InitialGameState` | Yes | Minimal game handoff state returned by the backend. |
| `lobby` | `Lobby` | Yes | Authoritative lobby snapshot after start. |

## InitialGameState

Minimal gameplay handoff data returned by start.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `lobbyId` | string | Yes | Links the session to the originating lobby. |
| `orderedPlayerIds` | string[] | Yes | Authoritative player order for the created game session. |
| `createdAtUtc` | ISO UTC string | Yes | Session creation timestamp. |

## LeaveLobbyResult

Represents the result of a leave operation.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `lobby` | `Lobby` or null | Yes | Updated lobby when it still exists; null when it closed or the user lost access. |
| `closed` | boolean | Yes | True when leaving caused or observed lobby closure. |
| `newHostUserId` | string or null | No | Present when host transfer is reported. |

## CancelLobbyResult

Represents the result of a cancel operation.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `lobby` | `Lobby` | Yes | Cancelled lobby snapshot. |

## ActiveLobbyConflict

Represents a create/join response indicating the current user already has an active lobby.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `lobby` | `Lobby` or null | No | Existing active lobby when returned inline. |
| `lobbyId` | string or null | No | Identifier to fetch if full lobby is not returned. |
| `message` | string | No | User-facing fallback text from the backend. |

### Validation Rules

- The frontend must be able to show or retrieve the existing active lobby before navigating.
- If neither `lobby` nor `lobbyId` is available, show a centralized error because the active lobby cannot be recovered deterministically.

## RealtimeLobbyEvent

Represents authoritative lobby updates received from the lobby hub.

| Event | Payload | Effect |
|-------|---------|--------|
| `LobbySnapshot` | `Lobby` | Replace or reconcile current lobby state. |
| `PlayerJoined` | `Lobby` or player plus lobby id | Update player list and announce the join. |
| `PlayerLeft` | `Lobby` or player id plus lobby id | Update player list and announce the leave. |
| `HostChanged` | lobby id plus `hostUserId` or `Lobby` | Move host badge and update host-only action state. |
| `LobbyStarted` | `StartLobbyResult` or lobby/session ids | Preserve handoff and navigate to the game session. |
| `LobbyClosed` | `Lobby` or lobby id plus reason | Show closed/lost-access feedback and return users as appropriate. |
| `LobbyCancelled` | `Lobby` or lobby id | Show cancellation feedback; host cancellation success returns the user to `/lobby`. |

## ConnectionState

Represents the user's ability to receive lobby updates.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `status` | `idle` \| `connecting` \| `connected` \| `reconnecting` \| `disconnected` \| `error` | Yes | Displayed in the lobby room. |
| `message` | string or null | No | User-facing connection issue or recovery text. |
| `lastUpdatedAtUtc` | ISO UTC string or null | No | Useful for diagnostics and tests. |

## Store State

The lobby store should keep:

- `currentLobby`: `Lobby | null`
- `connection`: `ConnectionState`
- `pendingOperation`: create, join, read, leave, cancel, start, or null
- `lastStartResult`: `StartLobbyResult | null`
- derived selectors for `isHost`, `canStart`, `isExpired`, player count, and disabled reasons

The store must remain separate from auth, global loading, and global error stores.
