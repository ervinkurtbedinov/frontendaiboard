import { create } from "zustand";
import { tasksService } from "@/services";
import type { Task, TaskStatus } from "@/types";

type TaskStore = {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  selectTask: (task: Task | null) => void;
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  moveTask: (taskId: string, status: TaskStatus) => Promise<void>;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
  setTasks(tasks) {
    set({ tasks });
  },
  selectTask(task) {
    set({ selectedTask: task });
  },
  async createTask(task) {
    set({ isLoading: true, error: null });
    const response = await tasksService.createTask(task);
    if (response.error) {
      set({ error: response.error, isLoading: false });
      return;
    }
    if (!response.data) {
      set({ error: "Empty created task response", isLoading: false });
      return;
    }
    set({ tasks: [response.data, ...get().tasks], isLoading: false });
  },
  async moveTask(taskId, status) {
    set({ isLoading: true, error: null });
    const response = await tasksService.updateTaskStatus(taskId, status);
    if (response.error) {
      set({ error: response.error, isLoading: false });
      return;
    }
    if (!response.data) {
      set({ error: "Empty task update response", isLoading: false });
      return;
    }
    const nextTasks = get().tasks.map((task) =>
      task.id === response.data.taskId ? { ...task, status: response.data.status } : task,
    );
    set({ tasks: nextTasks, isLoading: false });
  },
}));
