import { mockDelay } from "@/lib/mock-delay";
import { mockAIChatMessages, mockGeneratedTasks } from "@/lib/mocks";
import type { AIChatMessage, ApiResponse, GeneratedTask } from "@/types";

export const aiService = {
  async generateTasks(prompt: string): Promise<ApiResponse<GeneratedTask[]>> {
    await mockDelay(700);
    void prompt;
    return { data: mockGeneratedTasks, error: null };
  },

  async askAssistant(message: string): Promise<ApiResponse<AIChatMessage>> {
    await mockDelay(600);
    return {
      data: {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Mocked AI response for: ${message}`,
        createdAt: new Date().toISOString(),
      },
      error: null,
    };
  },

  async getInitialMessages(): Promise<ApiResponse<AIChatMessage[]>> {
    await mockDelay(300);
    return { data: mockAIChatMessages, error: null };
  },
};
