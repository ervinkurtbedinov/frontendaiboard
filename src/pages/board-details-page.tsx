import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BoardGrid } from "@/components/board";
import { CreateTaskModal, TaskDetailsPanel, TaskModal } from "@/components/tasks";
import { Button, ErrorState, Spinner } from "@/components/ui";
import { useBoardStore, useTaskStore } from "@/stores";
import type { BoardMember, Task } from "@/types";

function initialsFromMember(member: BoardMember): string {
  const name = member.fullName.trim();
  if (!name) {
    return member.email.slice(0, 2).toUpperCase();
  }
  const parts = name.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function memberDisplayName(member: BoardMember): string {
  return member.fullName.trim() || member.email;
}

export function BoardDetailsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { columns, boardTasks, selectedBoard, boardMembers, isLoading, error, selectBoard, loadBoards, loadBoardDetails } = useBoardStore();
  const { tasks, setTasks, createTask, selectedTask, selectTask } = useTaskStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  useEffect(() => {
    if (!id) return;
    void loadBoardDetails(id);
    void selectBoard(id);
  }, [id, loadBoardDetails, selectBoard]);

  useEffect(() => {
    setTasks(boardTasks);
  }, [boardTasks, setTasks]);

  const groupedTasks = useMemo(() => tasks, [tasks]);

  const handleTaskClick = (task: Task): void => {
    selectTask(task);
    setTaskModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Loading board...
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        description={error}
        onRetry={() => {
          if (!id) {
            void loadBoards();
            return;
          }
          void loadBoardDetails(id);
          void selectBoard(id);
        }}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{selectedBoard?.name ?? "Board Details"}</h2>
          <p className="text-sm text-muted-foreground">Drag-and-drop ready skeleton with mocked tasks.</p>
          <div className="flex flex-wrap items-center gap-2">
            {boardMembers.map((member) => (
              <div
                key={member.id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs"
                title={member.email}
              >
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={memberDisplayName(member)}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                    {initialsFromMember(member)}
                  </span>
                )}
                <span className="max-w-28 truncate">{memberDisplayName(member)}</span>
              </div>
            ))}
            <span className="text-xs text-muted-foreground">{boardMembers.length} member(s)</span>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create Task</Button>
      </div>
      <BoardGrid columns={columns} tasks={groupedTasks} onTaskClick={handleTaskClick} />
      <TaskDetailsPanel task={selectedTask} />
      <CreateTaskModal
        open={createOpen}
        members={boardMembers}
        onOpenChange={setCreateOpen}
        onSubmitTask={async (payload) => {
          if (!id) {
            return;
          }

          await createTask({
            boardId: id,
            title: payload.title,
            description: payload.description,
            status: payload.status,
            priority: payload.priority,
            assigneeId: payload.assigneeId,
          });
        }}
      />
      <TaskModal task={selectedTask} open={taskModalOpen} onOpenChange={setTaskModalOpen} />
    </section>
  );
}
