import { expect } from "@playwright/test";
import { test } from "./fixtures/test";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings", level: 2 })).toBeVisible();
  });

  test("saves profile team role changes", async ({ page }) => {
    const nextRole = `QA Lead ${Date.now()}`;

    await page.getByPlaceholder("Product Manager").fill(nextRole);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Saved to database.")).toBeVisible();
    await expect(page.getByPlaceholder("Product Manager")).toHaveValue(nextRole);
  });

  test("disables save when there are no unsaved changes", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  test("resets unsaved profile changes", async ({ page }) => {
    const originalValue = await page.getByPlaceholder("Product Manager").inputValue();

    await page.getByPlaceholder("Product Manager").fill("Temporary Role");
    await page.getByRole("button", { name: "Reset" }).click();

    await expect(page.getByPlaceholder("Product Manager")).toHaveValue(originalValue);
  });

  test("shows placeholder tabs content", async ({ page }) => {
    await page.getByRole("tab", { name: "Team" }).click();
    await expect(page.getByText("Team management placeholder.")).toBeVisible();

    await page.getByRole("tab", { name: "Notifications" }).click();
    await expect(page.getByText("Notification settings placeholder.")).toBeVisible();

    await page.getByRole("tab", { name: "Integrations" }).click();
    await expect(page.getByText("Integration settings placeholder.")).toBeVisible();
  });

  test("generates telegram link or shows env warning", async ({ page }) => {
    await page.getByRole("button", { name: "Generate Telegram link" }).click();

    const successMessage = page.getByText("Deep link generated. Open it and press the Telegram button to enable notifications.");
    const envWarning = page.getByText("VITE_TELEGRAM_BOT_USERNAME is missing. Add it to env to generate a Telegram deep link.");

    await expect(successMessage.or(envWarning)).toBeVisible();
  });

  test("refresh telegram status keeps settings page usable", async ({ page }) => {
    await page.getByRole("button", { name: "Refresh status" }).click();

    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByText(/Status: (Connected|Not connected yet)/)).toBeVisible();
  });

  test("updates telegram username field", async ({ page }) => {
    const username = `@e2e_user_${Date.now()}`;

    await page.getByPlaceholder("@yourusername").fill(username);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Saved to database.")).toBeVisible();
    await expect(page.getByPlaceholder("@yourusername")).toHaveValue(username);
  });
});
