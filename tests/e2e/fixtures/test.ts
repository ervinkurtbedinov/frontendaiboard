import { test as base, expect } from "@playwright/test";
import { setupAuthenticatedUser, type AuthenticatedSession } from "../helpers/session";

type AuthenticatedFixtures = {
  authenticatedUser: AuthenticatedSession;
};

export const test = base.extend<AuthenticatedFixtures>({
  authenticatedUser: [
    async ({ page }, use) => {
      const session = await setupAuthenticatedUser(page);
      await use(session);
    },
    { auto: true },
  ],
});

export { expect };
