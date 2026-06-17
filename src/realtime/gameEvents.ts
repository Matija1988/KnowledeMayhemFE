import { mapGameActionResult, mapGameSession, type GameActionResultDto, type GameSessionDto } from "../domain/game/gameMappers";
import type { GameActionResult, GameSession } from "../domain/game/gameTypes";

export const gameEventNames = {
  sessionCreated: "GameSessionCreatedEvent",
  started: "GameStartedEvent",
  moveExecuted: "GameMoveExecutedEvent",
  tileOwnershipChanged: "GameTileOwnershipChangedEvent",
  turnAdvanced: "GameTurnAdvancedEvent",
  completed: "GameCompletedEvent",
  cancelled: "GameCancelledEvent",
} as const;

export type GameMoveExecutedEventDto = {
  gameSessionId: string;
  actingPlayerId: string;
  pieceId: string;
  fromTileId: string;
  toTileId: string;
  turnNumber: number;
  session?: GameSessionDto;
  turn?: GameActionResultDto["turn"];
};

export type GameTileOwnershipChangedEventDto = {
  gameSessionId: string;
  tileId: string;
  ownerPlayerId: string | null;
  session?: GameSessionDto;
};

export type GameTurnAdvancedEventDto = {
  gameSessionId: string;
  currentTurnPlayerId: string | null;
  turnNumber: number;
  reason?: string;
  session?: GameSessionDto;
  turn?: GameActionResultDto["turn"];
};

export function toGameSessionEvent(payload: GameSessionDto): GameSession {
  return mapGameSession(payload);
}

export function toGameActionResultEvent(payload: GameActionResultDto): GameActionResult {
  return mapGameActionResult(payload);
}

export function isGameActionResult(payload: unknown): payload is GameActionResultDto {
  return typeof payload === "object" && payload !== null && "session" in payload && "turn" in payload;
}

export function isGameSession(payload: unknown): payload is GameSessionDto {
  return typeof payload === "object" && payload !== null && "tiles" in payload && "pieces" in payload && "players" in payload;
}

export function isGameMoveExecutedEvent(payload: unknown): payload is GameMoveExecutedEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as GameMoveExecutedEventDto).gameSessionId === "string" &&
    typeof (payload as GameMoveExecutedEventDto).pieceId === "string" &&
    typeof (payload as GameMoveExecutedEventDto).fromTileId === "string" &&
    typeof (payload as GameMoveExecutedEventDto).toTileId === "string" &&
    typeof (payload as GameMoveExecutedEventDto).turnNumber === "number"
  );
}

export function isGameTileOwnershipChangedEvent(payload: unknown): payload is GameTileOwnershipChangedEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as GameTileOwnershipChangedEventDto).gameSessionId === "string" &&
    typeof (payload as GameTileOwnershipChangedEventDto).tileId === "string"
  );
}

export function isGameTurnAdvancedEvent(payload: unknown): payload is GameTurnAdvancedEventDto {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as GameTurnAdvancedEventDto).gameSessionId === "string" &&
    typeof (payload as GameTurnAdvancedEventDto).turnNumber === "number"
  );
}
