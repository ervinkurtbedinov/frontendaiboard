import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { useAuthStore } from "@/stores";

export function DashboardPage(): JSX.Element {
  const user = useAuthStore((state) => state.user);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of board activity and AI usage.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>{user?.fullName ?? "User"}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">This is a skeleton dashboard with mocked KPIs.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open tasks</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">18</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI generations</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">2 / 3</CardContent>
        </Card>
      </div>
    </section>
  );
}
