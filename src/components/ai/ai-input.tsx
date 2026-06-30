import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Textarea } from "@/components/ui";

const promptSchema = z.object({
  prompt: z.string().min(10, "Describe project requirements in more detail."),
});

type PromptValues = z.infer<typeof promptSchema>;

type AIInputProps = {
  isLoading?: boolean;
  onSubmitPrompt: (prompt: string) => Promise<void>;
};

export function AIInput({ isLoading, onSubmitPrompt }: AIInputProps): JSX.Element {
  const form = useForm<PromptValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: { prompt: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await onSubmitPrompt(values.prompt);
  });

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <Textarea placeholder="Describe your project and request structured tasks..." {...form.register("prompt")} />
      {form.formState.errors.prompt?.message ? (
        <p className="text-xs text-destructive">{form.formState.errors.prompt.message}</p>
      ) : null}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Tasks"}
      </Button>
    </form>
  );
}
