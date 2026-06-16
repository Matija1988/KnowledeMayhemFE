import { expect, test } from "@playwright/test";
import { routeGameApi, signInToGame } from "./game-fixtures";

test("game page exposes realtime connection failure without hiding authoritative state", async ({ page }) => {
  await signInToGame(page);
  await routeGameApi(page);

  await page.route("**/hubs/game/negotiate**", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "offline" }) });
  });

  await page.goto("/game/session-1");

  await expect(page.getByRole("grid", { name: "Game board" })).toBeVisible();
  await expect(page.getByText(/connection: error/i)).toBeVisible();
  await expect(page.getByText(/realtime unavailable/i)).toBeVisible();
});
