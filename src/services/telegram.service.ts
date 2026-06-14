import { mockDelay } from "@/lib/mock-delay";
import { mockTelegramTasks } from "@/lib/mocks";
import type { ApiResponse, TelegramTask } from "@/types";

export const telegramService = {
  async getInbox(): Promise<ApiResponse<TelegramTask[]>> {
    await mockDelay();
    return { data: mockTelegramTasks, error: null };
  },

  async approveTask(taskId: string): Promise<ApiResponse<{ taskId: string; approved: boolean }>> {
    await mockDelay();
    return { data: { taskId, approved: true }, error: null };
  },

  async rejectTask(taskId: string): Promise<ApiResponse<{ taskId: string; rejected: boolean }>> {
    await mockDelay();
    return { data: { taskId, rejected: true }, error: null };
  },
};
