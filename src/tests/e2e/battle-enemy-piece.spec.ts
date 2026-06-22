import { expect, test } from "@playwright/test";
import { battleReadyGameSession, routeGameApi, signInToGame } from "./game-fixtures";

test.beforeEach(async ({ page }) => {
  await signInToGame(page);
  await routeGameApi(page);
  await page.route("**/hubs/game/negotiate**", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "offline" }) });
  });
});

test("current player completes an enemy battle success journey within the start target", async ({ page }) => {
  await page.route("**/api/game-sessions/session-1", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(battleReadyGameSession) });
  });

  await page.goto("/game/session-1");
  await page.getByRole("gridcell", { name: /row 1 column 1/i }).click();

  const startAt = Date.now();
  await page.getByRole("gridcell", { name: /row 1 column 2.*valid target/i }).click();
  await expect(page.getByRole("dialog", { name: /battle question/i })).toBeVisible();
  expect(Date.now() - startAt).toBeLessThan(10_000);

  await page.getByRole("button", { name: /alpha/i }).click();
  await page.getByRole("button", { name: /submit/i }).click();

  await expect(page.getByText(/battle succeeded/i).first()).toBeVisible();
  await expect(page.getByRole("gridcell", { name: /row 1 column 2/i })).toContainText("P1");
  await expect(page.getByRole("gridcell", { name: /row 1 column 2/i })).toContainText("L2");
});

test("current player sees failed battle feedback without moving either piece", async ({ page }) => {
  await page.route("**/api/game-sessions/session-1", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(battleReadyGameSession) });
  });
  await page.route("**/api/game-sessions/session-1/battle-attempts/battle-1/answers", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        battleAttemptId: "battle-1",
        status: "Failed",
        reason: "incorrect-answer",
        gameSessionId: "session-1",
        movedPieceId: "piece-1",
        sourceTileId: "tile-0-0",
        targetTileId: "tile-1-0",
        nextTurnPlayerId: "player-2",
        turnNumber: 2,
        sequence: 2,
        session: { ...battleReadyGameSession, currentTurnPlayerId: "player-2", turnNumber: 2 },
      }),
    });
  });

  await page.goto("/game/session-1");
  await page.getByRole("gridcell", { name: /row 1 column 1/i }).click();
  await page.getByRole("gridcell", { name: /row 1 column 2.*valid target/i }).click();
  await page.getByRole("button", { name: /alpha/i }).click();
  await page.getByRole("button", { name: /submit/i }).click();

  await expect(page.getByText(/battle failed/i).first()).toBeVisible();
  await expect(page.getByRole("gridcell", { name: /row 1 column 1/i })).toContainText("P1");
  await expect(page.getByRole("gridcell", { name: /row 1 column 2/i })).toContainText("P2");
});
