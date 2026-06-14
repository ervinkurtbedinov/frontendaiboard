import type { TelegramTask } from "@/types";

export const mockTelegramTasks: TelegramTask[] = [
  {
    id: "tg_1",
    sourceChat: "@marketing_team",
    title: "Design social campaign tasks",
    description: "Create draft tasks for social campaign launch next week.",
    priority: "high",
    receivedAt: "2026-06-14T06:00:00.000Z",
  },
  {
    id: "tg_2",
    sourceChat: "@ops_channel",
    title: "Audit onboarding flow",
    description: "Review support feedback and convert into board tasks.",
    priority: "medium",
    receivedAt: "2026-06-14T06:20:00.000Z",
  },
];
