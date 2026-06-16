import { NavLink, Outlet } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { LiveChatWidget } from "@/components/chat";
import { Button } from "@/components/ui";
import { useTheme } from "@/hooks";
import { useAuthStore } from "@/stores";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/boards", label: "Boards" },
  { to: "/ai-generator", label: "AI Generator" },
  { to: "/ai-chat", label: "AI Assistant" },
  { to: "/telegram", label: "Telegram Inbox" },
  { to: "/billing", label: "Billing" },
  { to: "/settings", label: "Settings" },
];

export function AppLayout(): JSX.Element {
  const { isDark, toggleTheme } = useTheme();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-lg font-semibold">AI Task Board</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <div className="container grid gap-6 py-6 md:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border border-border bg-card p-3">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "block rounded-md px-3 py-2 text-sm text-muted-foreground transition",
                    isActive ? "bg-primary/10 text-foreground" : "hover:bg-muted",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="space-y-6">
          <Outlet />
        </main>
      </div>
      <LiveChatWidget />
    </div>
  );
}
