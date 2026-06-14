import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

export function SettingsPage(): JSX.Element {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage profile and workspace preferences.</p>
      </div>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update personal information and avatar.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Profile settings placeholder.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>Manage team members and roles.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Team management placeholder.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Control email and in-app notifications.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Notification settings placeholder.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect external tools and APIs.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Integration settings placeholder.</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
