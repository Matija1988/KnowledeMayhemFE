# SignalR Contract: Lobby Hub

## Hub URL

```text
{VITE_API_BASE_URL}/hubs/lobbies
```

The URL must be derived from the same configured backend base URL used for REST calls.

## Authentication

The connection uses JWT bearer authentication through SignalR's access token factory:

```text
accessTokenFactory: () => accessToken
```

Browser credentials remain omitted unless a backend environment explicitly enables and requires credentialed browser requests.

## Connection Responsibilities

The frontend lobby hub service owns:

- connection creation and disposal
- automatic reconnect
- event registration
- lobby group join/rejoin if required by backend contract
- dispatching authoritative updates into the lobby store
- exposing connection status for the lobby room

SignalR logic must not live inside presentational components.

## Client-Handled Events

Event names should be aligned with backend hub names during implementation. The frontend must handle these semantic events:

| Event | Payload | Required frontend behavior |
|-------|---------|----------------------------|
| `LobbySnapshot` | `LobbyDto` | Replace or reconcile the current lobby state. |
| `PlayerJoined` | `LobbyDto` or `LobbyPlayerEventDto` | Update visible player list/count and announce the join. |
| `PlayerLeft` | `LobbyDto` or `LobbyPlayerEventDto` | Update visible player list/count and announce the leave. |
| `HostChanged` | `LobbyDto` or `HostChangedEventDto` | Move host badge and update host-only action availability. |
| `LobbyStarted` | `StartLobbyResultDto` or `LobbyStartedEventDto` | Preserve session handoff and navigate to `/game/:sessionId`; show recovery action if navigation fails. |
| `LobbyClosed` | `LobbyDto` or `LobbyClosedEventDto` | Show closed/lost-access feedback and return the user to `/lobby` when current lobby access ends. |
| `LobbyCancelled` | `LobbyDto` or `LobbyCancelledEventDto` | Show cancellation feedback; current users should not continue using the room. |

## Event DTO Shapes

```ts
type LobbyPlayerEventDto = {
  lobbyId: string;
  player: {
    userId: string;
    joinedAtUtc: string;
  };
};

type HostChangedEventDto = {
  lobbyId: string;
  hostUserId: string;
};

type LobbyStartedEventDto = {
  lobbyId: string;
  sessionId: string;
  initialState?: {
    lobbyId: string;
    orderedPlayerIds: string[];
    createdAtUtc: string;
  };
};

type LobbyClosedEventDto = {
  lobbyId: string;
  reason?: "Empty" | "Expired" | "Closed";
};

type LobbyCancelledEventDto = {
  lobbyId: string;
};
```

If the backend sends full `LobbyDto` snapshots for events, the frontend should prefer those snapshots over local patching.

## Reconnect Behavior

On reconnect, the frontend must request or receive a fresh authoritative lobby snapshot before trusting stale lobby state. Duplicate or out-of-order events must not produce duplicate players or resurrect a closed/cancelled lobby.
