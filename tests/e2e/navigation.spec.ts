import { expect, test } from "@playwright/test";
import { logoutUser } from "./helpers/auth";
import { setupAuthenticatedUser } from "./helpers/session";
import { expectNavPage, NAV_ITEMS, navigateViaSidebar } from "./helpers/navigation";

test.describe("Navigation", () => {
  test("redirects root to dashboard for authenticated users", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/");

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  for (const item of NAV_ITEMS) {
    test(`opens ${item.label} from sidebar`, async ({ page }) => {
      await setupAuthenticatedUser(page);
      await page.goto("/dashboard");
      await navigateViaSidebar(page, item.label);
      await expectNavPage(page, item);
    });
  }

  test("redirects unauthenticated user from settings to login", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/settings");

    await expect(page).toHaveURL(/\/login$/);
  });

  test("logs out from billing page", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/billing");
    await logoutUser(page);
    await expect(page).toHaveURL(/\/login$/);
  });
});
