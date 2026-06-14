import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input } from "@/components/ui";
import type { User } from "@/types";

const createBoardSchema = z.object({
  name: z.string().min(3, "Board name should be at least 3 characters."),
  memberIds: z.array(z.string()).min(1, "Choose at least one participant."),
});

type CreateBoardValues = z.infer<typeof createBoardSchema>;

type CreateBoardModalProps = {
  open: boolean;
  teamMembers: User[];
  initialMemberIds: string[];
  onOpenChange: (open: boolean) => void;
  onSubmitBoard: (payload: CreateBoardValues) => Promise<void>;
};

export function CreateBoardModal({
  open,
  teamMembers,
  initialMemberIds,
  onOpenChange,
  onSubmitBoard,
}: CreateBoardModalProps): JSX.Element {
  const form = useForm<CreateBoardValues>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
      memberIds: initialMemberIds,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        memberIds: initialMemberIds,
      });
      return;
    }

    form.setValue("memberIds", initialMemberIds, { shouldValidate: true });
  }, [form, initialMemberIds, open]);

  const selectedMembers = form.watch("memberIds");

  const onSubmit = form.handleSubmit(async (values) => {
    await onSubmitBoard(values);
    onOpenChange(false);
    form.reset({
      name: "",
      memberIds: initialMemberIds,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Board</DialogTitle>
          <DialogDescription>Name your board and choose teammates who will collaborate on it.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Input placeholder="Board name" {...form.register("name")} />
            {form.formState.errors.name ? <p className="text-sm text-destructive">{form.formState.errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Participants</p>
            <div className="max-h-44 space-y-2 overflow-auto rounded-md border border-border p-3">
              {teamMembers.map((member) => {
                const checked = selectedMembers?.includes(member.id) ?? false;

                return (
                  <label key={member.id} className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 hover:bg-accent/40">
                    <span className="text-sm">
                      {member.fullName}
                      {member.teamRole ? <span className="ml-2 text-xs text-muted-foreground">({member.teamRole})</span> : null}
                    </span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      checked={checked}
                      onChange={(event) => {
                        const current = form.getValues("memberIds");
                        const nextValues = event.target.checked
                          ? [...current, member.id]
                          : current.filter((id) => id !== member.id);

                        form.setValue("memberIds", nextValues, { shouldValidate: true });
                      }}
                    />
                  </label>
                );
              })}
            </div>
            {form.formState.errors.memberIds ? (
              <p className="text-sm text-destructive">{form.formState.errors.memberIds.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full">
            Create board
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
