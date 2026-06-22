# Data Model: Logout and Active Game Forfeit Handling

## User Session / Token Revocation

Represents one authenticated access instance for a user.

**Fields**
- `userId`: user that owns the session/token
- `tokenId` or `sessionId`: unique identifier for the current authenticated session
- `expiresAtUtc`: when the token/session naturally expires
- `revokedAtUtc`: when explicit logout invalidated the session
- `revocationReason`: `Logout`

**Rules**
- Logout revokes only the current session/token.
- Revoked sessions must be rejected for protected actions.
- Sensitive token values must not be stored in audit logs.

## Logout Audit Record

Durable record of explicit logout and its consequences.

**Fields**
- `id`
- `userId`
- `loggedOutAtUtc`
- `revokedSessionId` or `revokedTokenId`
- `affectedLobbyId`
- `affectedGameSessionId`
- `pendingAttemptId`
- `pendingAttemptKind`
- `pendingAttemptOutcome`: `Cancelled` when present
- `forfeitedPlayerId`
- `winnerPlayerId`
- `gameCompleted`
- `outcome`: `LoggedOut`, `LobbyLeft`, `Forfeited`, `AlreadyLoggedOut`

**Rules**
- Duplicate logout requests must not duplicate audit, ranking, or forfeit outcomes.
- Audit records must not contain raw token values.

## Lobby Participation

Existing lobby membership affected by logout.

**Fields impacted**
- `lobbyId`
- `userId`
- `hostUserId`
- `status`
- `gameplaySessionId`
- membership list

**Rules**
- Lobby-only logout removes the user.
- Host logout applies existing host-transfer or close rules.
- If stale lobby membership exists while an active game participation also exists, active-game forfeit takes precedence and stale lobby membership is cleaned up.

## Game Session

Existing gameplay aggregate with completion changes.

**Fields impacted**
- `status`: `InProgress`, `Completed`, `Cancelled`
- `currentTurnPlayerId`
- `turnNumber`
- `winnerPlayerId`
- `endedAt`
- `players`
- `pieces`
- pending attempts

**Rules**
- 2-player active game completes immediately when one player logs out.
- 3-4 player active game continues unless only one non-eliminated player remains after forfeit.
- Turn order skips eliminated players.
- If the forfeiting player has the current turn, turn advances to the next non-eliminated player.

## Game Player

Existing player identity within a game.

**Current fields**
- `id`
- `gameSessionId`
- `userId`
- `playerOrder`
- `displayName`
- `isEliminated`
- `createdAt`

**New or expanded fields**
- `eliminatedAtUtc`
- `eliminationReason`: `Forfeit`, `Defeated`, `DisconnectedTimeout`

**Rules**
- Logout in active game sets `isEliminated = true`.
- Logout in active game sets `eliminatedAtUtc` to current UTC time.
- Logout in active game sets `eliminationReason = Forfeit`.
- Eliminated players cannot take gameplay actions.
- Players eliminated by logout forfeit are blocked from reopening that game session after re-authentication.

## Piece

Existing board piece controlled by a player.

**Fields impacted**
- `ownerPlayerId`
- `currentTileId`
- `isCaptured`
- `capturedAtUtc`
- active/inactive status if represented separately

**Rules**
- Forfeiting player's pieces must be removed from active play or disabled.
- Disabled/removed pieces cannot move, capture, level up, or drive ownership changes.
- Remaining visible board state must be consistent for all non-eliminated players.

## Pending Attempt

Unresolved conquest, battle, or special-field attempt.

**Kinds**
- `QuestionAttempt` / conquest question progress
- `BattleAttempt`
- `SpecialFieldAttempt`

**Fields impacted**
- `status`
- `cancelledAtUtc`
- `cancellationReason`: `LogoutForfeit`
- `playerId`
- `sourceTileId`
- `targetTileId`

**Rules**
- Logout cancels pending attempts before final forfeit outcome.
- Cancelled attempts do not move pieces.
- Cancelled attempts do not capture pieces.
- Cancelled attempts do not change piece levels.
- Cancelled attempts do not transfer tile ownership.
- Cancelled attempts do not count as failed answers or failed gameplay actions.

## Application Auth State

Frontend representation of current authentication.

**Fields**
- `isAuthenticated`
- `userId`
- `accessToken`
- `roles`
- `logoutStatus`: `idle`, `confirming`, `pending`, `succeeded`, `failed`
- `logoutError`
- `lastLogoutOutcome`

**Rules**
- Successful logout clears local auth state and token storage.
- Already-invalid session response also clears local auth state.
- Recoverable logout failure keeps the current protected context and shows retryable error.
- Duplicate logout activation is ignored while pending.

## Visible Game State

Frontend domain state rendered by gameplay screens.

**Fields**
- `sessionId`
- `status`
- `players`
- `pieces`
- `tiles`
- `currentTurnPlayerId`
- `winnerPlayerId`
- `pendingAttempt`
- `availableActions`
- `lastRealtimeEvent`

**Rules**
- Realtime forfeit/game completion events update player status, pieces, current turn, pending prompts, available actions, and outcome.
- Full snapshots reconcile missed or delayed realtime events.
- A forfeited user's old open game screen must not expose gameplay actions after logout or after an eliminated state update.
