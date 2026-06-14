import type { AIChatMessage, GeneratedTask } from "@/types";

export const mockGeneratedTasks: GeneratedTask[] = [
  {
    id: "gen_1",
    title: "Set up landing page structure",
    description: "Create hero, features, pricing, and CTA sections.",
    status: "todo",
    priority: "high",
    assigneeName: "Ervin",
  },
  {
    id: "gen_2",
    title: "Prepare copywriting draft",
    description: "Draft value proposition and supporting benefit bullets.",
    status: "backlog",
    priority: "medium",
    assigneeName: "Diliara",
  },
  {
    id: "gen_3",
    title: "Create analytics event map",
    description: "Define tracking for clicks, signups, and funnel transitions.",
    status: "review",
    priority: "low",
    assigneeName: "Ervin",
  },
];

export const mockAIChatMessages: AIChatMessage[] = [
  {
    id: "ai_chat_1",
    role: "assistant",
    content: "Hi! I can help you break product goals into actionable board tasks.",
    createdAt: "2026-06-13T09:00:00.000Z",
  },
];
