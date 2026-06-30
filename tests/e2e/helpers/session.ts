import type { Page } from "@playwright/test";
import { clearAuthSession, createTestUser, registerUser, type TestUser } from "./auth";

export type AuthenticatedSession = {
  user: TestUser;
};

export async function setupAuthenticatedUser(page: Page): Promise<AuthenticatedSession> {
  const user = createTestUser();
  await clearAuthSession(page);
  await registerUser(page, user);
  await page.addStyleTag({
    content: ".fixed.bottom-4.right-4 { display: none !important; }",
  });
  return { user };
}
