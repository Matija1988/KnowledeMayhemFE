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
import type { ConquestResult } from "../domain/conquest/conquestTypes";
import type { BattleResult } from "../domain/battle/battleTypes";
import { recordGameTelemetry } from "../realtime/gameTelemetry";

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
  lastSequence: number;
  setSession: (session: GameSession | null) => void;
  setBlockingError: (error: BlockingGameError | null) => void;
  beginOperation: (operation: GameOperation) => void;
  endOperation: () => void;
  setConnection: (connection: Partial<ConnectionState>) => void;
  selectPiece: (pieceId: string | null, candidateTargets?: BoardCoordinate[]) => void;
  beginMove: (pieceId: string, target: BoardCoordinate) => void;
  applyMoveResult: (session: GameSession, message?: string) => void;
  applyGameSnapshot: (session: GameSession, message?: string) => void;
  applyMovePatch: (gameSessionId: string, pieceId: string, fromTileId: string, toTileId: string, turnNumber: number) => void;
  applyTileOwnershipPatch: (gameSessionId: string, tileId: string, ownerPlayerId: string | null) => void;
  applyTurnPatch: (gameSessionId: string, currentTurnPlayerId: string | null, turnNumber: number) => void;
  applyConquestResult: (result: ConquestResult) => boolean;
  applyBattleResult: (result: BattleResult) => boolean;
  applyPieceCapturedPatch: (gameSessionId: string, pieceId: string, removedFromTileId: string | null, sequence?: number | null) => void;
  applyPieceLeveledPatch: (gameSessionId: string, pieceId: string, newLevel: number, sequence?: number | null) => void;
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
  lastSequence: 0,
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
  applyMovePatch: (gameSessionId, pieceId, fromTileId, toTileId, turnNumber) =>
    set((state) => {
      if (!state.session || state.session.id !== gameSessionId) {
        return {};
      }

      const pieces = state.session.pieces.map((piece) =>
        piece.id === pieceId ? { ...piece, currentTileId: toTileId } : piece,
      );
      const tiles = state.session.tiles.map((tile) => {
        if (tile.id === fromTileId) {
          return { ...tile, occupyingPieceId: null };
        }
        if (tile.id === toTileId) {
          return { ...tile, occupyingPieceId: pieceId };
        }
        return tile;
      });
      const session = { ...state.session, pieces, tiles, turnNumber };

      return {
        session,
        ...normalizeSession(session),
        selectedPieceId: null,
        candidateTargets: [],
        pendingOperation: null,
        pendingMove: null,
        liveMessage: `Move completed. Turn ${turnNumber}.`,
      };
    }),
  applyTileOwnershipPatch: (gameSessionId, tileId, ownerPlayerId) =>
    set((state) => {
      if (!state.session || state.session.id !== gameSessionId) {
        return {};
      }

      const session = {
        ...state.session,
        tiles: state.session.tiles.map((tile) => (tile.id === tileId ? { ...tile, ownerPlayerId } : tile)),
      };

      return {
        session,
        ...normalizeSession(session),
        liveMessage: "Tile ownership updated.",
      };
    }),
  applyTurnPatch: (gameSessionId, currentTurnPlayerId, turnNumber) =>
    set((state) => {
      if (!state.session || state.session.id !== gameSessionId) {
        return {};
      }

      const session = { ...state.session, currentTurnPlayerId, turnNumber };

      return {
        session,
        ...normalizeSession(session),
        selectedPieceId: null,
        candidateTargets: [],
        pendingOperation: null,
        pendingMove: null,
        liveMessage: `Turn ${turnNumber}.`,
      };
    }),
  applyConquestResult: (result) => {
    let applied = false;
    set((state) => {
      if (!state.session || state.session.id !== result.gameSessionId) {
        return {};
      }
      if (result.turnNumber < state.session.turnNumber) {
        return {};
      }

      if (result.session) {
        applied = true;
        return {
          session: result.session,
          ...normalizeSession(result.session),
          selectedPieceId: null,
          candidateTargets: [],
          pendingOperation: null,
          pendingMove: null,
          blockingError: blockingErrorFromStatus(result.session.status),
          liveMessage: conquestLiveMessage(result),
        };
      }

      const piece = state.session.pieces.find((candidate) => candidate.id === result.pieceId);
      const sourceTile = state.session.tiles.find((tile) => tile.id === result.sourceTileId);
      const targetTile = state.session.tiles.find((tile) => tile.id === result.targetTileId);
      if (!piece || !sourceTile || !targetTile) {
        return {
          pendingOperation: "reconnectGame",
          selectedPieceId: null,
          candidateTargets: [],
          blockingError: {
            title: "Game board problem",
            message: "The conquest result references board data that is no longer loaded. Refreshing the game state.",
            reason: "conquestDesync",
          },
          liveMessage: "Refreshing game state after conquest result.",
        };
      }

      const pieces = state.session.pieces.map((candidate) =>
        candidate.id === result.pieceId ? { ...candidate, currentTileId: result.currentTileId } : candidate,
      );
      const tiles = state.session.tiles.map((tile) => {
        if (tile.id === result.sourceTileId && result.currentTileId !== result.sourceTileId) {
          return { ...tile, occupyingPieceId: null };
        }
        if (tile.id === result.targetTileId) {
          return {
            ...tile,
            occupyingPieceId: result.currentTileId === result.targetTileId ? result.pieceId : tile.occupyingPieceId,
            ownerPlayerId: result.ownerPlayerId,
          };
        }
        return tile;
      });
      const session = {
        ...state.session,
        pieces,
        tiles,
        currentTurnPlayerId: result.nextTurnPlayerId,
        turnNumber: result.turnNumber,
      };
      applied = true;

      return {
        session,
        ...normalizeSession(session),
        selectedPieceId: null,
        candidateTargets: [],
        pendingOperation: null,
        pendingMove: null,
        liveMessage: conquestLiveMessage(result),
      };
    });
    return applied;
  },
  applyBattleResult: (result) => {
    let applied = false;
    set((state) => {
      if (!state.session || state.session.id !== result.gameSessionId) {
        return {};
      }
      if (result.sequence !== null && result.sequence < state.lastSequence) {
        recordGameTelemetry("game-stale-event-rejected", {
          gameSessionId: result.gameSessionId,
          attemptKind: result.attemptKind,
          attemptId: result.attemptId,
          eventSequence: result.sequence,
          currentSequence: state.lastSequence,
        });
        return {};
      }

      if (result.session) {
        applied = true;
        return {
          session: result.session,
          ...normalizeSession(result.session),
          selectedPieceId: null,
          candidateTargets: [],
          pendingOperation: null,
          pendingMove: null,
          blockingError: blockingErrorFromStatus(result.session.status),
          lastSequence: Math.max(state.lastSequence, result.sequence ?? state.lastSequence),
          liveMessage: battleLiveMessage(result),
        };
      }

      const movedPieceId = result.movedPieceId;
      const sourceTileId = result.sourceTileId;
      const targetTileId = result.targetTileId;
      if (!movedPieceId || !sourceTileId || !targetTileId) {
        return {
          pendingOperation: "reconnectGame",
          selectedPieceId: null,
          candidateTargets: [],
          blockingError: {
            title: "Game board problem",
            message: "The battle result references board data that is no longer loaded. Refreshing the game state.",
            reason: "conquestDesync",
          },
          liveMessage: "Refreshing game state after battle result.",
        };
      }

      const success = result.status === "Succeeded";
      const movingPiece = state.session.pieces.find((piece) => piece.id === movedPieceId);
      const pieces = state.session.pieces.map((piece) => {
        if (success && result.capturedPieceId && piece.id === result.capturedPieceId) {
          return { ...piece, currentTileId: null, isCaptured: true, capturedAtUtc: new Date().toISOString() };
        }
        if (success && piece.id === movedPieceId) {
          return {
            ...piece,
            currentTileId: targetTileId,
            level: result.leveledPieceId === piece.id && result.newLevel ? result.newLevel : piece.level,
          };
        }
        if (result.leveledPieceId === piece.id && result.newLevel) {
          return { ...piece, level: result.newLevel };
        }
        return piece;
      });
      const tiles = state.session.tiles.map((tile) => {
        if (success && tile.id === sourceTileId) {
          return { ...tile, occupyingPieceId: null };
        }
        if (success && tile.id === targetTileId) {
          return {
            ...tile,
            occupyingPieceId: movedPieceId,
            ownerPlayerId: result.targetOwnerPlayerId ?? movingPiece?.ownerPlayerId ?? tile.ownerPlayerId,
          };
        }
        return tile;
      });
      const session = {
        ...state.session,
        pieces,
        tiles,
        currentTurnPlayerId: result.nextTurnPlayerId ?? state.session.currentTurnPlayerId,
        turnNumber: result.turnNumber ?? state.session.turnNumber,
      };
      applied = true;
      return {
        session,
        ...normalizeSession(session),
        selectedPieceId: null,
        candidateTargets: [],
        pendingOperation: null,
        pendingMove: null,
        lastSequence: Math.max(state.lastSequence, result.sequence ?? state.lastSequence),
        liveMessage: battleLiveMessage(result),
      };
    });
    return applied;
  },
  applyPieceCapturedPatch: (gameSessionId, pieceId, removedFromTileId, sequence = null) =>
    set((state) => {
      if (!state.session || state.session.id !== gameSessionId || (sequence !== null && sequence < state.lastSequence)) {
        if (state.session?.id === gameSessionId && sequence !== null && sequence < state.lastSequence) {
          recordGameTelemetry("game-stale-event-rejected", {
            gameSessionId,
            pieceId,
            eventSequence: sequence,
            currentSequence: state.lastSequence,
            eventType: "piece-captured",
          });
        }
        return {};
      }
      const session = {
        ...state.session,
        pieces: state.session.pieces.map((piece) =>
          piece.id === pieceId ? { ...piece, currentTileId: null, isCaptured: true, capturedAtUtc: new Date().toISOString() } : piece,
        ),
        tiles: state.session.tiles.map((tile) =>
          removedFromTileId && tile.id === removedFromTileId ? { ...tile, occupyingPieceId: null } : tile,
        ),
      };
      return {
        session,
        ...normalizeSession(session),
        lastSequence: Math.max(state.lastSequence, sequence ?? state.lastSequence),
        liveMessage: "Piece captured.",
      };
    }),
  applyPieceLeveledPatch: (gameSessionId, pieceId, newLevel, sequence = null) =>
    set((state) => {
      if (!state.session || state.session.id !== gameSessionId || (sequence !== null && sequence < state.lastSequence)) {
        if (state.session?.id === gameSessionId && sequence !== null && sequence < state.lastSequence) {
          recordGameTelemetry("game-stale-event-rejected", {
            gameSessionId,
            pieceId,
            eventSequence: sequence,
            currentSequence: state.lastSequence,
            eventType: "piece-leveled",
          });
        }
        return {};
      }
      const session = {
        ...state.session,
        pieces: state.session.pieces.map((piece) => (piece.id === pieceId ? { ...piece, level: newLevel } : piece)),
      };
      return {
        session,
        ...normalizeSession(session),
        lastSequence: Math.max(state.lastSequence, sequence ?? state.lastSequence),
        liveMessage: `Piece reached level ${newLevel}.`,
      };
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
      lastSequence: 0,
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
  return player.displayName?.trim() || `Player ${player.playerOrder}`;
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

function conquestLiveMessage(result: ConquestResult): string {
  if (result.resultStatus === "Succeeded" || result.isCorrect) {
    return `Correct answer. Turn ${result.turnNumber}.`;
  }
  if (result.resultStatus === "Expired") {
    return `Question expired. Turn ${result.turnNumber}.`;
  }
  if (result.resultStatus === "Cancelled") {
    return `Conquest cancelled. Turn ${result.turnNumber}.`;
  }
  return `Incorrect answer. Turn ${result.turnNumber}.`;
}

function battleLiveMessage(result: BattleResult): string {
  const label = result.attemptKind === "Battle" ? "Battle" : "Special field";
  const turn = result.turnNumber ? ` Turn ${result.turnNumber}.` : "";
  if (result.status === "Succeeded") {
    return `${label} succeeded.${turn}`;
  }
  if (result.status === "Expired") {
    return `${label} expired.${turn}`;
  }
  if (result.status === "Cancelled") {
    return `${label} cancelled.${turn}`;
  }
  return `${label} failed.${turn}`;
}
