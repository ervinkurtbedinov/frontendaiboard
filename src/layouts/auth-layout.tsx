import { Link, Outlet } from "react-router-dom";

export function AuthLayout(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Board AI</h1>
          <p className="text-sm text-muted-foreground">AI-powered task board skeleton</p>
        </div>
        <Outlet />
        <div className="text-center text-xs text-muted-foreground">
          <Link to="/login" className="underline">
            Login
          </Link>{" "}
          •{" "}
          <Link to="/register" className="underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
