import { create } from "zustand";
import { boardsService, tasksService } from "@/services";
import type { Board, BoardColumn, BoardMember, CreateBoardInput, Task } from "@/types";

type BoardStore = {
  boards: Board[];
  columns: BoardColumn[];
  boardTasks: Task[];
  selectedBoardId: string | null;
  selectedBoard: Board | null;
  boardMembers: BoardMember[];
  isLoading: boolean;
  error: string | null;
  loadBoards: () => Promise<void>;
  loadBoardDetails: (boardId: string) => Promise<void>;
  selectBoard: (boardId: string) => Promise<void>;
  createBoard: (input: CreateBoardInput) => Promise<void>;
};

export const useBoardStore = create<BoardStore>((set) => ({
  boards: [],
  columns: [],
  boardTasks: [],
  selectedBoardId: null,
  selectedBoard: null,
  boardMembers: [],
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
  async loadBoardDetails(boardId) {
    set({ isLoading: true, error: null, selectedBoardId: boardId });

    const [boardResponse, membersResponse] = await Promise.all([
      boardsService.getBoardById(boardId),
      boardsService.getBoardMembers(boardId),
    ]);

    if (boardResponse.error || membersResponse.error) {
      set({ error: boardResponse.error ?? membersResponse.error, isLoading: false });
      return;
    }

    if (!boardResponse.data || !membersResponse.data) {
      set({ error: "Board was not found", isLoading: false });
      return;
    }

    const boardData = boardResponse.data;
    set((state) => ({
      boards: state.boards.some((board) => board.id === boardData.id)
        ? state.boards.map((board) => (board.id === boardData.id ? boardData : board))
        : [boardData, ...state.boards],
      selectedBoard: boardData,
      boardMembers: membersResponse.data,
      isLoading: false,
    }));
  },
  async selectBoard(boardId) {
    set((state) => ({
      isLoading: true,
      error: null,
      selectedBoardId: boardId,
      selectedBoard: state.selectedBoard?.id === boardId ? state.selectedBoard : null,
    }));
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
    set({ isLoading: true, error: null });
    const response = await boardsService.createBoard(input);
    if (response.error) {
      set({ isLoading: false, error: response.error });
      return;
    }
    if (!response.data) {
      set({ isLoading: false, error: "Empty board response" });
      return;
    }

    set((state) => ({
      boards: [response.data, ...state.boards],
      isLoading: false,
    }));
  },
}));
