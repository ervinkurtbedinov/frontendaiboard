import type { TaskPriority, TaskStatus } from "@/types/task.types";

export type AIGeneratorInput = {
  prompt: string;
};

export type GeneratedTask = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeName?: string;
};

export type AIChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type TaskAssignmentAssignee = {
  id: string;
  full_name: string;
  team_role: string | null;
};

export type TaskAssignment = {
  task: string;
  assignee: TaskAssignmentAssignee;
  task_id: string;
};

export type TaskAssignmentRequest = {
  message: string;
  board_id: string;
};
