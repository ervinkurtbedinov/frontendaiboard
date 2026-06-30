import { expect, test } from "@playwright/test";
import {
  addParticipantByEmail,
  createBoard,
  fillBoardName,
  openBoardFromList,
  openCreateBoardModal,
  submitCreateBoardForm,
} from "./helpers/boards";
import { expectValidationMessage } from "./helpers/auth";
import { setupAuthenticatedUser } from "./helpers/session";

test.describe("Boards", () => {
  test.describe.configure({ mode: "serial" });

  let boardName: string;

  test.beforeAll(() => {
    boardName = `E2E Board ${Date.now()}`;
  });

  test("creates a board with a valid name", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards");

    await createBoard(page, boardName);
    await expect(page.getByRole("link", { name: "Open board" })).toBeVisible();
  });

  test("opens a board from the list", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await createBoard(page, `${boardName} Open`);

    await openBoardFromList(page, `${boardName} Open`);
    await expect(page.getByRole("heading", { name: `${boardName} Open` })).toBeVisible();
  });

  test("shows validation error for empty board name", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await openCreateBoardModal(page);
    await submitCreateBoardForm(page);

    await expectValidationMessage(page, "Board name should be at least 3 characters.");
  });

  test("shows validation error for short board name", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await openCreateBoardModal(page);
    await fillBoardName(page, "AB");
    await submitCreateBoardForm(page);

    await expectValidationMessage(page, "Board name should be at least 3 characters.");
  });

  test("shows error when participant email is empty", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await openCreateBoardModal(page);
    await addParticipantByEmail(page, "   ");

    await expectValidationMessage(page, "Enter an email to search.");
  });

  test("shows error when participant is not registered", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await openCreateBoardModal(page);
    await addParticipantByEmail(page, "missing-user@example.com");

    await expectValidationMessage(page, "User with this email is not registered.");
  });

  test("shows error when adding the same participant twice", async ({ page }) => {
    const session = await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await openCreateBoardModal(page);
    await addParticipantByEmail(page, session.user.email);

    await expectValidationMessage(page, "This participant is already added.");
  });

  test("keeps current user as required participant", async ({ page }) => {
    const session = await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await openCreateBoardModal(page);

    await expect(page.getByText("You", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove" }).first()).toBeDisabled();
    await expect(page.getByText(session.user.fullName)).toBeVisible();
  });
});
