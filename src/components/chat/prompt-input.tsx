import { useState } from "react";
import { Button, Input } from "@/components/ui";

type PromptInputProps = {
  isLoading?: boolean;
  onSend: (message: string) => Promise<void>;
};

export function PromptInput({ isLoading, onSend }: PromptInputProps): JSX.Element {
  const [message, setMessage] = useState("");

  const submit = async (): Promise<void> => {
    if (!message.trim()) return;
    await onSend(message);
    setMessage("");
  };

  return (
    <div className="flex gap-2">
      <Input value={message} placeholder="Ask AI assistant..." onChange={(event) => setMessage(event.target.value)} />
      <Button onClick={submit} disabled={isLoading}>
        {isLoading ? "Sending..." : "Send"}
      </Button>
    </div>
  );
}
