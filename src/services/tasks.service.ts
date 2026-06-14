import { mockDelay } from "@/lib/mock-delay";
import { mockTasks } from "@/lib/mocks";
import type { ApiResponse, Task, TaskStatus } from "@/types";

export const tasksService = {
  async getTasksByBoardId(boardId: string): Promise<ApiResponse<Task[]>> {
    await mockDelay();
    void boardId;
    return { data: mockTasks, error: null };
  },

  async createTask(task: Omit<Task, "id" | "createdAt">): Promise<ApiResponse<Task>> {
    await mockDelay();
    return {
      data: {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
      error: null,
    };
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<ApiResponse<{ taskId: string; status: TaskStatus }>> {
    await mockDelay();
    return {
      data: { taskId, status },
      error: null,
    };
  },
};
