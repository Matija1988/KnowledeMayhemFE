# Dependency Security Record

## Policy

New or updated npm dependencies must pass a preflight review before `package.json` or
`package-lock.json` changes are accepted. Denied, compromised, malware-advised, or
constitution-disallowed package scopes must be replaced with project-owned code or a
separately approved safe alternative.

## Advisory Sources

| Source | URL | Source Date | Access Date | Use |
|--------|-----|-------------|-------------|-----|
| Socket: Mini Shai-Hulud TanStack compromise report | https://socket.dev/blog/tanstack-npm-packages-compromised-mini-shai-hulud-supply-chain-attack | 2025-09-16 | 2026-06-07 | Malware-advised package and scope denylist review |
| Cloudsmith: Mini Shai-Hulud package compromise summary | https://cloudsmith.com/blog/tanstack-npm-packages-compromised-in-mini-shai-hulud-attack | 2025-09-16 | 2026-06-07 | Cross-check for supply-chain compromise context |
| npm audit | local command: `npm audit` | Command run during implementation | 2026-06-07 | Vulnerability review for installed dependency graph |

## Preflight Decisions

| Dependency | Purpose | Decision | Rationale | Fallback |
|------------|---------|----------|-----------|----------|
| `react` | UI framework | Accepted | Approved by constitution stack | N/A |
| `react-dom` | Browser renderer | Accepted | Required by React browser app | N/A |
| `@types/react` | React TypeScript declarations | Accepted | Required for strict TypeScript JSX compilation | Local declaration shim |
| `@types/react-dom` | React DOM TypeScript declarations | Accepted | Required for strict TypeScript React DOM compilation | Local declaration shim |
| `typescript` | Type checking | Accepted | Approved by constitution stack | N/A |
| `vite` | Build tooling | Accepted | Approved by constitution stack; already present | N/A |
| `@vitejs/plugin-react` | React support for Vite | Accepted | Required Vite integration for React | N/A |
| `zustand` | Client auth/loading/error stores | Accepted | Approved for client state by constitution | React state plus project hooks |
| `react-router-dom` | Route boundaries | Accepted | Required for authenticated route readiness | Project-owned route switch |
| `tailwindcss` | Utility styling | Accepted | Approved by constitution stack | CSS Modules only |
| `@tailwindcss/postcss` | Tailwind PostCSS integration | Accepted | Required by current Tailwind toolchain | CSS Modules only |
| `postcss` | CSS processing | Accepted | Required by Tailwind integration | CSS Modules only |
| `vitest` | Unit/integration tests | Accepted | Approved test tool | N/A |
| `jsdom` | DOM environment for tests | Accepted | Required for React Testing Library | Browser-only e2e tests |
| `@testing-library/react` | Component tests | Accepted | Approved test approach | N/A |
| `@testing-library/jest-dom` | DOM matchers | Accepted | Improves accessibility/state assertions | Built-in assertions |
| `@testing-library/user-event` | User interaction tests | Accepted | Required keyboard/form behavior tests | Manual event dispatch |
| `@playwright/test` | End-to-end tests | Accepted | Approved e2e tool | Manual quickstart validation |
| `msw` | Backend-independent API tests | Accepted | Approved mocking tool | Project-owned fetch stubs |
| Any package from a denied or malware-advised scope | Server-state or other utility | Denied | Constitution supply-chain denylist | Project-owned wrappers/hooks |

## Package-Lock Review

- Completed 2026-06-07 after final dependency install: `package-lock.json` was scanned for denied package scopes and
  Shai-Hulud/Mini Shai-Hulud markers; none were found.
- npm install warning reviewed 2026-06-07: `msw@2.14.6` has a postinstall script pending
  npm allow-scripts review. It is accepted as an approved test dependency, and no script
  approval is required for the current implementation tasks.

## npm Audit Result

- Completed 2026-06-07 after final dependency install with `npm audit --audit-level=low`:
  found 0 vulnerabilities.

## Fallback Decisions

- REST request lifecycle uses project-owned wrappers and feature hooks instead of any denied
  third-party server-state package.
