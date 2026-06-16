import { create } from "zustand";
import type {
  BlockingGameError,
  BoardCoordinate,
  BoardTile,
  ConnectionState,
  GameOperation,
  GameSession,
  GameSessionStatus,
  Piece,
} from "../domain/game/gameTypes";

type PendingMove = {
  pieceId: string;
  target: BoardCoordinate;
} | null;

type GameStore = {
  session: GameSession | null;
  playersById: Record<string, GameSession["players"][number]>;
  tilesById: Record<string, BoardTile>;
  piecesById: Record<string, Piece>;
  connection: ConnectionState;
  selectedPieceId: string | null;
  candidateTargets: BoardCoordinate[];
  pendingOperation: GameOperation | null;
  pendingMove: PendingMove;
  blockingError: BlockingGameError | null;
  liveMessage: string;
  setSession: (session: GameSession | null) => void;
  setBlockingError: (error: BlockingGameError | null) => void;
  beginOperation: (operation: GameOperation) => void;
  endOperation: () => void;
  setConnection: (connection: Partial<ConnectionState>) => void;
  selectPiece: (pieceId: string | null, candidateTargets?: BoardCoordinate[]) => void;
  beginMove: (pieceId: string, target: BoardCoordinate) => void;
  applyMoveResult: (session: GameSession, message?: string) => void;
  applyGameSnapshot: (session: GameSession, message?: string) => void;
  requestSnapshotRefresh: (message?: string) => void;
  resetGame: () => void;
};

const idleConnection: ConnectionState = {
  status: "idle",
  message: null,
  lastUpdatedAtUtc: null,
};

function normalizeSession(session: GameSession | null) {
  return {
    playersById: Object.fromEntries((session?.players ?? []).map((player) => [player.id, player])),
    tilesById: Object.fromEntries((session?.tiles ?? []).map((tile) => [tile.id, tile])),
    piecesById: Object.fromEntries((session?.pieces ?? []).map((piece) => [piece.id, piece])),
  };
}

export const useGameStore = create<GameStore>((set) => ({
  session: null,
  ...normalizeSession(null),
  connection: idleConnection,
  selectedPieceId: null,
  candidateTargets: [],
  pendingOperation: null,
  pendingMove: null,
  blockingError: null,
  liveMessage: "",
  setSession: (session) =>
    set({
      session,
      ...normalizeSession(session),
      selectedPieceId: null,
      candidateTargets: [],
      pendingMove: null,
      blockingError: session ? blockingErrorFromStatus(session.status) : null,
    }),
  setBlockingError: (blockingError) => set({ blockingError, selectedPieceId: null, candidateTargets: [] }),
  beginOperation: (pendingOperation) => set({ pendingOperation }),
  endOperation: () => set({ pendingOperation: null }),
  setConnection: (connection) =>
    set((state) => ({
      connection: {
        ...state.connection,
        ...connection,
        lastUpdatedAtUtc: connection.lastUpdatedAtUtc ?? new Date().toISOString(),
      },
    })),
  selectPiece: (selectedPieceId, candidateTargets = []) => set({ selectedPieceId, candidateTargets }),
  beginMove: (pieceId, target) => set({ pendingOperation: "movePiece", pendingMove: { pieceId, target } }),
  applyMoveResult: (session, message = "Move completed.") =>
    set({
      session,
      ...normalizeSession(session),
      selectedPieceId: null,
      candidateTargets: [],
      pendingOperation: null,
      pendingMove: null,
      blockingError: blockingErrorFromStatus(session.status),
      liveMessage: message,
    }),
  applyGameSnapshot: (session, message = "Game updated.") =>
    set({
      session,
      ...normalizeSession(session),
      selectedPieceId: null,
      candidateTargets: [],
      pendingOperation: null,
      pendingMove: null,
      blockingError: blockingErrorFromStatus(session.status),
      liveMessage: message,
    }),
  requestSnapshotRefresh: (message = "Refreshing game state.") =>
    set({
      pendingOperation: "reconnectGame",
      selectedPieceId: null,
      candidateTargets: [],
      liveMessage: message,
    }),
  resetGame: () =>
    set({
      session: null,
      ...normalizeSession(null),
      connection: idleConnection,
      selectedPieceId: null,
      candidateTargets: [],
      pendingOperation: null,
      pendingMove: null,
      blockingError: null,
      liveMessage: "",
    }),
}));

export function resetGameStoreForTests(): void {
  useGameStore.getState().resetGame();
}

export function selectCurrentUserPlayer(session: GameSession | null, currentUserId: string | null) {
  return session?.players.find((player) => player.userId === currentUserId) ?? null;
}

export function selectIsCurrentTurn(session: GameSession | null, currentUserId: string | null): boolean {
  const player = selectCurrentUserPlayer(session, currentUserId);
  return Boolean(session?.status === "InProgress" && player && session.currentTurnPlayerId === player.id);
}

export function selectPieceOnTile(session: GameSession | null, tileId: string): Piece | null {
  return session?.pieces.find((piece) => !piece.isCaptured && piece.currentTileId === tileId) ?? null;
}

export function selectBoardCells(session: GameSession | null): BoardTile[] {
  return [...(session?.tiles ?? [])].sort((a, b) => a.y - b.y || a.x - b.x);
}

export function selectPlayerDisplayName(player: GameSession["players"][number]): string {
  return player.displayName?.trim() || player.userId || player.id;
}

export function selectSelectablePieces(session: GameSession | null, currentUserId: string | null): Piece[] {
  const player = selectCurrentUserPlayer(session, currentUserId);
  if (!session || !player || !selectIsCurrentTurn(session, currentUserId)) {
    return [];
  }
  return session.pieces.filter((piece) => piece.ownerPlayerId === player.id && !piece.isCaptured);
}

function blockingErrorFromStatus(status: GameSessionStatus): BlockingGameError | null {
  if (status === "Completed") {
    return { title: "Game completed", message: "This game has ended.", reason: "completed" };
  }
  if (status === "Cancelled") {
    return { title: "Game cancelled", message: "This game has been cancelled.", reason: "cancelled" };
  }
  return null;
}
