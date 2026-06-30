import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/features/auth";
import { authService } from "@/services";
import { Button, Input } from "@/components/ui";
import type { z } from "zod";

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage(): JSX.Element {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await authService.forgotPassword(values.email);
    form.reset();
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input placeholder="Email" {...form.register("email")} />
      {form.formState.errors.email?.message ? (
        <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
      ) : null}
      <Button type="submit" className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
