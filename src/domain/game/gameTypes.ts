export type GameSessionStatus = "InProgress" | "Completed" | "Cancelled";

export type TileType = "Normal" | "Blocked" | "Special";

export type GamePlayer = {
  id: string;
  gameSessionId: string;
  userId: string;
  playerOrder: number;
  displayName: string | null;
  pieceColor: string | null;
  isEliminated: boolean;
  eliminatedAtUtc?: string | null;
  eliminationReason?: "Forfeit" | "Defeated" | "DisconnectedTimeout" | string | null;
  createdAtUtc: string;
};

export type BoardTile = {
  id: string;
  gameSessionId: string;
  x: number;
  y: number;
  categoryId: string | null;
  ownerPlayerId: string | null;
  occupyingPieceId: string | null;
  tileType: TileType;
  createdAtUtc: string;
};

export type Piece = {
  id: string;
  gameSessionId: string;
  ownerPlayerId: string;
  currentTileId: string | null;
  level: number;
  isCaptured: boolean;
  capturedAtUtc?: string | null;
  createdAtUtc: string;
};

export type TurnState = {
  gameSessionId: string;
  currentTurnPlayerId: string | null;
  turnNumber: number;
  status: string | null;
};

export type GameSession = {
  id: string;
  lobbyId: string;
  status: GameSessionStatus;
  boardSeed: string | number;
  boardWidth: number;
  boardHeight: number;
  currentTurnPlayerId: string | null;
  turnNumber: number;
  startedAtUtc: string;
  endedAtUtc: string | null;
  winnerPlayerId: string | null;
  selectedCategoryIds: string[];
  createdAtUtc: string;
  players: GamePlayer[];
  tiles: BoardTile[];
  pieces: Piece[];
};

export type MovePieceRequest = {
  pieceId: string;
  targetX: number;
  targetY: number;
};

export type GameActionResult = {
  session: GameSession;
  turn: TurnState;
};

export type GameCategoryStatistics = {
  categoryId: string;
  categoryName: string;
  correctAnswers: number;
  totalAnswers: number;
  percentage: number;
};

export type GamePlayerStatistics = {
  playerId: string;
  userId: string;
  displayName: string;
  pieceColor: string | null;
  isWinner: boolean;
  correctAnswers: number;
  totalAnswers: number;
  percentage: number;
  categories: GameCategoryStatistics[];
};

export type GameCompletionSummary = {
  gameSessionId: string;
  winnerPlayerId: string;
  endedAtUtc: string;
  players: GamePlayerStatistics[];
};

export type ConnectionState = {
  status: "idle" | "connecting" | "connected" | "reconnecting" | "disconnected" | "error";
  message: string | null;
  lastUpdatedAtUtc: string | null;
};

export type GameOperation =
  | "readGame"
  | "movePiece"
  | "startConquest"
  | "submitConquest"
  | "startBattle"
  | "submitBattle"
  | "startSpecialField"
  | "submitSpecialField"
  | "reconnectGame";

export type GameActionError = {
  title: string;
  message: string;
  displayMode: "toast" | "modal";
};

export type BlockingGameError = {
  title: string;
  message: string;
  reason:
    | "malformedSnapshot"
    | "completed"
    | "cancelled"
    | "unavailable"
    | "unauthorized"
    | "reconnectFailed"
    | "conquestDesync";
};

export type BoardCoordinate = {
  x: number;
  y: number;
};
