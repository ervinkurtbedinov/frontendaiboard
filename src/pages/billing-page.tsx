import { useEffect, useState } from "react";
import { PlanCard } from "@/components/billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, Spinner } from "@/components/ui";
import { billingService } from "@/services";
import type { BillingInfo, BillingPlan } from "@/types";

export function BillingPage(): JSX.Element {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoading(true);
      const response = await billingService.getBillingInfo();
      if (response.error) {
        setError(response.error);
        setIsLoading(false);
        return;
      }
      setBillingInfo(response.data);
      setIsLoading(false);
    };
    void load();
  }, []);

  const handleUpgrade = async (plan: Exclude<BillingPlan, "free">): Promise<void> => {
    const response = await billingService.upgradePlan(plan);
    if (response.error) {
      setError(response.error);
      return;
    }
    setBillingInfo(response.data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Loading billing...
      </div>
    );
  }

  if (error) {
    return <ErrorState description={error} />;
  }

  if (!billingInfo) {
    return <ErrorState description="Billing details not found." />;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Billing</h2>
        <p className="text-sm text-muted-foreground">Current plan, usage, and upgrade options (mocked).</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription className="capitalize">{billingInfo.currentPlan}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Usage: {billingInfo.usage.aiGenerationsUsed}/{billingInfo.usage.aiGenerationsLimit} AI generations
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {(["free", "pro", "team"] as const).map((plan) => (
          <PlanCard key={plan} plan={plan} activePlan={billingInfo.currentPlan} onUpgrade={handleUpgrade} />
        ))}
      </div>
    </section>
  );
}
