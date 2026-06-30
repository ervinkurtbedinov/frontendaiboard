import { expect } from "@playwright/test";
import { test } from "./fixtures/test";

test.describe("Telegram Inbox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/telegram");
  });

  test("shows incoming mock tasks", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Design social campaign tasks" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Audit onboarding flow" })).toBeVisible();
  });

  test("removes task after approve", async ({ page }) => {
    await page.getByRole("button", { name: "Approve" }).first().click();

    await expect(page.getByRole("heading", { name: "Design social campaign tasks" })).not.toBeVisible();
  });

  test("removes task after reject", async ({ page }) => {
    await page.getByRole("button", { name: "Reject" }).first().click();

    await expect(page.getByRole("heading", { name: "Design social campaign tasks" })).not.toBeVisible();
  });

  test("shows empty state when inbox is cleared", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Approve" })).toHaveCount(2);

    await page.getByRole("button", { name: "Approve" }).first().click();
    await expect(page.getByRole("button", { name: "Approve" })).toHaveCount(1);

    await page.getByRole("button", { name: "Approve" }).first().click();
    await expect(page.getByRole("button", { name: "Approve" })).toHaveCount(0);

    await expect(page.getByText("Inbox is clear")).toBeVisible();
  });
});
