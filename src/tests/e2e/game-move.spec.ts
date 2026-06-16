import { expect, test } from "@playwright/test";
import { routeGameApi, signInToGame } from "./game-fixtures";

test("current player can move an eligible piece to a highlighted target", async ({ page }) => {
  await signInToGame(page);
  await routeGameApi(page);

  await page.goto("/game/session-1");
  await page.getByRole("gridcell", { name: /row 1 column 1/i }).click();

  const target = page.getByRole("gridcell", { name: /row 1 column 2.*valid target/i });
  await expect(target).toContainText("Valid target");
  await target.click();

  await expect(page.getByRole("gridcell", { name: /row 1 column 2/i })).toContainText("P1");
  await expect(page.getByText(/turn 2/i).first()).toBeVisible();
});
