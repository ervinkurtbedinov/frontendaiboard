import { GeneratedTaskCard } from "@/components/ai/generated-task-card";
import { EmptyState } from "@/components/ui";
import type { GeneratedTask } from "@/types";

type TaskPreviewListProps = {
  tasks: GeneratedTask[];
};

export function TaskPreviewList({ tasks }: TaskPreviewListProps): JSX.Element {
  if (tasks.length === 0) {
    return <EmptyState title="No generated tasks" description="Submit a prompt to preview generated tasks." />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {tasks.map((task) => (
        <GeneratedTaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
