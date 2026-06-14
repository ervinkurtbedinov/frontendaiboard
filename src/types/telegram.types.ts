import type { TaskPriority } from "@/types/task.types";

export type TelegramTask = {
  id: string;
  sourceChat: string;
  title: string;
  description: string;
  priority: TaskPriority;
  receivedAt: string;
};
