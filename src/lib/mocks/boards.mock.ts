import type { Board, BoardColumn } from "@/types";

export const mockBoardColumns: BoardColumn[] = [
  { id: "backlog", title: "Backlog", order: 0 },
  { id: "todo", title: "Todo", order: 1 },
  { id: "in_progress", title: "In Progress", order: 2 },
  { id: "review", title: "Review", order: 3 },
  { id: "done", title: "Done", order: 4 },
];

export const mockBoards: Board[] = [
  {
    id: "board_1",
    name: "AI Product Launch",
    description: "Cross-functional launch board for marketing and engineering.",
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-12T08:00:00.000Z",
  },
  {
    id: "board_2",
    name: "Mobile App Redesign",
    description: "UX and delivery board for the mobile experience refresh.",
    createdAt: "2026-05-23T08:00:00.000Z",
    updatedAt: "2026-06-09T08:00:00.000Z",
  },
];
