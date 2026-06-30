import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { useAuthStore } from "@/stores";

export function SettingsPage(): JSX.Element {
  const user = useAuthStore((state) => state.user);
  const isSaving = useAuthStore((state) => state.isLoading);
  const updateProfileSettings = useAuthStore((state) => state.updateProfileSettings);
  const generateTelegramLinkToken = useAuthStore((state) => state.generateTelegramLinkToken);
  const syncProfileFromDatabase = useAuthStore((state) => state.syncProfileFromDatabase);

  const [teamRole, setTeamRole] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [telegramLinkError, setTelegramLinkError] = useState<string | null>(null);
  const [telegramLinkMessage, setTelegramLinkMessage] = useState<string | null>(null);

  const syncedTeamRole = user?.teamRole ?? "";
  const syncedTelegramUsername = user?.telegramUsername ?? "";
  const telegramBotUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined;
  const telegramStartLink =
    telegramBotUsername && user?.telegramLinkToken
      ? `https://t.me/${telegramBotUsername}?start=${encodeURIComponent(user.telegramLinkToken)}`
      : null;
  const isTelegramLinked = Boolean(user?.telegramNotificationsEnabled && user?.telegramChatId);

  useEffect(() => {
    setTeamRole(syncedTeamRole);
    setTelegramUsername(syncedTelegramUsername);
    setSavedMessageVisible(false);
    setSaveError(null);
    setTelegramLinkError(null);
  }, [syncedTeamRole, syncedTelegramUsername]);

  const hasUnsavedChanges = teamRole !== syncedTeamRole || telegramUsername !== syncedTelegramUsername;

  const saveProfileSettings = async (): Promise<void> => {
    setSavedMessageVisible(false);
    setSaveError(null);

    const success = await updateProfileSettings({
      teamRole,
      telegramUsername,
    });

    if (success) {
      setSavedMessageVisible(true);
      return;
    }

    setSaveError(useAuthStore.getState().error ?? "Failed to save profile settings.");
  };

  const resetProfileSettings = (): void => {
    setTeamRole(syncedTeamRole);
    setTelegramUsername(syncedTelegramUsername);
    setSavedMessageVisible(false);
    setSaveError(null);
  };

  const createTelegramLink = async (): Promise<void> => {
    setTelegramLinkError(null);
    setTelegramLinkMessage(null);

    const token = await generateTelegramLinkToken();
    if (!token) {
      setTelegramLinkError(useAuthStore.getState().error ?? "Failed to generate Telegram link.");
      return;
    }

    setTelegramLinkMessage("Deep link generated. Open it and press the Telegram button to enable notifications.");
  };

  const refreshTelegramStatus = async (): Promise<void> => {
    setTelegramLinkError(null);
    await syncProfileFromDatabase();
  };

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
              <CardDescription>Update profile fields stored in your Supabase account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium">User name</p>
                <Input value={user?.fullName ?? "User"} readOnly disabled />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Current team role</p>
                <Input
                  value={teamRole}
                  onChange={(event) => {
                    setTeamRole(event.target.value);
                    setSavedMessageVisible(false);
                    setSaveError(null);
                  }}
                  placeholder="Product Manager"
                />
                <p className="text-xs text-muted-foreground">Changes are saved to your profile in the database.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Telegram username</p>
                <Input
                  value={telegramUsername}
                  onChange={(event) => {
                    setTelegramUsername(event.target.value);
                    setSavedMessageVisible(false);
                    setSaveError(null);
                  }}
                  placeholder="@yourusername"
                />
                <p className="text-xs text-muted-foreground">
                  You can add or update your Telegram username. Allowed format: @name or name, 5-32 characters.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" onClick={() => void saveProfileSettings()} disabled={!hasUnsavedChanges || isSaving}>
                  Save
                </Button>
                <Button type="button" variant="outline" onClick={resetProfileSettings} disabled={!hasUnsavedChanges || isSaving}>
                  Reset
                </Button>
                {savedMessageVisible ? (
                  <p className="text-xs text-muted-foreground">Saved to database.</p>
                ) : null}
                {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
              </div>
              <div className="space-y-3 rounded-lg border border-border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Telegram notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Status: {isTelegramLinked ? "Connected" : "Not connected yet"}.
                  </p>
                </div>
                {!telegramBotUsername ? (
                  <p className="text-xs text-destructive">
                    VITE_TELEGRAM_BOT_USERNAME is missing. Add it to env to generate a Telegram deep link.
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => void createTelegramLink()} disabled={isSaving}>
                    Generate Telegram link
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => void refreshTelegramStatus()} disabled={isSaving}>
                    Refresh status
                  </Button>
                  {telegramStartLink ? (
                    <a className="text-xs text-primary underline underline-offset-4" href={telegramStartLink} target="_blank" rel="noreferrer">
                      Open Telegram start link
                    </a>
                  ) : null}
                </div>
                {telegramLinkMessage ? <p className="text-xs text-muted-foreground">{telegramLinkMessage}</p> : null}
                {telegramLinkError ? <p className="text-xs text-destructive">{telegramLinkError}</p> : null}
              </div>
            </CardContent>
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
