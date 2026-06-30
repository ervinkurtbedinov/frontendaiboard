import { expect } from "@playwright/test";
import { test } from "./fixtures/test";

test.describe("AI Assistant", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ai-chat");
    await page.addStyleTag({
      content: ".fixed.bottom-4.right-4 { display: none !important; }",
    });
    await expect(page.getByRole("heading", { name: "AI Assistant", level: 2 })).toBeVisible();
  });

  test("sends a message and shows mocked assistant reply", async ({ page }) => {
    const message = "Help me plan sprint tasks";

    await page.getByPlaceholder("Ask AI assistant...").fill(message);
    await page.getByRole("button", { name: "Send" }).click({ force: true });

    await expect(page.getByText(message)).toBeVisible();
    await expect(page.getByText(`Mocked AI response for: ${message}`)).toBeVisible();
  });

  test("switches conversation threads", async ({ page }) => {
    await page.getByRole("button", { name: "Release checklist" }).click();

    await expect(page.getByRole("button", { name: "Release checklist" })).toHaveClass(/border-primary/);
  });

  test("does not send empty messages", async ({ page }) => {
    const initialMessages = await page.locator(".rounded-lg.px-4.py-2.text-sm").count();

    await page.getByPlaceholder("Ask AI assistant...").fill("   ");
    await page.getByRole("button", { name: "Send" }).click({ force: true });

    await expect(page.locator(".rounded-lg.px-4.py-2.text-sm")).toHaveCount(initialMessages);
  });

  test("shows initial assistant message in default thread", async ({ page }) => {
    await expect(page.getByText("Share your sprint goal and I will propose a task breakdown.")).toBeVisible();
  });
});
