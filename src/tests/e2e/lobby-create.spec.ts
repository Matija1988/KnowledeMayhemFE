import { expect, test } from "@playwright/test";
import { routeLobbyApi, signIn } from "./lobby-fixtures";

test("authenticated user can create a lobby", async ({ page }) => {
  await signIn(page);
  await routeLobbyApi(page);

  await page.goto("/lobby");
  await expect(page.getByLabel("Max players")).toHaveValue("4");
  await page.getByRole("button", { name: "Create lobby" }).click();

  await expect(page).toHaveURL(/\/lobby\/lobby-1/);
  await expect(page.getByText("ABC123")).toBeVisible();
  await expect(page.getByText("1/4")).toBeVisible();
});
