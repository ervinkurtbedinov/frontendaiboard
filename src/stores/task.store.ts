import { create } from "zustand";
import { tasksService } from "@/services";
import type { Task, TaskStatus } from "@/types";

type TaskPatch = Partial<Pick<Task, "title" | "priority" | "assigneeIds">>;

type TaskStore = {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  selectTask: (task: Task | null) => void;
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTask: (taskId: string, patch: TaskPatch) => void;
  deleteTask: (taskId: string) => void;
  addTaskAssignee: (taskId: string, assigneeId: string) => void;
  removeTaskAssignee: (taskId: string, assigneeId: string) => void;
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
    const normalizedTask: Task = {
      ...response.data,
      assigneeIds: response.data.assigneeIds ?? (response.data.assigneeId ? [response.data.assigneeId] : []),
    };
    set({ tasks: [normalizedTask, ...get().tasks], isLoading: false });
  },
  updateTask(taskId, patch) {
    set((state) => {
      const nextTasks = state.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        return {
          ...task,
          ...patch,
          assigneeIds: patch.assigneeIds ?? task.assigneeIds ?? (task.assigneeId ? [task.assigneeId] : []),
          updatedAt: new Date().toISOString(),
        };
      });

      const nextSelectedTask =
        state.selectedTask?.id === taskId
          ? nextTasks.find((task) => task.id === taskId) ?? null
          : state.selectedTask;

      return { tasks: nextTasks, selectedTask: nextSelectedTask };
    });
  },
  deleteTask(taskId) {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
    }));
  },
  addTaskAssignee(taskId, assigneeId) {
    const targetTask = get().tasks.find((task) => task.id === taskId);
    if (!targetTask) {
      return;
    }
    const currentAssignees = targetTask.assigneeIds ?? (targetTask.assigneeId ? [targetTask.assigneeId] : []);
    if (currentAssignees.includes(assigneeId)) {
      return;
    }
    get().updateTask(taskId, { assigneeIds: [...currentAssignees, assigneeId] });
  },
  removeTaskAssignee(taskId, assigneeId) {
    const targetTask = get().tasks.find((task) => task.id === taskId);
    if (!targetTask) {
      return;
    }
    const currentAssignees = targetTask.assigneeIds ?? (targetTask.assigneeId ? [targetTask.assigneeId] : []);
    get().updateTask(taskId, { assigneeIds: currentAssignees.filter((id) => id !== assigneeId) });
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
