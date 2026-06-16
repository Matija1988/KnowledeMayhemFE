import { expect, test } from "@playwright/test";
import { routeGameApi, signInToGame } from "./game-fixtures";

test("authenticated participant can load a game board", async ({ page }) => {
  await signInToGame(page);
  await routeGameApi(page);

  await page.goto("/game/session-1");

  await expect(page.getByRole("grid", { name: "Game board" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: /row 1 column 1/i })).toContainText("P1");
  await expect(page.getByLabel("Players").getByText("Alice", { exact: true })).toBeVisible();
  await expect(page.getByText(/turn 1/i).first()).toBeVisible();
});

test("malformed game snapshots show a blocking state", async ({ page }) => {
  await signInToGame(page);
  await routeGameApi(page);

  await page.goto("/game/malformed");

  await expect(page.getByRole("alertdialog")).toContainText(/could not be loaded safely/i);
  await expect(page.getByRole("grid", { name: "Game board" })).toHaveCount(0);
});
