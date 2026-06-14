import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { Task } from "@/types";

type TaskDetailsPanelProps = {
  task: Task | null;
};

export function TaskDetailsPanel({ task }: TaskDetailsPanelProps): JSX.Element {
  if (!task) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task details</CardTitle>
          <CardDescription>Select a task to inspect details.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{task.title}</CardTitle>
          <Badge>{task.priority}</Badge>
        </div>
        <CardDescription>{task.status.replace("_", " ")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>{task.description}</p>
        <p className="text-muted-foreground">Created: {new Date(task.createdAt).toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
