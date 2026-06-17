import { expect, test } from "@playwright/test";
import { routeGameApi, signInToGame } from "./game-fixtures";

test("question conquest keeps the board unchanged until answer resolution", async ({ page }) => {
  await signInToGame(page);
  await routeGameApi(page);
  await page.route("**/hubs/game/negotiate**", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "offline" }) });
  });

  await page.goto("/game/session-1");
  await page.getByRole("gridcell", { name: /row 1 column 1/i }).click();
  await page.getByRole("gridcell", { name: /row 1 column 2.*valid target/i }).click();

  await expect(page.getByRole("dialog", { name: /conquest question/i })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: /row 1 column 1/i })).toContainText("P1");
  await expect(page.getByRole("gridcell", { name: /row 1 column 2/i })).not.toContainText("P1");
});
