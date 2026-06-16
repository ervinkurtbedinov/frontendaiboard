import { useMemo, useState } from "react";
import { Minimize2, Sparkles } from "lucide-react";
import { useMatch } from "react-router-dom";
import { PromptInput } from "@/components/chat/prompt-input";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useBoardStore, useChatStore, useTaskStore } from "@/stores";

export function LiveChatWidget(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationSummary, setCreationSummary] = useState<string | null>(null);

  const boardMatch = useMatch("/boards/:id");
  const selectedBoardId = useBoardStore((state) => state.selectedBoardId);
  const { assignments, generateAssignments, clearAssignments, isLoading, error } = useChatStore();
  const createTask = useTaskStore((state) => state.createTask);

  const boardId = useMemo(() => boardMatch?.params.id ?? selectedBoardId ?? null, [boardMatch?.params.id, selectedBoardId]);
  const boardHint = boardId ? `Board: ${boardId}` : "Open a board to enable task planning";

  const handleGenerate = async (message: string): Promise<boolean> => {
    if (!boardId) {
      return false;
    }

    setCreationSummary(null);
    return generateAssignments(message, boardId);
  };

  const handleCreateTasks = async (): Promise<void> => {
    if (!boardId || assignments.length === 0) {
      return;
    }

    setIsCreating(true);
    let created = 0;
    let failed = 0;

    for (const assignment of assignments) {
      const createdSuccessfully = await createTask({
        boardId,
        title: assignment.task,
        description: "",
        status: "todo",
        priority: "medium",
        assigneeId: assignment.assignee.id,
      });

      if (createdSuccessfully) {
        created += 1;
      } else {
        failed += 1;
      }
    }

    setCreationSummary(`Created: ${created}, failed: ${failed}`);
    setIsCreating(false);
    if (failed === 0) {
      clearAssignments();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-3">
      {isOpen ? (
        <Card className="w-[calc(100vw-2rem)] border-border bg-card shadow-lg sm:w-96">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-semibold">AI Task Planner</CardTitle>
              <p className="text-xs text-muted-foreground">{boardHint}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Minimize live chat"
              onClick={() => setIsOpen(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="max-h-[320px] space-y-2 overflow-y-auto rounded-lg border border-border p-3">
              {assignments.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Send a prompt to generate assigned tasks for backend, frontend, QA and DevOps.
                </p>
              ) : (
                assignments.map((assignment) => (
                  <div key={assignment.task_id} className="rounded-md border border-border bg-muted/40 p-2">
                    <p className="text-sm font-medium">{assignment.task}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {assignment.assignee.full_name}
                      {assignment.assignee.team_role ? ` - ${assignment.assignee.team_role}` : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            {creationSummary ? <p className="text-xs text-foreground">{creationSummary}</p> : null}
            <PromptInput
              isLoading={isLoading}
              disabled={!boardId}
              placeholder={boardId ? "Опиши задачу для команды..." : "Откройте доску, чтобы отправить промпт"}
              onSend={handleGenerate}
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={assignments.length === 0 || isCreating || !boardId}
                onClick={() => void handleCreateTasks()}
              >
                {isCreating ? "Creating..." : "Создать задачи"}
              </Button>
              <Button variant="outline" disabled={assignments.length === 0 || isCreating} onClick={clearAssignments}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
      {!isOpen ? (
        <Button
          className="h-12 rounded-full border border-border px-4 shadow-lg"
          aria-label="Open live chat"
          onClick={() => setIsOpen(true)}
        >
          <Sparkles className="h-5 w-5" />
          <span className="ml-2 text-xs font-semibold">Planner</span>
        </Button>
      ) : null}
    </div>
  );
}
