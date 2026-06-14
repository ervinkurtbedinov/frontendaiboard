import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { loginSchema } from "@/features/auth";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/stores";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage(): JSX.Element {
  const login = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = form.handleSubmit(async (values) => {
    await login(values);
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
      <Input placeholder="Email" {...form.register("email")} />
      {form.formState.errors.email?.message ? (
        <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
      ) : null}
      <Input placeholder="Password" type="password" {...form.register("password")} />
      {form.formState.errors.password?.message ? (
        <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Login"}
      </Button>
      <Button type="button" variant="outline" className="w-full" disabled={isLoading} onClick={() => void loginWithGoogle()}>
        Continue with Google
      </Button>
      <div className="text-right text-xs">
        <Link to="/forgot-password" className="text-muted-foreground underline">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
