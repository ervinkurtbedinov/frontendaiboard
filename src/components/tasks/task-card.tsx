import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { Task } from "@/types";

type TaskCardProps = {
  task: Task;
  onClick?: () => void;
};

export function TaskCard({ task, onClick }: TaskCardProps): JSX.Element {
  return (
    <Card className="cursor-pointer transition hover:border-primary/50" onClick={onClick}>
      <CardHeader className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{task.title}</CardTitle>
          <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>{task.priority}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</CardContent>
    </Card>
  );
}
