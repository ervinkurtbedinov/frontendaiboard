import { mockDelay } from "@/lib/mock-delay";
import { mockAIChatMessages, mockGeneratedTasks } from "@/lib/mocks";
import type { AIChatMessage, ApiResponse, GeneratedTask, TaskAssignment, TaskAssignmentRequest } from "@/types";

const taskAssignmentApiUrl = import.meta.env.VITE_TASK_ASSIGNMENT_API_URL ?? "https://backbackend.ervin-kurtbedinov.workers.dev/chat";

function extractAssignments(payload: unknown): TaskAssignment[] {
  if (!Array.isArray(payload) || payload.length === 0) {
    return [];
  }

  const firstItem = payload[0];
  if (typeof firstItem !== "object" || firstItem === null || !("assignments" in firstItem)) {
    return [];
  }

  const assignments = (firstItem as { assignments?: unknown }).assignments;
  return Array.isArray(assignments) ? (assignments as TaskAssignment[]) : [];
}

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

  async generateTaskAssignments(message: string, boardId: string): Promise<ApiResponse<TaskAssignment[]>> {
    try {
      const requestBody: TaskAssignmentRequest = {
        message,
        board_id: boardId,
      };

      const response = await fetch(taskAssignmentApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        return { data: null, error: `Task planner request failed (${response.status})` };
      }

      const payload: unknown = await response.json();
      const assignments = extractAssignments(payload);
      if (assignments.length === 0) {
        return { data: null, error: "Task planner returned empty assignments." };
      }

      return { data: assignments, error: null };
    } catch {
      return { data: null, error: "Failed to reach task planner endpoint." };
    }
  },

  async getInitialMessages(): Promise<ApiResponse<AIChatMessage[]>> {
    await mockDelay(300);
    return { data: mockAIChatMessages, error: null };
  },
};
