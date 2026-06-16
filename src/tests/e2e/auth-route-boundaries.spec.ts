import { expect, test } from "@playwright/test";

test("logged-out protected access redirects to login", async ({ page }) => {
  await page.goto("/lobby");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("signed-in users visiting login are sent to lobby", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("knowledge-mayhem.auth", JSON.stringify({ accessToken: "e2e-token" }));
  });

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Lobby", exact: true })).toBeVisible();
});

test("invalid saved sessions are cleared before protected content appears", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("knowledge-mayhem.auth", "{not-json");
  });

  await page.goto("/lobby");
  await expect(page.getByRole("heading", { name: "Lobby", exact: true })).not.toBeVisible();
  await expect(page.getByText("Please sign in again.")).toBeVisible();
});
