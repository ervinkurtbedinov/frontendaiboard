import { mockDelay } from "@/lib/mock-delay";
import { mockBoardColumns, mockBoards } from "@/lib/mocks";
import type { ApiResponse, Board, BoardColumn } from "@/types";

export const boardsService = {
  async getBoards(): Promise<ApiResponse<Board[]>> {
    await mockDelay();
    return { data: mockBoards, error: null };
  },

  async getBoardById(boardId: string): Promise<ApiResponse<Board | null>> {
    await mockDelay();
    const board = mockBoards.find((item) => item.id === boardId) ?? null;
    return { data: board, error: null };
  },

  async getBoardColumns(): Promise<ApiResponse<BoardColumn[]>> {
    await mockDelay();
    return { data: mockBoardColumns, error: null };
  },
};
