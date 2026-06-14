import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { GeneratedTask } from "@/types";

type GeneratedTaskCardProps = {
  task: GeneratedTask;
};

export function GeneratedTaskCard({ task }: GeneratedTaskCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm">{task.title}</CardTitle>
          <Badge variant="secondary">{task.priority}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 p-4 pt-0 text-sm">
        <p>{task.description}</p>
        <p className="text-xs text-muted-foreground">
          Status: {task.status.replace("_", " ")} {task.assigneeName ? `• Assignee: ${task.assigneeName}` : ""}
        </p>
      </CardContent>
    </Card>
  );
}
