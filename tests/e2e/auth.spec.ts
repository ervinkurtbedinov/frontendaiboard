import { expect, test } from "@playwright/test";
import {
  clearAuthSession,
  createTestUser,
  expectAuthError,
  expectDashboard,
  expectLoginPage,
  expectRegisterPage,
  expectSuccessfulRegistration,
  expectValidationMessage,
  fillLoginForm,
  fillRegisterConfirmPassword,
  fillRegisterForm,
  gotoLoginPage,
  gotoRegisterPage,
  loginUser,
  logoutUser,
  registerUser,
  submitLoginForm,
  submitRegisterForm,
  type TestUser,
} from "./helpers/auth";

test.describe("Auth happy path", () => {
  test.describe.configure({ mode: "serial" });

  let registeredUser: TestUser;

  test("registers when all required fields are filled", async ({ page }) => {
    registeredUser = createTestUser();

    await clearAuthSession(page);
    await registerUser(page, registeredUser);
    await expectSuccessfulRegistration(page, registeredUser);
  });

  test("logs in with registered credentials and supports logout", async ({ page }) => {
    await loginUser(page, registeredUser.email, registeredUser.password);
    await expectDashboard(page, registeredUser.fullName);

    await logoutUser(page);
    await expectLoginPage(page);

    await loginUser(page, registeredUser.email, registeredUser.password);
    await expectDashboard(page, registeredUser.fullName);
  });

  test("rejects duplicate registration for the same email", async ({ page }) => {
    await clearAuthSession(page);
    await gotoRegisterPage(page);

    await fillRegisterForm(page, registeredUser);
    await fillRegisterConfirmPassword(page, registeredUser.password);
    await submitRegisterForm(page);

    await expectRegisterPage(page);
    await expectAuthError(page, /already registered|already been registered|User already registered/i);
  });
});

test.describe("Register validation", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthSession(page);
    await gotoRegisterPage(page);
  });

  test("shows errors when register form is submitted empty", async ({ page }) => {
    await submitRegisterForm(page);

    await expectRegisterPage(page);
    await expectValidationMessage(page, "Invalid email");
    await expectValidationMessage(page, "Role is required");
    await expectValidationMessage(page, "String must contain at least 2 character(s)");
    await expectValidationMessage(page, "String must contain at least 6 character(s)");
  });

  test("shows error when full name is too short", async ({ page }) => {
    await fillRegisterForm(page, {
      fullName: "A",
      email: "valid@example.com",
      role: "Frontend",
      password: "TestPass123!",
    });
    await fillRegisterConfirmPassword(page, "TestPass123!");
    await submitRegisterForm(page);

    await expectRegisterPage(page);
    await expectValidationMessage(page, "String must contain at least 2 character(s)");
  });

  test("shows error when email format is invalid", async ({ page }) => {
    await fillRegisterForm(page, {
      fullName: "Valid Name",
      email: "not-an-email",
      role: "Backend",
      password: "TestPass123!",
    });
    await fillRegisterConfirmPassword(page, "TestPass123!");
    await submitRegisterForm(page);

    await expectRegisterPage(page);
    await expectValidationMessage(page, "Invalid email");
  });

  test("shows error when role is not selected", async ({ page }) => {
    await page.getByPlaceholder("Full name").fill("Valid Name");
    await page.getByPlaceholder("Email").fill("valid@example.com");
    await page.getByPlaceholder("Password", { exact: true }).fill("TestPass123!");
    await fillRegisterConfirmPassword(page, "TestPass123!");
    await submitRegisterForm(page);

    await expectRegisterPage(page);
    await expectValidationMessage(page, "Role is required");
  });

  test("shows error when password is too short", async ({ page }) => {
    await fillRegisterForm(page, {
      fullName: "Valid Name",
      email: "valid@example.com",
      role: "QA",
      password: "12345",
    });
    await fillRegisterConfirmPassword(page, "12345");
    await submitRegisterForm(page);

    await expectRegisterPage(page);
    await expectValidationMessage(page, "String must contain at least 6 character(s)");
  });

  test("shows error when passwords do not match", async ({ page }) => {
    await fillRegisterForm(page, {
      fullName: "Valid Name",
      email: "valid@example.com",
      role: "DevOps",
      password: "TestPass123!",
    });
    await fillRegisterConfirmPassword(page, "DifferentPass123!");
    await submitRegisterForm(page);

    await expectRegisterPage(page);
    await expectValidationMessage(page, "Passwords must match");
  });
});

test.describe("Login validation and errors", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthSession(page);
  });

  test("shows errors when login form is submitted empty", async ({ page }) => {
    await gotoLoginPage(page);
    await submitLoginForm(page);

    await expectLoginPage(page);
    await expectValidationMessage(page, "Invalid email");
    await expectValidationMessage(page, "String must contain at least 6 character(s)");
  });

  test("shows error when login email format is invalid", async ({ page }) => {
    await gotoLoginPage(page);
    await fillLoginForm(page, "bad-email", "TestPass123!");
    await submitLoginForm(page);

    await expectLoginPage(page);
    await expectValidationMessage(page, "Invalid email");
  });

  test("shows error when login password is too short", async ({ page }) => {
    await gotoLoginPage(page);
    await fillLoginForm(page, "valid@example.com", "12345");
    await submitLoginForm(page);

    await expectLoginPage(page);
    await expectValidationMessage(page, "String must contain at least 6 character(s)");
  });

  test("shows error for invalid login credentials", async ({ page }) => {
    await gotoLoginPage(page);
    await fillLoginForm(page, "missing-user@example.com", "WrongPass123!");
    await submitLoginForm(page);

    await expectLoginPage(page);
    await expectAuthError(page, /Invalid login credentials/i);
  });
});

test.describe("Auth route guards", () => {
  test("redirects unauthenticated user from dashboard to login", async ({ page }) => {
    await clearAuthSession(page);
    await page.goto("/dashboard");

    await expectLoginPage(page);
  });

  test("redirects authenticated user from login to dashboard", async ({ page }) => {
    const user = createTestUser();

    await clearAuthSession(page);
    await registerUser(page, user);
    await gotoLoginPage(page);

    await expectDashboard(page, user.fullName);
  });
});

test.describe("Forgot password", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthSession(page);
    await page.goto("/forgot-password");
  });

  test("stays on page when form is submitted empty", async ({ page }) => {
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
    await expectValidationMessage(page, "Invalid email");
  });

  test("shows error for invalid email format", async ({ page }) => {
    await page.getByPlaceholder("Email").fill("not-an-email");
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
    await expectValidationMessage(page, "Invalid email");
  });

  test("submits valid email and clears the form", async ({ page }) => {
    await page.getByPlaceholder("Email").fill("reset-user@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByPlaceholder("Email")).toHaveValue("");
  });
});
