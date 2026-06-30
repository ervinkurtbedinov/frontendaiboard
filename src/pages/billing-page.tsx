import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PlanCard } from "@/components/billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, ErrorState, Spinner } from "@/components/ui";
import { billingService } from "@/services";
import type { BillingInfo, BillingPlan } from "@/types";

function formatRenewalDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString();
}

function formatPaymentAmount(amountCents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

export function BillingPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [upgradingPlan, setUpgradingPlan] = useState<Exclude<BillingPlan, "free"> | null>(null);

  const loadBillingInfo = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const response = await billingService.getBillingInfo();
    if (response.error) {
      setError(response.error);
      setBillingInfo(null);
      setIsLoading(false);
      return;
    }
    setError(null);
    setBillingInfo(response.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadBillingInfo();
  }, [loadBillingInfo]);

  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    if (checkoutStatus === "success") {
      setCheckoutMessage("Payment successful. Your subscription will update shortly.");
      void loadBillingInfo();
    } else if (checkoutStatus === "canceled") {
      setCheckoutMessage("Checkout was canceled.");
    }

    if (checkoutStatus) {
      searchParams.delete("checkout");
      setSearchParams(searchParams, { replace: true });
    }
  }, [loadBillingInfo, searchParams, setSearchParams]);

  const handleUpgrade = async (plan: Exclude<BillingPlan, "free">): Promise<void> => {
    setUpgradingPlan(plan);
    setError(null);
    const response = await billingService.createCheckoutSession(plan);
    if (response.error || !response.data) {
      setError(response.error ?? "Checkout URL was not returned");
      setUpgradingPlan(null);
      return;
    }

    window.location.href = response.data.checkoutUrl;
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Loading billing...
      </div>
    );
  }

  if (error && !billingInfo) {
    return <ErrorState description={error} />;
  }

  if (!billingInfo) {
    return <ErrorState description="Billing details not found." />;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Billing</h2>
        <p className="text-sm text-muted-foreground">Current plan, usage, and subscription upgrades via Stripe.</p>
      </div>

      {checkoutMessage ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {checkoutMessage}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription className="capitalize">{billingInfo.currentPlan}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>Renews on: {formatRenewalDate(billingInfo.renewalDate)}</p>
          <p>
            AI requests:{" "}
            {billingInfo.usage.aiGenerationsLimit === 0
              ? "not included"
              : billingInfo.usage.aiGenerationsLimit === Infinity
                ? "unlimited"
                : `${billingInfo.usage.aiGenerationsUsed}/${billingInfo.usage.aiGenerationsLimit}`}
          </p>
          <p>
            Team members:{" "}
            {billingInfo.usage.teamMembersLimit === Infinity
              ? `${billingInfo.usage.teamMembers}/unlimited`
              : `${billingInfo.usage.teamMembers}/${billingInfo.usage.teamMembersLimit}`}
          </p>
        </CardContent>
      </Card>

      {billingInfo.recentPayments && billingInfo.recentPayments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest Stripe charges linked to your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {billingInfo.recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <span className="capitalize">{payment.plan}</span>
                <span>{formatPaymentAmount(payment.amountCents, payment.currency)}</span>
                <span className="text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {(["free", "pro", "team"] as const).map((plan) => (
          <PlanCard
            key={plan}
            plan={plan}
            activePlan={billingInfo.currentPlan}
            isLoading={upgradingPlan === plan}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>
    </section>
  );
}
