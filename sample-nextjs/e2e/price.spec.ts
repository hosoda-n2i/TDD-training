import { test, expect } from "@playwright/test";

test("1000 を入力すると ¥1,000 が表示される", async ({ page }) => {
  await page.goto("/price");
  await page.getByRole("spinbutton", { name: /金額/ }).fill("1000");
  await expect(page.getByText("¥1,000")).toBeVisible();
});
