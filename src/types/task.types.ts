export const TASK_STATUSES = ["backlog", "todo", "in_progress", "review", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};
