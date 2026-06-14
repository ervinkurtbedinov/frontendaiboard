export type ChatThread = {
  id: string;
  title: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
};
