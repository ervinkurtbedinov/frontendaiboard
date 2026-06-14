import { ChatSidebar, ChatWindow, PromptInput } from "@/components/chat";
import { useChatStore } from "@/stores";

export function AIAssistantPage(): JSX.Element {
  const { threads, activeThreadId, messages, setActiveThread, sendMessage, isLoading } = useChatStore();
  const activeMessages = messages.filter((message) => message.threadId === activeThreadId);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">ChatGPT-like UI with mocked responses.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <ChatSidebar threads={threads} activeThreadId={activeThreadId} onSelectThread={setActiveThread} />
        <div className="space-y-3">
          <ChatWindow messages={activeMessages} />
          <PromptInput isLoading={isLoading} onSend={sendMessage} />
        </div>
      </div>
    </section>
  );
}
