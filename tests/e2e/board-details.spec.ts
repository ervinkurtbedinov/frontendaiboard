import { expect, test } from "@playwright/test";
import { createBoard } from "./helpers/boards";
import { setupAuthenticatedUser } from "./helpers/session";

test.describe("Board details", () => {
  test.describe.configure({ mode: "serial" });

  const boardName = `E2E Tasks Board ${Date.now()}`;
  const taskTitle = "E2E Task Title";
  const taskDescription = "E2E task description for board details test";
  const updatedTaskTitle = "Updated E2E Task Title";

  test("loads board page with members section", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await createBoard(page, boardName);
    await page.getByRole("link", { name: "Open board" }).click();

    await expect(page).toHaveURL(/\/boards\/[^/]+$/);
    await expect(page.getByRole("heading", { name: boardName })).toBeVisible();
    await expect(page.getByText(/member\(s\)/)).toBeVisible();
  });

  test("creates a task with valid fields", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await createBoard(page, `${boardName} Create`);
    await page.getByRole("link", { name: "Open board" }).click();

    await page.getByRole("button", { name: "Create Task" }).click();
    await page.getByPlaceholder("Task title").fill(taskTitle);
    await page.getByPlaceholder("Task description").fill(taskDescription);
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByRole("heading", { name: "Create Task" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: taskTitle, level: 3 })).toBeVisible();
  });

  test("opens task modal when task is clicked", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await createBoard(page, `${boardName} Modal`);
    await page.getByRole("link", { name: "Open board" }).click();

    await page.getByRole("button", { name: "Create Task" }).click();
    await page.getByPlaceholder("Task title").fill(taskTitle);
    await page.getByPlaceholder("Task description").fill(taskDescription);
    await page.getByRole("button", { name: "Create" }).click();
    await page.getByRole("heading", { name: taskTitle, level: 3 }).click();

    await expect(page.getByRole("dialog").getByRole("heading", { name: taskTitle })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete task" })).toBeVisible();
  });

  test("updates task title and priority in modal", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await createBoard(page, `${boardName} Update`);
    await page.getByRole("link", { name: "Open board" }).click();

    await page.getByRole("button", { name: "Create Task" }).click();
    await page.getByPlaceholder("Task title").fill(taskTitle);
    await page.getByPlaceholder("Task description").fill(taskDescription);
    await page.getByRole("button", { name: "Create" }).click();
    await page.getByRole("heading", { name: taskTitle, level: 3 }).click();

    const dialog = page.getByRole("dialog");
    await dialog.locator("input").first().fill(updatedTaskTitle);
    await dialog.locator("select").first().selectOption("high");

    await expect(dialog.getByRole("heading", { name: updatedTaskTitle })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { name: updatedTaskTitle, level: 3 })).toBeVisible();
  });

  test("deletes a task from modal", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await createBoard(page, `${boardName} Delete`);
    await page.getByRole("link", { name: "Open board" }).click();

    await page.getByRole("button", { name: "Create Task" }).click();
    await page.getByPlaceholder("Task title").fill(taskTitle);
    await page.getByPlaceholder("Task description").fill(taskDescription);
    await page.getByRole("button", { name: "Create" }).click();
    await page.getByRole("heading", { name: taskTitle, level: 3 }).click();
    await page.getByRole("button", { name: "Delete task" }).click();

    await expect(page.getByRole("heading", { name: taskTitle, level: 3 })).not.toBeVisible();
  });

  test("keeps create task modal open for invalid short fields", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards");
    await createBoard(page, `${boardName} Invalid Task`);
    await page.getByRole("link", { name: "Open board" }).click();

    await page.getByRole("button", { name: "Create Task" }).click();
    await page.getByPlaceholder("Task title").fill("AB");
    await page.getByPlaceholder("Task description").fill("1234");
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByRole("heading", { name: "Create Task" })).toBeVisible();
  });

  test("shows not found state for invalid board id", async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto("/boards/00000000-0000-0000-0000-000000000000");

    await expect(page.getByText("Loading board...")).not.toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Board was not found")).toBeVisible({ timeout: 30_000 });
  });
});
