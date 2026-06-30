import { expect, type Page } from "@playwright/test";

export async function openCreateBoardModal(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Create Board" }).click();
  await expect(page.getByRole("heading", { name: "Create Board" })).toBeVisible();
}

export async function fillBoardName(page: Page, name: string): Promise<void> {
  await page.getByPlaceholder("Board name").fill(name);
}

export async function submitCreateBoardForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Create board" }).click();
}

export async function addParticipantByEmail(page: Page, email: string): Promise<void> {
  await page.getByPlaceholder("Enter participant email").fill(email);
  await page.getByRole("button", { name: "Add" }).click();
}

export async function createBoard(page: Page, name: string): Promise<void> {
  await openCreateBoardModal(page);
  await fillBoardName(page, name);
  await submitCreateBoardForm(page);
  await expect(page.getByRole("heading", { name: "Create Board" })).not.toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(name)).toBeVisible({ timeout: 30_000 });
}

export async function openBoardFromList(page: Page, boardName: string): Promise<void> {
  const boardCard = page.locator("div.rounded-xl").filter({ has: page.getByRole("heading", { name: boardName }) });
  await boardCard.getByRole("link", { name: "Open board" }).click();
  await expect(page).toHaveURL(/\/boards\/[^/]+$/);
}
