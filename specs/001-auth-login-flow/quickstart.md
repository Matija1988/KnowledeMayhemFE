# Quickstart: Authentication Foundation - Login Flow

## Prerequisites

- Node.js compatible with the selected Vite/React toolchain.
- Package installation completed with no unresolved security vulnerabilities.
- Backend identity service or MSW handlers available for the login contract in
  [contracts/auth-login.openapi.yaml](contracts/auth-login.openapi.yaml).

## Setup

```powershell
npm install
npm run dev
```

If the implementation adds scripts beyond the current package skeleton, expected scripts are:

```powershell
npm run test
npm run test:e2e
npm run build
npm audit
```

## Validation Scenarios

### 1. Successful Login

1. Open the login page while logged out.
2. Enter valid username/email and password.
3. Submit the form.
4. Confirm a global loading indicator appears and duplicate submissions are blocked.
5. Confirm loading clears after success.
6. Confirm the user reaches the lobby entry point.
7. Refresh the page.
8. Confirm the user remains recognized as signed in.

Expected result: The login flow satisfies `SC-001` and `SC-006`.

### 2. Missing Required Fields

1. Open the login page while logged out.
2. Submit with empty username/email, empty password, or both.
3. Confirm field-level validation appears before any authentication request is made.

Expected result: The login flow satisfies `SC-003`.

### 3. Invalid Credentials

1. Configure the identity service or MSW handler to reject credentials.
2. Submit invalid credentials.
3. Confirm loading appears, then clears.
4. Confirm a non-technical, non-blocking error appears.
5. Confirm the form remains editable and can be submitted again.

Expected result: The login flow satisfies `SC-002`.

### 4. Invalid Saved Session

1. Create saved sign-in state that is expired, malformed, or rejected.
2. Attempt to open an authenticated area.
3. Confirm saved state is cleared before protected content is shown.
4. Confirm the user is sent to login with a non-blocking "Please sign in again" style message.

Expected result: The login flow satisfies `SC-007`.

### 5. Route Boundaries

1. While logged out, open an authenticated area directly.
2. Confirm the user is sent to login.
3. Sign in successfully.
4. Open the login page.
5. Confirm the user is sent to the lobby entry point instead of seeing the login form.

Expected result: The login flow satisfies `SC-004` and `SC-008`.

### 6. Keyboard and Assistive Technology Readiness

1. Complete the successful login flow using only keyboard input.
2. Confirm focus states are visible.
3. Confirm controls have accessible names.
4. Confirm loading and error changes are announced or otherwise available to assistive technology.

Expected result: The login flow satisfies `SC-005`.
