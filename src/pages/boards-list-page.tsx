import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { useBoardStore } from "@/stores";

export function BoardsListPage(): JSX.Element {
  const { boards, isLoading, error, loadBoards } = useBoardStore();

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

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
    return <EmptyState title="No boards yet" description="Create your first board to start planning tasks." />;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Boards</h2>
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
    </section>
  );
}
