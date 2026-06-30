import { expect } from "@playwright/test";
import { test } from "./fixtures/test";
import { expectValidationMessage } from "./helpers/auth";

test.describe("AI Task Generator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ai-generator");
  });

  test("generates mocked tasks for a valid prompt", async ({ page }) => {
    await page
      .getByPlaceholder("Describe your project and request structured tasks...")
      .fill("Build a landing page with hero section and pricing block for the team.");
    await page.getByRole("button", { name: "Generate Tasks" }).click();

    await expect(page.getByText("Set up landing page structure")).toBeVisible();
    await expect(page.getByText("Prepare copywriting draft")).toBeVisible();
  });

  test("shows validation error for empty prompt", async ({ page }) => {
    await page.getByRole("button", { name: "Generate Tasks" }).click();

    await expectValidationMessage(page, "Describe project requirements in more detail.");
  });

  test("shows validation error for short prompt", async ({ page }) => {
    await page.getByPlaceholder("Describe your project and request structured tasks...").fill("Too short");
    await page.getByRole("button", { name: "Generate Tasks" }).click();

    await expectValidationMessage(page, "Describe project requirements in more detail.");
  });

  test("shows empty state before generation", async ({ page }) => {
    await expect(page.getByText("No generated tasks")).toBeVisible();
  });
});
