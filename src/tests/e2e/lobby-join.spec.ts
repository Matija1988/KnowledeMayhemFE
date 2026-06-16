import { expect, test } from "@playwright/test";
import { guestToken, routeLobbyApi, signIn } from "./lobby-fixtures";

test("authenticated user can join by normalized code", async ({ page }) => {
  await signIn(page, guestToken);
  await routeLobbyApi(page);

  await page.goto("/lobby");
  await page.getByRole("button", { name: "Join lobby" }).click();
  await expect(page.getByText("Enter a lobby code.")).toBeVisible();

  await page.getByLabel("Lobby code").fill(" abc123 ");
  await page.getByRole("button", { name: "Join lobby" }).click();

  await expect(page).toHaveURL(/\/lobby\/lobby-1/);
  await expect(page.getByText("ABC123")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start lobby" })).not.toBeVisible();
});
