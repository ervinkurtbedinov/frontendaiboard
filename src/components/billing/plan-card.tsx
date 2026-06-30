import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui";
import { PLAN_FEATURES, PLAN_SUBTITLES } from "@/lib/constants/billing-plans";
import type { BillingPlan } from "@/types";

type PlanCardProps = {
  plan: BillingPlan;
  activePlan: BillingPlan;
  isLoading?: boolean;
  onUpgrade: (plan: Exclude<BillingPlan, "free">) => Promise<void>;
};

export function PlanCard({ plan, activePlan, isLoading = false, onUpgrade }: PlanCardProps): JSX.Element {
  const isActive = plan === activePlan;
  const isUpgradeablePlan = plan === "pro" || plan === "team";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="capitalize">{plan}</CardTitle>
          {isActive ? <Badge>Current</Badge> : null}
        </div>
        <CardDescription>{PLAN_SUBTITLES[plan]}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          {PLAN_FEATURES[plan].map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          variant={isActive ? "secondary" : "default"}
          disabled={!isUpgradeablePlan || isActive || isLoading}
          onClick={() => {
            if (isUpgradeablePlan) {
              void onUpgrade(plan);
            }
          }}
        >
          {isLoading ? "Redirecting..." : isActive ? "Active plan" : "Upgrade"}
        </Button>
      </CardFooter>
    </Card>
  );
}
