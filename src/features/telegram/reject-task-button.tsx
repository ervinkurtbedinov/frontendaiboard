import { Button } from "@/components/ui";

type RejectTaskButtonProps = {
  onReject: () => Promise<void>;
};

export function RejectTaskButton({ onReject }: RejectTaskButtonProps): JSX.Element {
  return (
    <Button variant="outline" onClick={onReject}>
      Reject
    </Button>
  );
}
