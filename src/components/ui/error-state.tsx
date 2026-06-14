import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ErrorStateProps = {
  title?: string;
  description: string;
  onRetry?: () => void;
};

export function ErrorState({ title = "Something went wrong", description, onRetry }: ErrorStateProps): JSX.Element {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20 text-destructive">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {onRetry ? (
        <CardContent>
          <Button variant="destructive" onClick={onRetry}>
            Retry
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
