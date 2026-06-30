import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { BoardMember, Task } from "@/types";

type TaskCardProps = {
  task: Task;
  members: BoardMember[];
  onClick?: () => void;
};

function memberDisplayName(member: BoardMember): string {
  return member.fullName.trim() || member.email;
}

export function TaskCard({ task, members, onClick }: TaskCardProps): JSX.Element {
  const assigneeIds = task.assigneeIds?.length ? task.assigneeIds : task.assigneeId ? [task.assigneeId] : [];
  const assigneeNames = assigneeIds
    .map((assigneeId) => members.find((member) => member.id === assigneeId))
    .filter((member): member is BoardMember => Boolean(member))
    .map(memberDisplayName);

  return (
    <Card className="cursor-pointer transition hover:border-primary/50" onClick={onClick}>
      <CardHeader className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{task.title}</CardTitle>
          <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>{task.priority}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 p-4 pt-0 text-xs text-muted-foreground">
        <p className="line-clamp-1">{assigneeNames.length ? assigneeNames.join(", ") : "Unassigned"}</p>
        <p>{new Date(task.createdAt).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  );
}
