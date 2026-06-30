import { expect } from "@playwright/test";
import { test } from "./fixtures/test";

test.describe("Dashboard", () => {
  test("shows welcome card with user full name", async ({ page, authenticatedUser }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
    await expect(page.getByText(authenticatedUser.user.fullName)).toBeVisible();
  });

  test("shows KPI cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard", level: 2 })).toBeVisible();

    await expect(page.getByText("Open tasks")).toBeVisible();
    await expect(page.getByText("AI generations")).toBeVisible();
  });
});
