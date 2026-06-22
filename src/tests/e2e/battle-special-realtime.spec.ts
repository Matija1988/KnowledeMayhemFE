import { expect, type Page, test } from "@playwright/test";
import { battleReadyGameSession, routeGameApi, signInToGame } from "./game-fixtures";

test("opponent tab receives battle result through authoritative broadcast within 2 seconds", async ({ context }) => {
  const playerOne = await context.newPage();
  const playerTwo = await context.newPage();

  try {
    await Promise.all([signInToGame(playerOne), signInToGame(playerTwo)]);
    await Promise.all([routeGameApi(playerOne), routeGameApi(playerTwo)]);
    await Promise.all([routeSession(playerOne, () => battleReadyGameSession), routeSession(playerTwo, () => battleReadyGameSession)]);
    await Promise.all([
      routeUnavailableHub(playerOne),
      routeUnavailableHub(playerTwo),
    ]);

    await Promise.all([playerOne.goto("/game/session-1"), playerTwo.goto("/game/session-1")]);
    await expect(playerTwo.getByRole("gridcell", { name: /row 1 column 2/i })).toContainText("P2");

    await playerOne.getByRole("gridcell", { name: /row 1 column 1/i }).click();
    await playerOne.getByRole("gridcell", { name: /row 1 column 2.*valid target/i }).click();
    await playerOne.getByRole("button", { name: /alpha/i }).click();

    const startedAt = Date.now();
    await playerOne.getByRole("button", { name: /submit/i }).click();

    await expect(playerTwo.getByRole("gridcell", { name: /row 1 column 2/i })).toContainText("P1", { timeout: 2_000 });
    expect(Date.now() - startedAt).toBeLessThan(2_000);
  } finally {
    await playerOne.close();
    await playerTwo.close();
  }
});

async function routeSession(page: Page, getSession: () => unknown) {
  await page.route("**/api/game-sessions/session-1", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(getSession()) });
  });
}

async function routeUnavailableHub(page: Page) {
  await page.route("**/hubs/game/negotiate**", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "offline" }) });
  });
}
