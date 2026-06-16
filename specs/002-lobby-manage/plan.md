# Implementation Plan: Lobby View, Start, and Manage

**Branch**: `002-lobby-manage` | **Date**: 2026-06-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-lobby-manage/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build the authenticated lobby frontend slice: authenticated users can create lobbies, join by
code, view and manage lobby rooms, leave or cancel lobbies, start valid lobbies, and receive
authoritative lobby updates without refresh. The implementation extends the existing React +
TypeScript auth foundation with typed lobby API wrappers, frontend domain models and mappers,
a centralized SignalR lobby service, a Zustand lobby store, feature hooks, reusable dark blue
and white UI components, and focused tests for API, realtime, access, and accessibility
behavior.

## Technical Context

**Language/Version**: TypeScript 6.x with React 19.x, matching the current Vite project

**Primary Dependencies**: Existing React, Vite, Zustand, React Router, Tailwind CSS, CSS Modules, Vitest, React Testing Library, Playwright, and MSW. Add `@microsoft/signalr` for the approved centralized lobby realtime service, subject to package-lock review, `npm audit`, and current malware advisory checks before accepting the dependency update. `dnd-kit` is not used in this feature because board drag-and-drop is out of scope.

**Storage**: Browser-local auth persistence remains owned by the auth foundation. Lobby state is in a Zustand lobby store and is refreshed from REST responses and SignalR events; returned game-session handoff data is preserved only long enough to navigate to `/game/:sessionId` unless later gameplay planning defines durable session storage.

**Testing**: Vitest, React Testing Library, Playwright, and MSW. Unit/integration coverage must include lobby DTO mapping, API request options, store transitions, feature hooks, UI states, access-gated host actions, and SignalR event dispatch. Playwright covers create, join, host start/cancel, leave, route guard, and game handoff flows where feasible.

**Target Platform**: Browser frontend

**Project Type**: Single-page frontend application

**Performance Goals**: Lobby loading/error feedback appears within 500 ms of state changes under normal client conditions; create and join complete visible navigation in under 5 seconds for 95% of normal-network attempts; successful realtime player join/leave events update the visible list without refresh; route and event handling must not visibly flash unauthorized host controls or stale protected lobby state.

**Constraints**: Lobby membership and lifecycle remain backend-authoritative; no optimistic durable membership, host, status, start, cancel, or close changes. REST and SignalR payloads are mapped into domain models before UI use. SignalR logic is centralized outside presentational components. API and hub URLs derive from `VITE_API_BASE_URL`; HTTP requests use bearer auth and `credentials: "omit"` by default. UI follows the shared dark blue and white visual system with accessible labels, visible focus states, disabled reasons where practical, live regions, and no browser-default form styling. No vulnerable, compromised, malware-advised, or constitution-denied packages may be introduced.

**Scale/Scope**: One lobby landing route, one lobby room route, one game-session navigation handoff, up to four players per lobby, host-only start/cancel, participant leave, active-lobby conflict recovery, and centralized lobby realtime updates. Gameplay board rendering, quiz flow, chat, public lobby browsing, friend invites, ready checks, and profile display names are out of scope unless already available from auth context.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Server-authoritative gameplay**: Pass. Lobby membership, host transfer, status, expiration, cancellation, close, and start outcomes are treated as backend-authoritative and become durable UI state only from REST responses or SignalR events. Local pending state is limited to loading and duplicate-submit prevention.
- **Typed contracts and domain boundaries**: Pass. Lobby REST DTOs and SignalR event payloads are documented in `contracts/`, modeled in `src/api/` and `src/realtime/`, mapped through `src/domain/lobby/`, and consumed by stores/hooks rather than presentational UI.
- **Accessible multiplayer interaction**: Pass. Plan requires labeled forms/buttons, keyboard-operable create/join/copy/leave/start/cancel actions, visible focus states, non-color-only badges, disabled reasons where practical, live-region announcements for lobby updates, and focus handling after navigation/modals.
- **Testable realtime behavior**: Pass. Required tests cover create/join/leave/cancel/start, loading cleanup, active-lobby conflict recovery, host/non-host action visibility, expired/start-disabled states, SignalR player/status/host/start events, reconnect/error states, and navigation handoff.
- **Secure, performant frontend delivery**: Pass. The only planned runtime dependency addition is the constitution-approved `@microsoft/signalr`; tasks must include lockfile review, `npm audit`, current malware advisory checks, and package pin/lock verification. Store selectors, normalized lobby state, and centralized SignalR dispatch prevent unnecessary UI churn.
- **Approved stack alignment**: Pass. React, TypeScript, Vite, Zustand, `@microsoft/signalr`, Tailwind CSS, CSS Modules, Vitest, React Testing Library, Playwright, and MSW align with the constitution. `dnd-kit` is intentionally unused because no board drag-and-drop work is included.

## Project Structure

### Documentation (this feature)

```text
specs/002-lobby-manage/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- lobby.openapi.yaml
|   `-- lobby-signalr.md
|-- checklists/
|   `-- requirements.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- api/
|   |-- apiConfig.ts
|   |-- httpClient.ts
|   |-- identityApi.ts
|   `-- lobbyApi.ts
|-- realtime/
|   |-- lobbyEvents.ts
|   `-- lobbyHub.ts
|-- domain/
|   |-- auth.ts
|   `-- lobby/
|       |-- lobbyTypes.ts
|       `-- lobbyMappers.ts
|-- stores/
|   |-- authStore.ts
|   |-- errorStore.ts
|   |-- loadingStore.ts
|   `-- lobbyStore.ts
|-- features/
|   |-- auth/
|   `-- lobby/
|       |-- LobbyLandingPage.tsx
|       |-- LobbyRoomPage.tsx
|       |-- CreateLobbyCard.tsx
|       |-- JoinLobbyCard.tsx
|       |-- LobbyPlayerList.tsx
|       |-- LobbyActions.tsx
|       |-- LobbyCodePanel.tsx
|       `-- useLobbyActions.ts
|-- components/
|   |-- ErrorModal.tsx
|   |-- LoadingSpinner.tsx
|   |-- ToastProvider.tsx
|   `-- ui/
|       |-- Button.tsx
|       |-- Input.tsx
|       |-- Card.tsx
|       |-- FormField.tsx
|       |-- FormError.tsx
|       |-- Badge.tsx
|       |-- Toast.tsx
|       `-- Modal.tsx
|-- hooks/
|   `-- useAuthSession.ts
|-- routes/
|   `-- ProtectedRoute.tsx
|-- tests/
|   |-- e2e/
|   |-- fixtures/
|   |-- handlers/
|   `-- setup.ts
|-- App.tsx
`-- main.tsx
```

**Structure Decision**: Extend the existing auth feature layout and constitution-preferred
root-level directories. Lobby REST code lives in `src/api/`, realtime code in `src/realtime/`,
domain mapping in `src/domain/lobby/`, shared state in `src/stores/`, and presentational lobby
UI plus feature hooks in `src/features/lobby/`. Shared UI primitives are added under
`src/components/ui/` before repeating lobby-specific form/button styling.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Research Summary

See [research.md](research.md). All planning unknowns are resolved:

- Use `@microsoft/signalr` for the centralized lobby hub service.
- Use project-owned REST wrappers and mappers, extending the current `httpClient`/`apiConfig` pattern.
- Use a dedicated Zustand lobby store with normalized current-lobby and connection state.
- Use React Router protected lobby routes and automatic `/game/:sessionId` handoff.
- Use shared UI primitives before lobby-specific screens to satisfy the visual system.
- Use MSW-backed tests plus focused service/store tests for REST and realtime behavior.
- Require dependency lockfile, audit, and malware advisory checks before accepting the SignalR dependency.

## Phase 1: Design Summary

See [data-model.md](data-model.md), [contracts/lobby.openapi.yaml](contracts/lobby.openapi.yaml),
[contracts/lobby-signalr.md](contracts/lobby-signalr.md), and [quickstart.md](quickstart.md).

Post-design Constitution Check remains passing:

- Lobby lifecycle state remains authoritative from backend REST/SignalR outcomes.
- DTOs and SignalR payloads are documented and mapped into lobby domain models before UI use.
- Accessibility expectations are represented in flows, data state, and quickstart validation.
- Realtime, route, store, API, and UI test coverage is planned for the risk-bearing behavior.
- The only new runtime dependency is `@microsoft/signalr`, which is constitution-approved and gated by supply-chain checks.
