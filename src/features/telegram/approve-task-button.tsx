import { Button } from "@/components/ui";

type ApproveTaskButtonProps = {
  onApprove: () => Promise<void>;
};

export function ApproveTaskButton({ onApprove }: ApproveTaskButtonProps): JSX.Element {
  return (
    <Button variant="default" onClick={onApprove}>
      Approve
    </Button>
  );
}
