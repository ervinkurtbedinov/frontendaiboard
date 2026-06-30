import { expect } from "@playwright/test";
import { test } from "./fixtures/test";

test.describe("Billing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/billing");
    await expect(page.getByText("Loading billing...")).not.toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Billing", level: 2 })).toBeVisible();
  });

  test("shows current free plan usage", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Current Plan" })).toBeVisible();
    await expect(page.locator(".capitalize").filter({ hasText: "free" }).first()).toBeVisible();
    await expect(page.getByText("AI requests: not included")).toBeVisible();
    await expect(page.getByText(/Team members:/)).toBeVisible();
  });

  test("shows plan features for free and team tiers", async ({ page }) => {
    await expect(page.getByText("No AI requests")).toBeVisible();
    await expect(page.getByText("Up to 3 team members")).toBeVisible();
    await expect(page.getByText("Telegram notifications")).toBeVisible();
    await expect(page.getByText("Create tasks via Telegram")).toBeVisible();
  });

  test("marks free plan as active and shows upgrade for paid plans", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Active plan" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Upgrade" })).toHaveCount(2);
  });

  test("shows success message after checkout success redirect", async ({ page }) => {
    await page.goto("/billing?checkout=success");
    await expect(page.getByText("Loading billing...")).not.toBeVisible({ timeout: 30_000 });

    await expect(page.getByText("Payment successful. Your subscription will update shortly.")).toBeVisible();
  });

  test("shows canceled message after checkout canceled redirect", async ({ page }) => {
    await page.goto("/billing?checkout=canceled");
    await expect(page.getByText("Loading billing...")).not.toBeVisible({ timeout: 30_000 });

    await expect(page.getByText("Checkout was canceled.")).toBeVisible();
  });

  test("shows error when checkout API fails", async ({ page }) => {
    await page.route("**/billing/create-checkout-session", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Billing service unavailable" }),
      });
    });

    await page.getByRole("button", { name: "Upgrade" }).first().click();

    await expect(page.getByText("Billing service unavailable")).toBeVisible();
  });

  test("calls checkout API when upgrade succeeds", async ({ page }) => {
    let checkoutRequested = false;

    await page.route("**/billing/create-checkout-session", async (route) => {
      checkoutRequested = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ checkoutUrl: "https://checkout.stripe.test/session/e2e" }),
      });
    });

    await page.goto("/billing");
    await expect(page.getByText("Loading billing...")).not.toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "Upgrade" }).first().click();

    await expect.poll(() => checkoutRequested).toBe(true);
  });
});
