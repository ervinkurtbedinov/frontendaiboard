import { BoardColumn } from "@/components/board/board-column";
import type { BoardColumn as BoardColumnType, BoardMember, Task } from "@/types";

type BoardGridProps = {
  columns: BoardColumnType[];
  tasks: Task[];
  members: BoardMember[];
  onTaskClick: (task: Task) => void;
};

export function BoardGrid({ columns, tasks, members, onTaskClick }: BoardGridProps): JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {columns.map((column) => (
        <BoardColumn
          key={column.id}
          title={column.title}
          status={column.id}
          tasks={tasks.filter((task) => task.status === column.id)}
          members={members}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
}
