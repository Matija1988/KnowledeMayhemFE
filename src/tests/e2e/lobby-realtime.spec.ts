import { expect, test } from "@playwright/test";
import { routeLobbyApi, signIn } from "./lobby-fixtures";

test("lobby room exposes connection status while realtime updates connect", async ({ page }) => {
  await signIn(page);
  await routeLobbyApi(page);

  await page.goto("/lobby/lobby-1");
  await expect(page.getByText(/connecting|connected|error|idle/i)).toBeVisible();
});
