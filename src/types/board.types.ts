import type { TaskStatus } from "@/types/task.types";

export type BoardColumn = {
  id: TaskStatus;
  title: string;
  order: number;
};

export type Board = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};
