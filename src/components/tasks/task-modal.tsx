import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input } from "@/components/ui";
import type { BoardMember, Task, TaskPriority } from "@/types";

type TaskModalProps = {
  task: Task | null;
  members: BoardMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (taskId: string, patch: Partial<Pick<Task, "title" | "priority">>) => void;
  onAddAssignee: (taskId: string, assigneeId: string) => void;
  onRemoveAssignee: (taskId: string, assigneeId: string) => void;
  onDeleteTask: (taskId: string) => void;
};

function memberDisplayName(member: BoardMember): string {
  return member.fullName.trim() || member.email;
}

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

export function TaskModal({
  task,
  members,
  open,
  onOpenChange,
  onUpdateTask,
  onAddAssignee,
  onRemoveAssignee,
  onDeleteTask,
}: TaskModalProps): JSX.Element {
  const assigneeIds = task?.assigneeIds?.length ? task.assigneeIds : task?.assigneeId ? [task.assigneeId] : [];
  const availableMembers = members.filter((member) => !assigneeIds.includes(member.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task?.title ?? "Task details"}</DialogTitle>
          <DialogDescription>{task?.description ?? "No task selected yet."}</DialogDescription>
        </DialogHeader>
        {task ? (
          <div className="space-y-4">
            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Title</span>
              <Input
                value={task.title}
                onChange={(event) => {
                  onUpdateTask(task.id, { title: event.target.value });
                }}
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Priority</span>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={task.priority}
                onChange={(event) => {
                  onUpdateTask(task.id, { priority: event.target.value as TaskPriority });
                }}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Assignees</p>
              <div className="flex flex-wrap gap-2">
                {assigneeIds.length ? (
                  assigneeIds.map((assigneeId) => {
                    const member = members.find((item) => item.id === assigneeId);
                    if (!member) {
                      return null;
                    }

                    return (
                      <button
                        key={assigneeId}
                        type="button"
                        onClick={() => onRemoveAssignee(task.id, assigneeId)}
                        className="rounded-full border border-border px-2 py-1 text-xs hover:bg-muted"
                        title="Remove assignee"
                      >
                        {memberDisplayName(member)} ×
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground">No assignees yet.</p>
                )}
              </div>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value=""
                onChange={(event) => {
                  if (!event.target.value) {
                    return;
                  }
                  onAddAssignee(task.id, event.target.value);
                }}
              >
                <option value="">Add assignee</option>
                {availableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {memberDisplayName(member)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <Button
                variant="destructive"
                type="button"
                onClick={() => {
                  onDeleteTask(task.id);
                  onOpenChange(false);
                }}
              >
                Delete task
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
