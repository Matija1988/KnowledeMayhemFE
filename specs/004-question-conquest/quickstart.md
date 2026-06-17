# Quickstart: Question Conquest and Answer Validation During Gameplay

## Prerequisites

- Node and npm compatible with the existing Vite project.
- Backend API running and reachable through `VITE_API_BASE_URL` or the local Vite proxy configuration.
- Backend CORS `FrontendBrowserCors` allows the frontend origin.
- Auth login works for at least two test users.
- Lobby and game session flows from previous features work.
- Game question conquest endpoints and conquest SignalR events are available.

## Environment

Local API requests may use the Vite dev proxy, or an explicit backend base URL:

```text
VITE_API_BASE_URL=https://localhost:5001
```

Question conquest REST calls derive from the same base URL as the existing game API. Realtime conquest events use the existing game hub:

```text
{VITE_API_BASE_URL}/hubs/game
```

## Run The App

```powershell
npm install
npm run dev
```

Open the local Vite URL in two separate browser profiles or one normal window plus one private/incognito window. Sign in as different users so each player has a distinct auth token.

## Validation Scenarios

### Start Conquest Instead Of Direct Move

1. Create or join a 2-player lobby.
2. Start the game.
3. As the current player, select one of your uncaptured pieces.
4. Select a valid adjacent empty, unblocked target tile.

Expected result: the piece does not move immediately. A question UI opens and board movement is disabled while the attempt is pending.

### Question Display And Answer Secrecy

1. Start a valid conquest attempt.
2. Inspect the displayed question.
3. Confirm the question shows category context, question text, and exactly four answer options.
4. Confirm no answer option displays or exposes correctness.

Expected result: all players can see the question and four options, but only the acting player can interact with answer selection and Submit.

### Select Then Submit

1. As the acting player, select one answer option.
2. Confirm the selected answer is visually and accessibly marked.
3. Confirm no answer is submitted until Submit is activated.
4. Activate Submit.
5. Try repeated clicks or keyboard activation during pending state.

Expected result: answer options and Submit are disabled during submission and only one answer submission occurs.

### Correct Answer Resolution

1. Submit an answer that backend test data marks correct.
2. Wait for the authoritative result.

Expected result: the piece moves to the target tile, the source tile is vacated, the target tile becomes owned by the acting player, success feedback appears for about 3 seconds, the question UI closes automatically, focus returns to the board, and the turn advances.

### Incorrect Answer Resolution

1. Submit an answer that backend test data marks incorrect.
2. Wait for the authoritative result.

Expected result: the piece remains on the source tile, target tile ownership does not change, failure feedback appears for about 3 seconds, the question UI closes automatically, focus returns to the board, and the turn advances.

### Expired Attempt

1. Trigger or mock a question with an expiration time.
2. Wait until the timer expires before submitting.
3. Attempt to submit an answer.
4. Wait for the authoritative expired result or refresh.

Expected result: answer submission is disabled immediately on local expiration, expired pending feedback is shown, movement remains disabled until authoritative resolution, then expired failure feedback appears and the turn advances according to the backend state.

### Non-Acting Player View

1. Keep both players' browsers open.
2. Player 1 starts a conquest attempt.
3. Observe Player 2's browser.

Expected result: Player 2 sees the same question text and answer options but cannot select or submit an answer. Player 2 receives result, board ownership, and turn updates without refreshing.

### Duplicate REST And Realtime Result

1. Submit an answer as the acting player.
2. Arrange for both the answer response and a matching realtime result event to arrive.

Expected result: board state and turn update once to the same authoritative result and result feedback is not duplicated.

### Reconnect During Conquest

1. Start a conquest attempt.
2. Temporarily interrupt game hub connectivity.
3. Restore connectivity.

Expected result: movement remains disabled until an authoritative game snapshot is loaded or received. The UI resumes with the correct current question, result, or turn state.

### Invalid Payload

1. Mock a question payload with fewer or more than four answer options, missing required fields, or answer correctness fields inside options.

Expected result: the UI shows a blocking game/question problem, prevents answer submission, and does not commit board movement or ownership changes.

### Accessibility

1. Complete the conquest flow using keyboard only.
2. Confirm focus moves into the question UI when it opens.
3. Confirm answer options have an accessible group and labels.
4. Confirm selected, disabled, pending, correct, incorrect, and expired states are not color-only.
5. Confirm result, expiration, and turn advancement are announced without timer spam.
6. Confirm focus returns to the board or next actionable area after resolution.

Expected result: the primary conquest flow is playable and understandable without a mouse.

## Automated Validation

Run unit and integration tests:

```powershell
npm test
```

Run end-to-end tests where backend/MSW support is available:

```powershell
npm run test:e2e
```

Run production build validation:

```powershell
npm run build
```

Run dependency audit:

```powershell
npm run audit
```

Required automated coverage includes conquest mapping, question validation, no correctness leakage, start-attempt behavior, answer selection plus Submit, duplicate prevention, correct/incorrect/expired result handling, realtime synchronization, reconnect refresh, accessibility states, and route-level game integration.

## Validation Log

### 2026-06-17

- `npm test`: PASS. Vitest reported 44 passed test files and 141 passed tests.
- `npm run build`: PASS when run outside the sandbox after the sandboxed run hit Vite `spawn EPERM`. Build still reports known Rolldown warnings for `@microsoft/signalr` pure annotations.
- `npm audit --audit-level=low`: PASS. Reported 0 vulnerabilities.
- Current npm malware/advisory source review: no new runtime dependency was added; reviewed current Shai-Hulud/Mini Shai-Hulud npm supply-chain reporting and kept the implementation on existing dependencies.
- Targeted Playwright command `npx playwright test src/tests/e2e/question-conquest.spec.ts src/tests/e2e/game-move.spec.ts`: FAIL in the current preview environment because game e2e pages did not render the game board. The pre-existing `game-session-load.spec.ts` also fails the same way, so this is tracked as an existing e2e environment/setup issue rather than a conquest-only regression.
