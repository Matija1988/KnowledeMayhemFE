# Data Model: Lobby Game Setup

## Lobby

Represents an open lobby before game start.

**New or extended fields**

- `selectedCategoryIds`: collection of category identifiers selected by the host.
- `setupStatus`: `Pending` or `Ready`.
- `setupVersion`: monotonic value used to reject stale ready/start requests.
- `updatedAtUtc`: latest setup update timestamp for display and auditing.

**Relationships**

- Has many `LobbyPlayer`.
- References one or more active QuestionBank categories while open.
- Produces one `GameSession` when started.

**Validation rules**

- Category updates are allowed only for the host.
- Category updates are allowed only while lobby status is `Open` and the lobby is not expired.
- Selection must contain at least one category.
- Category identifiers must be unique.
- Categories must exist and be active at the time of selection and game start.
- Changing categories resets readiness for all joined players.
- Setup is ready only when all start requirements are satisfied.

## LobbyPlayer

Represents a user joined to a lobby.

**New or extended fields**

- `selectedPieceColor`: nullable allowed color.
- `isReady`: readiness flag.

**Validation rules**

- A player can select only their own color.
- Color selection is allowed only while lobby status is `Open` and not expired.
- Allowed colors: `Red`, `Blue`, `Green`, `Yellow`, `Purple`, `Orange`.
- A color can be used by only one current player in the same lobby.
- Changing color resets only that player's readiness.
- A player can become ready only after selecting a valid, unique color.
- Host is treated as a normal joined player for color and readiness.
- New players join without color and not ready.

## Lobby Setup State

Represents the combined setup readiness derived from lobby categories and player setup.

**Fields**

- `setupStatus`: `Pending` or `Ready`.
- `canStart`: derived boolean.
- `blockingReasons`: user-facing setup validation reasons.
- `setupVersion`: canonical stale-check token that clients submit with ready/start requests.

**State transitions**

- `Pending -> Ready`: all start requirements are satisfied.
- `Ready -> Pending`: categories change, any player changes color, host transfer resets readiness, a player leaves causing player count to fall below 2, a new player joins without readiness, a selected category becomes inactive before start, or lobby expires.
- `Pending/Ready -> locked`: lobby starts and setup becomes immutable.

## Question Category Reference

Represents a selectable active category from QuestionBank.

**Fields**

- `categoryId`
- `name`
- `isActive`

**Validation rules**

- Only active categories can be selected before start.
- If a selected category becomes inactive before start, start readiness becomes invalid until the host updates the selection.

## GameSession

Represents a started game created from a configured lobby.

**New or extended fields**

- `selectedCategoryIds`: category snapshot captured at start.

**Validation rules**

- Category snapshot is immutable for the active game.
- Later QuestionBank category changes do not alter the game session snapshot.
- Board category assignment uses only the captured category snapshot.

## GamePlayer

Represents a lobby player transferred into gameplay.

**New or extended fields**

- `pieceColor`: selected lobby piece color captured at start.

**Validation rules**

- Every game player must have a unique valid piece color.
- Game player colors are immutable after game start.

## Realtime Setup Event

Represents authoritative lobby setup changes delivered to connected clients.

**Payload strategy**

- Full `Lobby` snapshot is the canonical payload.
- Event names may identify the cause: categories updated, player color selected, readiness changed, setup changed, game started.

**Validation rules**

- Clients replace or reconcile from the authoritative snapshot.
- Reconnect requests a fresh lobby snapshot before setup actions continue.
