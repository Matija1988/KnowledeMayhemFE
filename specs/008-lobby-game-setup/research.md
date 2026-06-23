# Research: Lobby Game Setup

## Decision: Backend-authoritative setup state with version checks

**Decision**: Store a monotonic `setupVersion` value on the lobby and require ready/start requests to include the version the client acted on. Keep `updatedAtUtc` as display/audit metadata only.

**Rationale**: The spec requires stale ready/start actions to be rejected and the frontend to reconcile to the latest snapshot. A server-owned version makes conflicts deterministic and keeps the frontend from guessing whether its local lobby state is current.

**Alternatives considered**:

- Accept actions whenever the current backend state is valid. Rejected because the user explicitly chose stale-action rejection and automatic reconcile.
- Frontend-only stale blocking. Rejected because missed SignalR events and reconnects can leave clients stale.

## Decision: Full lobby snapshot is the primary realtime reconciliation payload

**Decision**: Broadcast a full authoritative lobby snapshot after setup changes, while optionally retaining named event labels for category, color, readiness, and setup status changes.

**Rationale**: Existing frontend lobby state already reconciles around snapshots, and full snapshots prevent partial event ordering issues from leaving different clients with different readiness or color state.

**Alternatives considered**:

- Patch-only events. Rejected because concurrent color conflicts, host transfer, and readiness resets become harder to reconcile.
- Polling. Rejected because the feature requires realtime visibility without refresh.

## Decision: Preserve existing readiness when a new player joins

**Decision**: When a new player joins after existing players are ready, existing readiness is preserved; the new player starts without color and not ready.

**Rationale**: This follows the clarification answer, avoids needless reset churn, and still blocks game start until the new player satisfies setup rules.

**Alternatives considered**:

- Reset everyone on join. Rejected because it creates unnecessary repeated work.
- Block joining after readiness. Rejected because readiness does not mean the host has started the game.

## Decision: Host transfer preserves setup selections and resets readiness

**Decision**: If host transfer occurs before start, preserve selected categories and remaining player colors, reset all remaining readiness, and recalculate start eligibility for the new host.

**Rationale**: This keeps useful setup work while requiring the new host and remaining players to explicitly confirm the configuration after ownership changes.

**Alternatives considered**:

- Preserve readiness. Rejected because a new host may inherit a setup they did not confirm.
- Reset all setup. Rejected because it discards valid categories and colors without need.

## Decision: Snapshot selected categories into gameplay at start

**Decision**: Store selected category references on the created game session at start and use that snapshot for board/question category selection.

**Rationale**: Active games must remain stable if QuestionBank categories are later deactivated or edited. Category activity is validated before start; gameplay uses the captured start snapshot.

**Alternatives considered**:

- Read live category state during gameplay. Rejected because post-start admin edits could change active games.
- Block category deactivation while active games use it. Rejected as a broader QuestionBank workflow change not required by the feature.

## Decision: Transfer lobby player colors to game players

**Decision**: Store each lobby player's selected color on the corresponding game player at start.

**Rationale**: The UI needs durable piece identity during gameplay, and color selection is part of the configured setup contract.

**Alternatives considered**:

- Keep colors only in frontend state. Rejected because reconnect and multi-client gameplay require server-authoritative colors.
- Derive colors from player order. Rejected because players explicitly choose colors.

## Decision: No new frontend dependency

**Decision**: Use existing React, Zustand, Tailwind CSS, SignalR, MSW, Vitest, React Testing Library, and Playwright tooling.

**Rationale**: The feature is form/state/realtime integration work and can be implemented with existing project tools. Avoiding new packages satisfies supply-chain and constitution constraints.

**Alternatives considered**:

- Add a server-state library. Rejected because current project guidance requires project-owned API wrappers and Zustand feature state.
