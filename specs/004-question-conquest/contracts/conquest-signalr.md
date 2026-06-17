# SignalR Contract: Conquest Events

## Hub URL

```text
{VITE_API_BASE_URL}/hubs/game
```

Question conquest realtime events extend the existing centralized game hub connection. The frontend must not open a second conquest-specific hub connection unless a later backend contract requires it.

## Authentication

The connection uses JWT bearer authentication through the existing SignalR access token factory.

```text
accessTokenFactory: () => accessToken
```

Browser credentials remain omitted unless a backend environment explicitly enables and requires credentialed browser requests.

## Event Handling Responsibilities

The frontend game realtime service owns:

- event registration
- mapping payloads into conquest and game domain models
- dispatching transient question state into conquest state
- dispatching authoritative board/session updates into game state
- duplicate REST/realtime result reconciliation
- reconnect snapshot refresh before movement resumes

SignalR logic must not live inside presentational components.

## Client-Handled Events

| Event | Payload | Required frontend behavior |
|-------|---------|----------------------------|
| `ConquestAttemptStarted` | `QuestionAttemptEvent` or `GameplayQuestion` | Mark a pending conquest attempt. If question data is present, show it to all players. |
| `QuestionIssued` | `GameplayQuestion` | Display active question text and four answer options to all players; enable answer controls only for the acting player. |
| `AnswerSubmitted` | `QuestionAttemptEvent` | Show pending/answered state when relevant without revealing correctness before result. |
| `ConquestSucceeded` | `ConquestResultEvent` | Apply authoritative result, move piece/ownership from payload or session snapshot, show success feedback, advance turn. |
| `ConquestFailed` | `ConquestResultEvent` | Apply authoritative result, keep piece/ownership from payload or session snapshot, show failure feedback, advance turn. |
| `ConquestExpired` | `ConquestResultEvent` | Apply authoritative expired result, keep piece/ownership from payload or session snapshot, show expired failed feedback, advance turn. |
| `TurnAdvanced` | Existing game turn event | Update turn indicator and clear stale pending UI when consistent with a conquest result. |

## Payload Shapes

```ts
type QuestionAttemptStatus =
  | "Pending"
  | "Succeeded"
  | "Failed"
  | "Expired"
  | "Cancelled";

type GameplayAnswerOption = {
  id: string;
  text: string;
};

type GameplayQuestion = {
  questionAttemptId: string;
  questionId: string;
  gameSessionId: string;
  playerId: string;
  pieceId: string;
  sourceTileId: string;
  targetTileId: string;
  categoryId: string;
  categoryName?: string | null;
  questionText: string;
  answerOptions: GameplayAnswerOption[];
  expiresAtUtc?: string | null;
};

type QuestionAttemptEvent = {
  questionAttemptId: string;
  gameSessionId: string;
  playerId: string;
  pieceId: string;
  sourceTileId: string;
  targetTileId: string;
  status: QuestionAttemptStatus;
  expiresAtUtc?: string | null;
  question?: GameplayQuestion | null;
};

type ConquestResultEvent = {
  questionAttemptId: string;
  gameSessionId: string;
  resultStatus: Exclude<QuestionAttemptStatus, "Pending">;
  isCorrect: boolean;
  pieceId: string;
  sourceTileId: string;
  targetTileId: string;
  currentTileId: string;
  ownerPlayerId?: string | null;
  nextTurnPlayerId?: string | null;
  turnNumber: number;
  session?: GameSessionDto | null;
};
```

## Reconciliation Rules

- If a result includes a full game session snapshot, the snapshot is the preferred board and turn source.
- If a result does not include a full snapshot, the frontend may patch only the fields represented by the result and must refresh if referenced IDs are missing or inconsistent.
- REST answer response and SignalR result event for the same `questionAttemptId` must produce one durable final state and no duplicate feedback.
- Events for an older turn or already resolved attempt must not overwrite newer authoritative state.
- On reconnect during a pending or recently resolved conquest attempt, movement remains disabled until a fresh authoritative game snapshot is loaded or received.

## Security Rules

- `GameplayQuestion.answerOptions` must not include correctness fields.
- `ConquestResult.isCorrect` is allowed only after resolution.
- Non-acting players may see question text and options, but answer selection and Submit must remain disabled for them.
