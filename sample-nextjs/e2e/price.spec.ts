import { test, expect } from "@playwright/test";

// @covers REQ-005
test("1000 を入力すると ¥1,000 が表示される", async ({ page }) => {
  await page.goto("/price");
  await page.getByRole("spinbutton", { name: /金額/ }).fill("1000");
  await expect(page.getByText("¥1,000")).toBeVisible();
});

// @covers REQ-005 — 異常系（/adversary が happy path 1 本のみを指摘）
test("負数 -1 を入力するとエラーメッセージが表示される", async ({ page }) => {
  await page.goto("/price");
  await page.getByRole("spinbutton", { name: /金額/ }).fill("-1");
  await expect(page.getByText(/0以上/)).toBeVisible();
});
