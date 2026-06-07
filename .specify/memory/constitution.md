<!--
Sync Impact Report
Version change: 2.1.0 -> 2.2.0
Modified sections:
- Frontend CORS and Environment Configuration added
- API integration rules expanded
Templates requiring updates:
- updated: .specify/templates/plan-template.md
- updated: .specify/templates/tasks-template.md
Follow-up TODOs:
- None
-->
# KnowledeMayhemFE Constitution

## Core Principles

### I. Server-Authoritative Gameplay
All gameplay-affecting state MUST be treated as server-authoritative. The frontend MAY
represent pending interaction state for responsiveness, but it MUST NOT commit piece moves,
quiz answers, turn changes, multiplayer outcomes, or session membership optimistically.
Piece moves and quiz validation MUST be confirmed by backend APIs or SignalR events before
becoming durable UI state. Reconnect flows MUST request or receive a fresh authoritative
snapshot before resuming play.

Rationale: Multiplayer correctness matters more than local immediacy; a shared game must
show the same truth to every player.

### II. Typed Contracts and Domain Boundaries
REST DTOs MUST be generated from backend OpenAPI contracts where possible, and SignalR
event payloads MUST be strongly typed in one central contract layer. UI components MUST
consume frontend domain models and feature hooks, not raw backend DTOs or ad hoc API calls.
DTO-to-domain mapping MUST happen before data reaches presentational components.

Rationale: Generated contracts reduce drift, while domain boundaries keep UI code stable
when backend payloads evolve.

### III. Accessible Multiplayer Interaction
Interactive gameplay, quiz, and session controls MUST be keyboard operable and screen-reader
understandable. Chess movement MUST support keyboard-accessible controls independently from
drag-and-drop. Turn changes, quiz results, and connection status MUST be exposed through live
regions. Visual game state MUST NOT rely on color alone, and all interactive controls MUST
have accessible labels and visible focus states.

Rationale: Accessibility is part of the playable surface, not a finishing pass.

### IV. Testable Realtime Behavior
Features that touch board rendering, piece movement, invalid move handling, quiz submission,
session join/leave flows, SignalR event handling, reconnect behavior, multiplayer
synchronization, or four-player session rendering MUST include appropriate automated tests.
Vitest and React Testing Library are the default unit/integration tools; Playwright is the
default end-to-end tool; MSW is the default REST and realtime mocking layer where mocking is
needed. Realtime services and state stores MUST be testable outside presentational components.

Rationale: Realtime regressions are easy to miss manually and costly for multiplayer trust.

### V. Secure, Performant Frontend Delivery
The frontend MUST NOT add packages with known unresolved security vulnerabilities. Board and
multiplayer UI work MUST preserve responsive interaction through memoized board squares and
pieces, selector-based store subscriptions, normalized multiplayer state, optimized chess
assets, and controlled SignalR event dispatching. Dependencies and abstractions MUST be added
only when they serve a documented gameplay, accessibility, testing, or maintainability need.
Packages, package scopes, or package versions associated with active supply-chain compromise,
credential theft, destructive payloads, or unresolved malware advisories MUST NOT be installed
or referenced as approved architecture until the constitution explicitly re-approves them.

Rationale: Security and responsiveness are baseline quality requirements for an interactive
multiplayer frontend.

### VI. Consistent Visual Design System

The frontend MUST use a consistent visual design system across authentication, lobby, quiz,
gameplay, error, and shared UI screens. The default visual direction is a dark blue and white
interface with a polished game-oriented feel.

The UI MUST NOT rely on browser-default form styling. Forms, buttons, inputs, cards, dialogs,
toasts, loading states, and navigation elements MUST use the approved shared style template
before feature-specific styling is added.

The dominant color palette is:

Primary background: dark navy / blue-black
Secondary background: deep blue
Primary surface: dark blue card surfaces
Primary text: white
Secondary text: muted blue-gray
Primary action: bright blue
Primary action hover: lighter blue
Border color: muted blue-gray
Error color: red
Success color: green
Warning color: amber

Required baseline UI rules:

Screens SHOULD use a darker background with white text.
Forms MUST be placed inside styled card containers.
Inputs MUST have visible borders, padding, labels, focus states, and disabled states.
Buttons MUST define normal, hover, focus, disabled, and loading states.
Toasts and modals MUST follow the same dark blue and white visual system.
Loading spinners MUST be visible on dark backgrounds.
Focus rings MUST be clearly visible and accessible.
Color MUST NOT be the only indicator of state.

Rationale: A shared style baseline prevents blank, browser-default screens and keeps the
application visually coherent as features are implemented.

## Approved Technical Stack & Architecture Decisions

### Frontend Technology Stack
The approved core stack is React, TypeScript, and Vite. React is the UI framework,
TypeScript is the implementation language, and Vite is the build tooling. This stack is
chosen for a highly interactive, component-driven, multiplayer-oriented frontend with strong
typing, maintainability, accessibility support, and ecosystem maturity.

### State Management Strategy
Zustand is approved for client and gameplay state, including game board interaction state,
multiplayer session state, player state, quiz interaction state, connection state, and UI
interaction state. Zustand stores MUST be separated by domain concern. Components MUST NOT
directly mutate shared state. Server-authoritative state MUST remain distinct from transient
UI state. Derived state SHOULD be computed instead of duplicated.

REST request lifecycle MUST be handled through project-owned API wrappers and feature hooks
unless a future constitution amendment approves a safe server-state library. Zustand MUST NOT
duplicate raw REST response data unnecessarily. UI components MUST use feature hooks instead
of raw API calls.

### Supply Chain Security Denylist
The project MUST NOT install, recommend, or plan around packages known to be compromised by
the Shai-Hulud or Mini Shai-Hulud npm supply-chain campaigns, or any package scope currently
listed in active malware advisories. Previously compromised ecosystems MUST remain denied
until a future constitution amendment explicitly re-approves them after security review.

Before adding or updating any npm package, the implementation plan and tasks MUST require:
- A package-lock review showing no denied package scope is introduced.
- A vulnerability and malware advisory check using the available package manager audit and a
  current advisory source.
- Pinning or lockfile control for newly accepted packages.
- A documented fallback using project-owned code when a dependency is denied.

### Realtime Multiplayer Communication
The approved realtime technology is `@microsoft/signalr`. One centralized SignalR service
MUST own connection lifecycle, reconnect logic, event registration, event dispatching, and
session rejoin handling. SignalR logic MUST NOT live inside presentational components.
SignalR events are authoritative for gameplay state and MUST dispatch into domain stores or
feature hooks.

### API Contract Strategy
REST clients SHOULD be generated from the .NET backend OpenAPI contract. Backend DTOs MUST
NOT be used directly inside UI components and MUST be mapped into frontend domain models.
SignalR event contracts MUST be maintained centrally, strongly typed, and aligned with
backend hub event names and payload structure.

### Drag-and-Drop Architecture
The approved drag-and-drop library is `dnd-kit`. Chess interaction logic MUST be isolated
behind a custom board interaction adapter. Drag-and-drop behavior MUST remain separate from
chess rule validation. Keyboard movement controls MUST exist independently from drag-and-drop.
Invalid moves MUST be rejected visually and functionally.

Tailwind CSS is approved for layout, responsive design, shared utility styling, and the
project-wide visual design system. CSS Modules are approved for chessboard-specific styling,
piece interaction styling, board animations, and square states.

The frontend MUST use a shared dark blue and white style template as the default baseline for
all screens and reusable UI components.

The baseline visual template MUST include:

App background
Page layout containers
Card surfaces
Form fields
Buttons
Loading spinners
Toasts
Modals
Error states
Empty states
Focus states

The default color direction is:

Background:
- App: blue-black / dark navy
- Surface: dark blue
- Elevated surface: slightly lighter dark blue

Text:
- Primary: white
- Secondary: muted blue-gray
- Disabled: muted gray-blue

Actions:
- Primary: bright blue
- Primary hover: lighter blue
- Primary disabled: desaturated blue-gray

State:
- Error: red
- Success: green
- Warning: amber
- Info: blue

Borders:
- Default: muted blue-gray
- Focus: bright blue

Reusable UI components SHOULD be created before feature-specific form styling is repeated.

Required shared UI components include:

src/components/ui/Button.tsx
src/components/ui/Input.tsx
src/components/ui/Card.tsx
src/components/ui/FormField.tsx
src/components/ui/FormError.tsx
src/components/ui/LoadingSpinner.tsx
src/components/ui/Toast.tsx
src/components/ui/Modal.tsx

Rules:

UI MUST NOT rely on unstyled browser defaults.
Auth forms, lobby forms, quiz panels, and dialogs MUST use shared UI components.
Board styling MUST remain isolated from general UI styling.
Visual game state MUST NOT rely on color alone.
Tailwind utility classes SHOULD be centralized into reusable components where repetition
appears.
CSS Modules SHOULD be used for chessboard-specific or animation-heavy styling only.

### Frontend Project Structure
The preferred source layout is:

```text
src/
|-- api/          # Generated REST clients and wrappers
|-- realtime/     # SignalR services and event contracts
|-- domain/       # Domain models and mappers
|-- stores/       # Zustand domain stores
|-- features/
|   |-- game/
|   |-- quiz/
|   `-- session/
|-- components/   # Shared reusable UI components
|-- hooks/        # Feature and domain hooks
|-- utils/        # Shared utilities
`-- tests/        # Test helpers and fixtures
```

Feature plans MAY adapt this structure, but deviations MUST be justified in the plan's
Constitution Check.

## Development Workflow & Quality Gates

Every feature plan MUST pass the Constitution Check before implementation design proceeds.
The check MUST confirm server-authoritative gameplay behavior, typed contract boundaries,
accessibility requirements, relevant automated tests, approved stack usage, dependency
security, and performance-sensitive rendering plans.

Feature specifications MUST include measurable success criteria and independent user-story
tests. Features that introduce gameplay, quiz, session, realtime, or board behavior MUST
include accessibility and synchronization edge cases.

Task lists MUST include explicit tasks for domain stores/hooks, contract mapping, SignalR
service integration, accessibility behavior, tests for required coverage areas, and security
review of new dependencies when applicable. Tests that are included MUST be written before
implementation for the behavior they protect and MUST fail for the intended reason first.

## Governance

This constitution supersedes conflicting local practices for frontend architecture and
feature delivery. Amendments require a documented rationale, an explicit semantic version
bump, and updates to affected Spec Kit templates or runtime guidance in the same change.

Versioning policy:
- MAJOR: Removes or redefines core principles or compatibility expectations.
- MINOR: Adds a principle, required section, approved technology, or material governance
  guidance.
- PATCH: Clarifies wording, fixes errors, or updates non-semantic guidance.

Compliance review is required during planning and again before implementation is considered
complete. Any accepted deviation MUST be documented in the feature plan with the reason,
risk, and simpler alternative considered.

Frontend CORS and Environment Configuration

The frontend MUST integrate with the backend CORS policy named FrontendBrowserCors.

The backend allows browser origins through the Cors:AllowedOrigins configuration section. The frontend MUST NOT assume wildcard CORS support.

Development frontend origins are:

http://localhost:5173
https://localhost:5173

Staging and production frontend origins MUST be explicitly configured in the backend environment. Origins MUST contain only scheme, host, and optional port.

Valid examples:

http://localhost:5173
https://app.example.com

Invalid examples:

*
https://app.example.com/path
https://*.example.com

The frontend MUST keep the backend API base URL in environment configuration:

VITE_API_BASE_URL=https://localhost:5001

All HTTP API requests MUST use this configured base URL.

SignalR hub URLs MUST be derived from the same base URL:

Lobby hub: {VITE_API_BASE_URL}/hubs/lobbies
Game hub:  {VITE_API_BASE_URL}/hubs/game

JWT bearer authentication MUST use the Authorization header by default:

Authorization: Bearer <token>

Browser credentials MUST be omitted by default:

credentials: "omit"

The frontend MUST NOT use credentials: "include" unless the deployed backend environment explicitly enables Cors:AllowCredentials and the authentication design requires browser credentials.

Allowed request headers are:

Authorization
Content-Type
Accept
X-Requested-With

Frontend API wrappers MUST centralize:

API base URL resolution
authenticated request headers
default credentials: "omit"
JSON request/response handling
centralized error mapping

No feature component may hardcode backend host URLs.

**Version**: 2.2.0 | **Ratified**: 2026-06-07 | **Last Amended**: 2026-06-07