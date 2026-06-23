import type { Lobby, PieceColor } from "../../domain/lobby/lobbyTypes";
import { lobbyWithGuest } from "./lobbyFixtures";

export const lobbySetupCategoryIds = ["10000000-0000-0000-0000-000000000001", "10000000-0000-0000-0000-000000000002"];

export function configuredLobbyFixture(overrides: Partial<Lobby> = {}): Lobby {
  return lobbyWithGuest({
    selectedCategoryIds: lobbySetupCategoryIds,
    setupVersion: 3,
    players: [
      {
        userId: "user-1",
        joinedAtUtc: "2026-06-16T10:00:00.000Z",
        selectedPieceColor: "Red",
        isReady: true,
      },
      {
        userId: "user-2",
        joinedAtUtc: "2026-06-16T10:01:00.000Z",
        selectedPieceColor: "Blue",
        isReady: true,
      },
    ],
    setupStatus: "Ready",
    updatedAtUtc: "2026-06-16T10:02:00.000Z",
    ...overrides,
  });
}

export function usedPieceColors(lobby = configuredLobbyFixture()): PieceColor[] {
  return lobby.players.flatMap((player) => (player.selectedPieceColor ? [player.selectedPieceColor] : []));
}
