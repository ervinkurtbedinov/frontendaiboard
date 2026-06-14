import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { TelegramTask } from "@/types";

type TelegramTaskCardProps = {
  task: TelegramTask;
  actions: React.ReactNode;
};

export function TelegramTaskCard({ task, actions }: TelegramTaskCardProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{task.title}</CardTitle>
          <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>{task.priority}</Badge>
        </div>
        <CardDescription>{task.sourceChat}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{task.description}</p>
        <div className="flex gap-2">{actions}</div>
      </CardContent>
    </Card>
  );
}
