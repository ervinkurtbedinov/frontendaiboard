import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BoardGrid } from "@/components/board";
import { CreateTaskModal, TaskDetailsPanel, TaskModal } from "@/components/tasks";
import { Button, ErrorState, Spinner } from "@/components/ui";
import { useBoardStore, useTaskStore } from "@/stores";
import type { Task } from "@/types";

export function BoardDetailsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { columns, boardTasks, isLoading, error, selectBoard, loadBoards } = useBoardStore();
  const { tasks, setTasks, createTask, selectedTask, selectTask } = useTaskStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  useEffect(() => {
    if (!id) return;
    void selectBoard(id);
  }, [id, selectBoard]);

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
    return <ErrorState description={error} onRetry={() => (id ? selectBoard(id) : loadBoards())} />;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Board Details</h2>
          <p className="text-sm text-muted-foreground">Drag-and-drop ready skeleton with mocked tasks.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create Task</Button>
      </div>
      <BoardGrid columns={columns} tasks={groupedTasks} onTaskClick={handleTaskClick} />
      <TaskDetailsPanel task={selectedTask} />
      <CreateTaskModal open={createOpen} onOpenChange={setCreateOpen} onSubmitTask={createTask} />
      <TaskModal task={selectedTask} open={taskModalOpen} onOpenChange={setTaskModalOpen} />
    </section>
  );
}
