import { useState } from "react";
import { Button, Input } from "@/components/ui";

type PromptInputProps = {
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onSend: (message: string) => Promise<boolean | void>;
};

export function PromptInput({ isLoading, disabled, placeholder, onSend }: PromptInputProps): JSX.Element {
  const [message, setMessage] = useState("");

  const submit = async (): Promise<void> => {
    if (!message.trim()) return;
    const result = await onSend(message);
    if (result !== false) {
      setMessage("");
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={message}
        placeholder={placeholder ?? "Ask AI assistant..."}
        disabled={disabled}
        onChange={(event) => setMessage(event.target.value)}
      />
      <Button onClick={submit} disabled={isLoading || disabled}>
        {isLoading ? "Sending..." : "Send"}
      </Button>
    </div>
  );
}
