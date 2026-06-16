import { create } from "zustand";
import { aiService } from "@/services";
import { mockChatMessages, mockChatThreads } from "@/lib/mocks";
import type { ChatMessage, ChatThread, TaskAssignment } from "@/types";

type ChatStore = {
  threads: ChatThread[];
  activeThreadId: string | null;
  messages: ChatMessage[];
  assignments: TaskAssignment[];
  lastPrompt: string | null;
  isLoading: boolean;
  error: string | null;
  setActiveThread: (threadId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  generateAssignments: (message: string, boardId: string) => Promise<boolean>;
  clearAssignments: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  threads: mockChatThreads,
  activeThreadId: mockChatThreads[0]?.id ?? null,
  messages: mockChatMessages,
  assignments: [],
  lastPrompt: null,
  isLoading: false,
  error: null,
  setActiveThread(threadId) {
    set({ activeThreadId: threadId });
  },
  async sendMessage(content) {
    const activeThreadId = get().activeThreadId;
    if (!activeThreadId) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      threadId: activeThreadId,
      role: "user",
      text: content,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, userMessage], isLoading: true, error: null }));

    const response = await aiService.askAssistant(content);
    if (response.error) {
      set({ error: response.error, isLoading: false });
      return;
    }
    if (!response.data) {
      set({ error: "Empty assistant response", isLoading: false });
      return;
    }

    const assistantMessage: ChatMessage = {
      id: response.data.id,
      threadId: activeThreadId,
      role: "assistant",
      text: response.data.content,
      createdAt: response.data.createdAt,
    };
    set((state) => ({ messages: [...state.messages, assistantMessage], isLoading: false }));
  },
  async generateAssignments(message, boardId) {
    if (!boardId) {
      set({ error: "Open a board first to generate tasks.", isLoading: false });
      return false;
    }

    set({ isLoading: true, error: null });
    const response = await aiService.generateTaskAssignments(message, boardId);
    if (response.error || !response.data) {
      set({ error: response.error ?? "Failed to generate assignments.", isLoading: false });
      return false;
    }

    set({
      assignments: response.data,
      lastPrompt: message,
      isLoading: false,
    });
    return true;
  },
  clearAssignments() {
    set({ assignments: [], lastPrompt: null, error: null });
  },
}));
