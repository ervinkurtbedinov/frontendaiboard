import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ChatThread } from "@/types";

type ChatSidebarProps = {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
};

export function ChatSidebar({ threads, activeThreadId, onSelectThread }: ChatSidebarProps): JSX.Element {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {threads.map((thread) => (
          <button
            key={thread.id}
            type="button"
            className={cn(
              "w-full rounded-md border px-3 py-2 text-left text-sm",
              activeThreadId === thread.id ? "border-primary bg-primary/10" : "border-border",
            )}
            onClick={() => onSelectThread(thread.id)}
          >
            {thread.title}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
