import { expect, test } from "@playwright/test";

test("successful login reaches lobby within 10 seconds and survives refresh", async ({ page }) => {
  await page.route("**/api/identity/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ accessToken: "e2e-token" }),
    });
  });

  await page.goto("/login");
  const start = Date.now();
  await page.getByLabel("Username or email").fill("alice");
  await page.getByLabel("Password").fill("P@ssword123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Lobby", exact: true })).toBeVisible();
  expect(Date.now() - start).toBeLessThan(10_000);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Lobby", exact: true })).toBeVisible();
});
