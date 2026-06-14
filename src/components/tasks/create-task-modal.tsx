import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Textarea } from "@/components/ui";
import type { BoardMember, TaskPriority, TaskStatus } from "@/types";

const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  assigneeId: z.string(),
});

type CreateTaskValues = z.infer<typeof createTaskSchema>;

type CreateTaskModalProps = {
  open: boolean;
  members: BoardMember[];
  onOpenChange: (open: boolean) => void;
  onSubmitTask: (payload: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId?: string;
  }) => Promise<void>;
};

export function CreateTaskModal({ open, members, onOpenChange, onSubmitTask }: CreateTaskModalProps): JSX.Element {
  const form = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      assigneeId: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await onSubmitTask({
      title: values.title,
      description: values.description,
      status: "todo",
      priority: "medium",
      assigneeId: values.assigneeId || undefined,
    });
    onOpenChange(false);
    form.reset();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Use this modal as placeholder for full task creation flow.</DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input placeholder="Task title" {...form.register("title")} />
          <Textarea placeholder="Task description" {...form.register("description")} />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            {...form.register("assigneeId")}
          >
            <option value="">Without assignee</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName || member.email}
              </option>
            ))}
          </select>
          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
