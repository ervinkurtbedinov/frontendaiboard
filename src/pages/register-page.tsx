import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/features/auth";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/stores";
import type { z } from "zod";

type RegisterValues = z.infer<typeof registerSchema>;
const IT_TEAM_ROLES = ["Frontend", "Backend", "QA", "DevOps", "Designer", "Product Manager", "Team Lead"] as const;

export function RegisterPage(): JSX.Element {
  const register = useAuthStore((state) => state.register);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", role: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = form.handleSubmit(async ({ confirmPassword, ...values }) => {
    void confirmPassword;
    await register(values);
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
      <Input placeholder="Full name" {...form.register("fullName")} />
      {form.formState.errors.fullName?.message ? (
        <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
      ) : null}
      <Input placeholder="Email" {...form.register("email")} />
      {form.formState.errors.email?.message ? (
        <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
      ) : null}
      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        defaultValue=""
        {...form.register("role")}
      >
        <option value="" disabled>
          Select your role
        </option>
        {IT_TEAM_ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      {form.formState.errors.role?.message ? (
        <p className="text-xs text-destructive">{form.formState.errors.role.message}</p>
      ) : null}
      <Input placeholder="Password" type="password" {...form.register("password")} />
      {form.formState.errors.password?.message ? (
        <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
      ) : null}
      <Input placeholder="Confirm password" type="password" {...form.register("confirmPassword")} />
      {form.formState.errors.confirmPassword?.message ? (
        <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Register"}
      </Button>
      <Button type="button" variant="outline" className="w-full" disabled={isLoading} onClick={() => void loginWithGoogle()}>
        Continue with Google
      </Button>
    </form>
  );
}
