import type { ChatMessage, ChatThread } from "@/types";

export const mockChatThreads: ChatThread[] = [
  {
    id: "thread_1",
    title: "Sprint planning assistant",
    updatedAt: "2026-06-14T05:00:00.000Z",
  },
  {
    id: "thread_2",
    title: "Release checklist",
    updatedAt: "2026-06-13T16:00:00.000Z",
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg_1",
    threadId: "thread_1",
    role: "assistant",
    text: "Share your sprint goal and I will propose a task breakdown.",
    createdAt: "2026-06-14T05:00:00.000Z",
  },
];
