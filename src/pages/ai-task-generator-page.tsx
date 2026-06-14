import { useState } from "react";
import { AIInput, TaskPreviewList } from "@/components/ai";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState } from "@/components/ui";
import { aiService } from "@/services";
import type { GeneratedTask } from "@/types";

export function AITaskGeneratorPage(): JSX.Element {
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (prompt: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    const response = await aiService.generateTasks(prompt);
    if (response.error) {
      setError(response.error);
      setIsLoading(false);
      return;
    }
    setTasks(response.data ?? []);
    setIsLoading(false);
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">AI Task Generator</h2>
        <p className="text-sm text-muted-foreground">Prompt-based task generation with mocked AI responses.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Describe your project</CardTitle>
          <CardDescription>Example: Build a landing page and assign tasks to team members.</CardDescription>
        </CardHeader>
        <CardContent>
          <AIInput isLoading={isLoading} onSubmitPrompt={handleGenerate} />
        </CardContent>
      </Card>
      {error ? <ErrorState description={error} onRetry={() => void handleGenerate("Retry prompt")} /> : null}
      <TaskPreviewList tasks={tasks} />
    </section>
  );
}
