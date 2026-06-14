import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input } from "@/components/ui";
import { usersService } from "@/services";
import type { User } from "@/types";

const createBoardSchema = z.object({
  name: z.string().min(3, "Board name should be at least 3 characters."),
  memberIds: z.array(z.string()).min(1, "Choose at least one participant."),
});

type CreateBoardValues = z.infer<typeof createBoardSchema>;

type CreateBoardModalProps = {
  open: boolean;
  currentUser: User | null;
  onOpenChange: (open: boolean) => void;
  onSubmitBoard: (payload: CreateBoardValues) => Promise<void>;
};

export function CreateBoardModal({
  open,
  currentUser,
  onOpenChange,
  onSubmitBoard,
}: CreateBoardModalProps): JSX.Element {
  const [participantEmail, setParticipantEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>(currentUser ? [currentUser] : []);

  const form = useForm<CreateBoardValues>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
      memberIds: currentUser ? [currentUser.id] : [],
    },
  });

  useEffect(() => {
    if (!currentUser) {
      setSelectedUsers([]);
      form.reset({
        name: "",
        memberIds: [],
      });
      return;
    }

    setSelectedUsers([currentUser]);
    setSearchError(null);
    setParticipantEmail("");

    if (!open) {
      form.reset({
        name: "",
        memberIds: [currentUser.id],
      });
      return;
    }

    form.setValue("memberIds", [currentUser.id], { shouldValidate: true });
  }, [currentUser, form, open]);

  const selectedMembers = useMemo(
    () =>
      selectedUsers.map((user) => ({
        ...user,
        isCurrentUser: currentUser ? user.id === currentUser.id : false,
      })),
    [currentUser, selectedUsers]
  );

  const handleAddParticipant = async () => {
    if (!currentUser) {
      setSearchError("Log in again and try one more time.");
      return;
    }

    const normalizedEmail = participantEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setSearchError("Enter an email to search.");
      return;
    }

    if (selectedUsers.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      setSearchError("This participant is already added.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const response = await usersService.findUserByEmail(normalizedEmail);
    setIsSearching(false);

    if (response.error) {
      setSearchError(response.error);
      return;
    }

    if (!response.data) {
      setSearchError("User with this email is not registered.");
      return;
    }

    const nextUsers = [...selectedUsers, response.data];
    setSelectedUsers(nextUsers);
    form.setValue(
      "memberIds",
      nextUsers.map((user) => user.id),
      { shouldValidate: true }
    );
    setParticipantEmail("");
  };

  const handleRemoveParticipant = (memberId: string) => {
    if (!currentUser || memberId === currentUser.id) {
      return;
    }

    const nextUsers = selectedUsers.filter((user) => user.id !== memberId);
    setSelectedUsers(nextUsers);
    form.setValue(
      "memberIds",
      nextUsers.map((user) => user.id),
      { shouldValidate: true }
    );
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!currentUser) {
      setSearchError("Log in again and try one more time.");
      return;
    }

    await onSubmitBoard(values);
    onOpenChange(false);
    setSelectedUsers([currentUser]);
    setParticipantEmail("");
    setSearchError(null);
    form.reset({
      name: "",
      memberIds: [currentUser.id],
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
            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter participant email"
                value={participantEmail}
                onChange={(event) => setParticipantEmail(event.target.value)}
              />
              <Button type="button" variant="secondary" onClick={handleAddParticipant} disabled={isSearching}>
                {isSearching ? "Searching..." : "Add"}
              </Button>
            </div>
            {searchError ? <p className="text-sm text-destructive">{searchError}</p> : null}
            <div className="max-h-44 space-y-2 overflow-auto rounded-md border border-border p-3">
              {selectedMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-sm px-2 py-1">
                  <span className="text-sm">
                    {member.fullName} <span className="text-muted-foreground">({member.email})</span>
                    {member.teamRole ? <span className="ml-2 text-xs text-muted-foreground">{member.teamRole}</span> : null}
                    {member.isCurrentUser ? <span className="ml-2 text-xs text-primary">You</span> : null}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => handleRemoveParticipant(member.id)}
                    disabled={member.isCurrentUser}
                  >
                    Remove
                  </Button>
                </div>
              ))}
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
