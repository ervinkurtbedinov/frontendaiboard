import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreateBoardModal } from "@/components/board";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { useAuthStore, useBoardStore } from "@/stores";

export function BoardsListPage(): JSX.Element {
  const [createOpen, setCreateOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const { boards, isLoading, error, loadBoards, createBoard } = useBoardStore();

  const canOpenCreateModal = useMemo(() => Boolean(currentUser), [currentUser]);

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  const handleCreateBoard = async (values: { name: string; memberIds: string[] }) => {
    await createBoard(values);
  };

  const createBoardButton = (
    <Button onClick={() => setCreateOpen(true)} type="button" disabled={!canOpenCreateModal}>
      Create Board
    </Button>
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    );
  }

  if (error) {
    return <ErrorState description={error} onRetry={() => void loadBoards()} />;
  }

  if (boards.length === 0) {
    return (
      <>
        <EmptyState
          title="No boards yet"
          description="Create your first board to start planning tasks."
          action={createBoardButton}
        />
        <CreateBoardModal
          open={createOpen && Boolean(currentUser)}
          onOpenChange={setCreateOpen}
          onSubmitBoard={handleCreateBoard}
          currentUser={currentUser}
        />
      </>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Boards</h2>
        {createBoardButton}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {boards.map((board) => (
          <Card key={board.id}>
            <CardHeader>
              <CardTitle>{board.name}</CardTitle>
              <CardDescription>{board.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={`/boards/${board.id}`} className="text-sm underline">
                Open board
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <CreateBoardModal
        open={createOpen && Boolean(currentUser)}
        onOpenChange={setCreateOpen}
        onSubmitBoard={handleCreateBoard}
        currentUser={currentUser}
      />
    </section>
  );
}
