import { TaskCard } from "@/components/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { Task, TaskStatus } from "@/types";

type BoardColumnProps = {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
};

export function BoardColumn({ title, status, tasks, onTaskClick }: BoardColumnProps): JSX.Element {
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
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
      </CardContent>
    </Card>
  );
}
