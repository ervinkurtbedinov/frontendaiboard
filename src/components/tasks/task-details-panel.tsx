import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { BoardMember, Task } from "@/types";

type TaskDetailsPanelProps = {
  task: Task | null;
  members: BoardMember[];
};

function memberDisplayName(member: BoardMember): string {
  return member.fullName.trim() || member.email;
}

export function TaskDetailsPanel({ task, members }: TaskDetailsPanelProps): JSX.Element {
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

  const assigneeIds = task.assigneeIds?.length ? task.assigneeIds : task.assigneeId ? [task.assigneeId] : [];
  const assigneeNames = assigneeIds
    .map((assigneeId) => members.find((member) => member.id === assigneeId))
    .filter((member): member is BoardMember => Boolean(member))
    .map(memberDisplayName);

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
        <p className="text-muted-foreground">Assignees: {assigneeNames.length ? assigneeNames.join(", ") : "Unassigned"}</p>
        <p className="text-muted-foreground">Created: {new Date(task.createdAt).toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
