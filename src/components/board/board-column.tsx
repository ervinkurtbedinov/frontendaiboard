import { TaskCard } from "@/components/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { BoardMember, Task, TaskStatus } from "@/types";

type BoardColumnProps = {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  members: BoardMember[];
  onTaskClick: (task: Task) => void;
};

export function BoardColumn({ title, status, tasks, members, onTaskClick }: BoardColumnProps): JSX.Element {
  return (
    <Card className="min-h-[300px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          {title} ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border border-dashed border-border p-2 text-xs text-muted-foreground">
          Drag-and-drop placeholder target: {status}
        </div>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} members={members} onClick={() => onTaskClick(task)} />
        ))}
      </CardContent>
    </Card>
  );
}
