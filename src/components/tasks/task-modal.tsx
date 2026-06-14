import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui";
import type { Task } from "@/types";

type TaskModalProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskModal({ task, open, onOpenChange }: TaskModalProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task?.title ?? "Task details"}</DialogTitle>
          <DialogDescription>{task?.description ?? "No task selected yet."}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
