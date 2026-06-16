import { expect, test } from "@playwright/test";
import { routeLobbyApi, signIn } from "./lobby-fixtures";

test("create and join visible navigation complete within five seconds", async ({ page }) => {
  await signIn(page);
  await routeLobbyApi(page);

  await page.goto("/lobby");
  const createStart = Date.now();
  await page.getByRole("button", { name: "Create lobby" }).click();
  await expect(page.getByText("ABC123")).toBeVisible();
  expect(Date.now() - createStart).toBeLessThan(5_000);

  await page.goto("/lobby");
  const joinStart = Date.now();
  await page.getByLabel("Lobby code").fill("abc123");
  await page.getByRole("button", { name: "Join lobby" }).click();
  await expect(page.getByText("ABC123")).toBeVisible();
  expect(Date.now() - joinStart).toBeLessThan(5_000);
});
