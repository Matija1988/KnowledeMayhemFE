import { expect, test } from "@playwright/test";
import { routeLobbyApi, signIn } from "./lobby-fixtures";

test("host can start and cancel a lobby", async ({ page }) => {
  await signIn(page);
  await routeLobbyApi(page);

  await page.goto("/lobby/lobby-1");
  await expect(page.getByRole("button", { name: "Start lobby" })).toBeEnabled();
  await page.getByRole("button", { name: "Start lobby" }).click();
  await expect(page).toHaveURL(/\/game\/session-1/);

  await page.goto("/lobby/lobby-1");
  await page.getByRole("button", { name: "Cancel lobby" }).click();
  await expect(page).toHaveURL(/\/lobby$/);
  await expect(page.getByText("Lobby cancelled.")).toBeVisible();
});
