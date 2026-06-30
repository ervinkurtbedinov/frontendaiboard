import { expect, type Page } from "@playwright/test";

export type NavItem = {
  label: string;
  path: RegExp;
  heading: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: /\/dashboard$/, heading: "Dashboard" },
  { label: "Boards", path: /\/boards$/, heading: "Boards" },
  { label: "AI Generator", path: /\/ai-generator$/, heading: "AI Task Generator" },
  { label: "AI Assistant", path: /\/ai-chat$/, heading: "AI Assistant" },
  { label: "Telegram Inbox", path: /\/telegram$/, heading: "Telegram Inbox" },
  { label: "Billing", path: /\/billing$/, heading: "Billing" },
  { label: "Settings", path: /\/settings$/, heading: "Settings" },
];

export async function navigateViaSidebar(page: Page, label: string): Promise<void> {
  await page.getByRole("link", { name: label }).click();
}

export async function expectPageHeading(page: Page, heading: string): Promise<void> {
  await expect(page.getByRole("heading", { name: heading, level: 2 })).toBeVisible();
}

export async function expectBoardsPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/boards$/);
  await expect(
    page
      .getByRole("heading", { name: "Boards", level: 2 })
      .or(page.getByRole("heading", { name: "No boards yet" })),
  ).toBeVisible();
}

export async function expectNavPage(page: Page, item: NavItem): Promise<void> {
  await expect(page).toHaveURL(item.path);
  if (item.label === "Boards") {
    await expectBoardsPage(page);
    return;
  }
  await expectPageHeading(page, item.heading);
}
