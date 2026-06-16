import { expect, test } from "@playwright/test";
import { gameSession, movedGameSession, routeGameApi, signInToGame } from "./game-fixtures";

test("game load and move pending feedback meet timing goals", async ({ page }) => {
  await signInToGame(page);
  await routeGameApi(page);
  await page.route("**/api/game-sessions/session-1/moves", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        session: movedGameSession,
        turn: {
          gameSessionId: gameSession.id,
          currentTurnPlayerId: "player-2",
          turnNumber: 2,
          status: null,
        },
      }),
    });
  });

  const loadStartedAt = Date.now();
  await page.goto("/game/session-1");
  await expect(page.getByRole("grid", { name: "Game board" })).toBeVisible();
  expect(Date.now() - loadStartedAt).toBeLessThan(5000);

  await page.getByRole("gridcell", { name: /row 1 column 1/i }).click();
  const pendingStartedAt = Date.now();
  await page.getByRole("gridcell", { name: /row 1 column 2.*valid target/i }).click();
  await expect(page.getByRole("status", { name: "" }).filter({ hasText: "Loading" })).toBeVisible();
  expect(Date.now() - pendingStartedAt).toBeLessThan(500);
});
