import { expect, test } from "@playwright/test";
import { routeGameApi, signInToGame, specialReadyGameSession } from "./game-fixtures";

test.beforeEach(async ({ page }) => {
  await signInToGame(page);
  await routeGameApi(page);
  await page.route("**/hubs/game/negotiate**", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "offline" }) });
  });
  await page.route("**/api/game-sessions/session-1", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(specialReadyGameSession) });
  });
});

test("current player completes a special field success journey", async ({ page }) => {
  await page.goto("/game/session-1");
  await page.getByRole("gridcell", { name: /row 1 column 1/i }).click();
  await page.getByRole("gridcell", { name: /row 1 column 2.*special field.*valid target/i }).click();

  await expect(page.getByRole("dialog", { name: /special field question/i })).toBeVisible();
  await expect(page.getByText(/0 \/ 3/i)).toBeVisible();
  await page.getByRole("button", { name: /alpha/i }).click();
  await page.getByRole("button", { name: /submit/i }).click();

  await expect(page.getByText(/special field succeeded/i).first()).toBeVisible();
  await expect(page.getByRole("gridcell", { name: /row 1 column 2/i })).toContainText("P1");
  await expect(page.getByRole("gridcell", { name: /row 1 column 2/i })).toContainText("L2");
});

test("current player sees special field failure feedback without local movement", async ({ page }) => {
  await page.route("**/api/game-sessions/session-1/special-field-attempts/special-1/answers", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        specialFieldAttemptId: "special-1",
        status: "Failed",
        reason: "incorrect-answer",
        gameSessionId: "session-1",
        movedPieceId: "piece-1",
        sourceTileId: "tile-0-0",
        targetTileId: "tile-1-0",
        nextTurnPlayerId: "player-2",
        turnNumber: 2,
        sequence: 2,
        session: { ...specialReadyGameSession, currentTurnPlayerId: "player-2", turnNumber: 2 },
      }),
    });
  });

  await page.goto("/game/session-1");
  await page.getByRole("gridcell", { name: /row 1 column 1/i }).click();
  await page.getByRole("gridcell", { name: /row 1 column 2.*special field.*valid target/i }).click();
  await page.getByRole("button", { name: /alpha/i }).click();
  await page.getByRole("button", { name: /submit/i }).click();

  await expect(page.getByText(/special field failed/i).first()).toBeVisible();
  await expect(page.getByRole("gridcell", { name: /row 1 column 1/i })).toContainText("P1");
  await expect(page.getByRole("gridcell", { name: /row 1 column 2/i })).not.toContainText("P1");
});
