import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps): JSX.Element {
  return (
    <div className={cn("max-w-[80%] rounded-lg px-4 py-2 text-sm", message.role === "assistant" ? "bg-muted" : "ml-auto bg-primary text-primary-foreground")}>
      {message.text}
    </div>
  );
}
