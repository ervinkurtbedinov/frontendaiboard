import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Textarea } from "@/components/ui";
import type { TaskPriority, TaskStatus } from "@/types";

const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
});

type CreateTaskValues = z.infer<typeof createTaskSchema>;

type CreateTaskModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitTask: (payload: { title: string; description: string; status: TaskStatus; priority: TaskPriority }) => Promise<void>;
};

export function CreateTaskModal({ open, onOpenChange, onSubmitTask }: CreateTaskModalProps): JSX.Element {
  const form = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await onSubmitTask({
      ...values,
      status: "todo",
      priority: "medium",
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
          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
