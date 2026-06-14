import { supabase } from "@/lib";
import type { ApiResponse, Task, TaskStatus } from "@/types";

type TaskRow = {
  id: string;
  board_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Task["priority"];
  assignee_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

function mapTaskRow(task: TaskRow): Task {
  return {
    id: task.id,
    boardId: task.board_id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assignee_id ?? undefined,
    createdBy: task.created_by ?? undefined,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
}

export const tasksService = {
  async getTasksByBoardId(boardId: string): Promise<ApiResponse<Task[]>> {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, board_id, title, description, status, priority, assignee_id, created_by, created_at, updated_at")
      .eq("board_id", boardId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data ?? []).map((task) => mapTaskRow(task as TaskRow)), error: null };
  },

  async createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Task>> {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        board_id: task.boardId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: task.assigneeId ?? null,
        created_by: task.createdBy ?? null,
      })
      .select("id, board_id, title, description, status, priority, assignee_id, created_by, created_at, updated_at")
      .single();

    if (error) {
      return { data: null, error: error.message };
    }
    if (!data) {
      return { data: null, error: "Failed to create task." };
    }

    return { data: mapTaskRow(data as TaskRow), error: null };
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<ApiResponse<{ taskId: string; status: TaskStatus }>> {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: { taskId, status }, error: null };
  },
};
