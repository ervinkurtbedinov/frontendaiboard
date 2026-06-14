import { create } from "zustand";
import { boardsService, tasksService } from "@/services";
import type { Board, BoardColumn, CreateBoardInput, Task } from "@/types";

type BoardStore = {
  boards: Board[];
  columns: BoardColumn[];
  boardTasks: Task[];
  selectedBoardId: string | null;
  isLoading: boolean;
  error: string | null;
  loadBoards: () => Promise<void>;
  selectBoard: (boardId: string) => Promise<void>;
  createBoard: (input: CreateBoardInput) => Promise<void>;
};

export const useBoardStore = create<BoardStore>((set) => ({
  boards: [],
  columns: [],
  boardTasks: [],
  selectedBoardId: null,
  isLoading: false,
  error: null,
  async loadBoards() {
    set({ isLoading: true, error: null });
    const [boardsResponse, columnsResponse] = await Promise.all([boardsService.getBoards(), boardsService.getBoardColumns()]);
    if (boardsResponse.error || columnsResponse.error) {
      set({ error: boardsResponse.error ?? columnsResponse.error, isLoading: false });
      return;
    }
    if (!boardsResponse.data || !columnsResponse.data) {
      set({ error: "Empty board response", isLoading: false });
      return;
    }
    set({
      boards: boardsResponse.data,
      columns: columnsResponse.data,
      isLoading: false,
    });
  },
  async selectBoard(boardId) {
    set({ isLoading: true, error: null, selectedBoardId: boardId });
    const tasksResponse = await tasksService.getTasksByBoardId(boardId);
    if (tasksResponse.error) {
      set({ error: tasksResponse.error, isLoading: false });
      return;
    }
    if (!tasksResponse.data) {
      set({ error: "Empty task response", isLoading: false });
      return;
    }
    set({
      boardTasks: tasksResponse.data,
      isLoading: false,
    });
  },
  async createBoard(input) {
    const timestamp = new Date().toISOString();
    const newBoard: Board = {
      id: crypto.randomUUID(),
      name: input.name,
      description: "New board",
      memberIds: input.memberIds,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    set((state) => ({
      boards: [newBoard, ...state.boards],
    }));
  },
}));
