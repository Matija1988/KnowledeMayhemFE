import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../tests/setup";
import { gameActionResultFixture, gameSessionFixture } from "../tests/fixtures/gameFixtures";
import { getGameSession, getGameTurn, movePiece, normalizeGameError } from "./gameApi";
import { HttpError } from "./httpClient";

describe("gameApi", () => {
  it("reads game sessions through the configured API URL with bearer auth", async () => {
    await expect(getGameSession("session-1", { accessToken: "token" })).resolves.toMatchObject({ id: "session-1" });
  });

  it("reads turn state and submits moves with target coordinates", async () => {
    await expect(getGameTurn("session-1", { accessToken: "token" })).resolves.toMatchObject({ turnNumber: 1 });
    await expect(
      movePiece("session-1", { pieceId: "piece-1", targetX: 1, targetY: 0 }, { accessToken: "token" }),
    ).resolves.toMatchObject({ session: { currentTurnPlayerId: "player-2" } });
  });

  it("sends move payload as piece id and target coordinates", async () => {
    server.use(
      http.post("**/api/game-sessions/:gameSessionId/moves", async ({ request }) => {
        const body = (await request.json()) as { pieceId: string; targetX: number; targetY: number };
        return HttpResponse.json(gameActionResultFixture({ pieceId: body.pieceId, targetX: body.targetX, targetY: body.targetY }));
      }),
    );

    const result = await movePiece("session-1", { pieceId: "piece-1", targetX: 1, targetY: 0 }, { accessToken: "token" });

    expect(result.session.pieces).toContainEqual(expect.objectContaining({ id: "piece-1", currentTileId: "tile-1-0" }));
  });

  it("normalizes common game errors", () => {
    expect(normalizeGameError(new HttpError(403, null)).message).toContain("not allowed");
    expect(normalizeGameError(new HttpError(404, null)).displayMode).toBe("modal");
    expect(normalizeGameError(new HttpError(409, { title: "Not your turn" })).message).toBe("Not your turn");
    expect(normalizeGameError(new HttpError(400, { detail: "Blocked tile" })).message).toBe("Blocked tile");
    expect(normalizeGameError(new TypeError("Failed to fetch")).message).toContain("VITE_API_BASE_URL");
  });

  it("surfaces malformed snapshots through normalized errors", () => {
    expect(() => gameSessionFixture({ tiles: [] })).not.toThrow();
    expect(normalizeGameError(new Error("Game session response is missing board tiles.")).displayMode).toBe("modal");
  });
});
