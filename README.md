# KnowledeMayhemFE

Frontend for Knowledge Mayhem.

## Auth Login Flow

The current implementation provides the authentication foundation:

- Login page with username/email and password validation
- Project-owned identity API wrapper
- Zustand auth, loading, and error stores
- Centralized toast and modal error display
- Browser-local session persistence with invalid-session clearing
- Protected route boundary and lobby redirect behavior
- Unit, integration, and Playwright e2e coverage

## Commands

```powershell
npm install
npm run dev
npm run test
npm run test:e2e
npm run build
npm run audit
```

Local API requests use the Vite dev proxy by default. For the backend shown in local logs,
copy `.env.example` to `.env.local` or set:

```powershell
VITE_BACKEND_URL=http://localhost:5168
```

Leave `VITE_API_BASE_URL` unset during local development so the browser calls `/api/...`
through the Vite proxy instead of making cross-origin requests directly.

If Playwright browsers are not installed locally:

```powershell
npx playwright install chromium
```

## Dependency Security

Before adding or updating packages, review [docs/dependency-security.md](docs/dependency-security.md).
Do not add vulnerable, compromised, malware-advised, or constitution-denied packages.
