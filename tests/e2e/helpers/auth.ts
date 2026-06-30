import { expect, type Page } from "@playwright/test";

export type TestUser = {
  fullName: string;
  email: string;
  role: string;
  password: string;
};

export function createTestUser(): TestUser {
  return {
    fullName: "E2E Test User",
    email: `e2e+${Date.now()}@example.com`,
    role: "Frontend",
    password: "TestPass123!",
  };
}

export async function clearAuthSession(page: Page): Promise<void> {
  await page.goto("/login");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

export async function gotoRegisterPage(page: Page): Promise<void> {
  await page.goto("/register");
}

export async function gotoLoginPage(page: Page): Promise<void> {
  await page.goto("/login");
}

export async function fillRegisterForm(page: Page, user: Partial<TestUser>): Promise<void> {
  if (user.fullName !== undefined) {
    await page.getByPlaceholder("Full name").fill(user.fullName);
  }
  if (user.email !== undefined) {
    await page.getByPlaceholder("Email").fill(user.email);
  }
  if (user.role !== undefined) {
    await page.locator("select").selectOption(user.role);
  }
  if (user.password !== undefined) {
    await page.getByPlaceholder("Password", { exact: true }).fill(user.password);
  }
}

export async function fillRegisterConfirmPassword(page: Page, password: string): Promise<void> {
  await page.getByPlaceholder("Confirm password").fill(password);
}

export async function submitRegisterForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Register" }).click();
}

export async function fillLoginForm(page: Page, email: string, password: string): Promise<void> {
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
}

export async function submitLoginForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Login" }).click();
}

export async function registerUser(page: Page, user: TestUser): Promise<void> {
  await gotoRegisterPage(page);
  await fillRegisterForm(page, user);
  await fillRegisterConfirmPassword(page, user.password);
  await submitRegisterForm(page);
  await waitForAuthSuccess(page);
}

export async function loginUser(page: Page, email: string, password: string): Promise<void> {
  await gotoLoginPage(page);
  await fillLoginForm(page, email, password);
  await submitLoginForm(page);
  await waitForAuthSuccess(page);
}

async function waitForAuthSuccess(page: Page): Promise<void> {
  const authError = page.locator("p.text-destructive").first();

  await Promise.race([
    page.waitForURL(/\/dashboard$/, { timeout: 30_000 }),
    authError.waitFor({ state: "visible", timeout: 30_000 }).then(async () => {
      const message = (await authError.textContent())?.trim() || "Unknown auth error";
      throw new Error(message);
    }),
  ]);
}

export async function logoutUser(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Logout" }).click();
  await expectLoginPage(page);
}

export async function expectDashboard(page: Page, fullName: string): Promise<void> {
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
  await expect(page.getByText(fullName)).toBeVisible();
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
}

export async function expectLoginPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/login$/, { timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
}

export async function expectRegisterPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/register$/, { timeout: 5_000 });
  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
}

export async function expectValidationMessage(page: Page, message: string | RegExp): Promise<void> {
  await expect(page.getByText(message).first()).toBeVisible();
}

export async function expectAuthError(page: Page, message: string | RegExp): Promise<void> {
  await expect(page.locator("p.text-destructive").first()).toContainText(message);
}

export async function expectSuccessfulRegistration(page: Page, user: TestUser): Promise<void> {
  await expectDashboard(page, user.fullName);
}
