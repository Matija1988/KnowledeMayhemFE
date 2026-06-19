import { expect, test } from "@playwright/test";

test("admin can open question bank management shell", async ({ page }) => {
  await page.addInitScript(() => {
    const encode = (value: unknown) =>
      btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const token = `${encode({ alg: "none", typ: "JWT" })}.${encode({ role: "Admin", exp: 4_102_444_800 })}.`;
    window.localStorage.setItem("knowledge-mayhem.auth", JSON.stringify({ accessToken: token }));
  });

  await page.goto("/admin/question-bank");
  await expect(page.getByRole("heading", { name: "Question bank" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Question bank navigation" }).getByRole("link", { name: "Questions" })).toBeVisible();
});

test("player cannot see question bank management content", async ({ page }) => {
  await page.addInitScript(() => {
    const encode = (value: unknown) =>
      btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const token = `${encode({ alg: "none", typ: "JWT" })}.${encode({ role: "Player", exp: 4_102_444_800 })}.`;
    window.localStorage.setItem("knowledge-mayhem.auth", JSON.stringify({ accessToken: token }));
  });

  await page.goto("/admin/question-bank/questions");
  await expect(page.locator("main").getByRole("heading", { name: "Permission denied" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Question bank" })).not.toBeVisible();
});
