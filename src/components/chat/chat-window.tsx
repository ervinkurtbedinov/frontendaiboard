import { MessageBubble } from "@/components/chat/message-bubble";
import type { ChatMessage } from "@/types";

type ChatWindowProps = {
  messages: ChatMessage[];
};

export function ChatWindow({ messages }: ChatWindowProps): JSX.Element {
  return (
    <div className="flex h-[520px] flex-col gap-3 overflow-y-auto rounded-lg border border-border p-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
