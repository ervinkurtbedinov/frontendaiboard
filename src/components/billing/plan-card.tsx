import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui";
import type { BillingPlan } from "@/types";

type PlanCardProps = {
  plan: BillingPlan;
  activePlan: BillingPlan;
  onUpgrade: (plan: Exclude<BillingPlan, "free">) => Promise<void>;
};

export function PlanCard({ plan, activePlan, onUpgrade }: PlanCardProps): JSX.Element {
  const isActive = plan === activePlan;
  const isUpgradeablePlan = plan === "pro" || plan === "team";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="capitalize">{plan}</CardTitle>
          {isActive ? <Badge>Current</Badge> : null}
        </div>
        <CardDescription>Mocked plan card for billing skeleton.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {plan === "free" ? "Up to 3 AI generations per month." : "Unlimited generations and team collaboration options."}
      </CardContent>
      <CardFooter>
        <Button
          variant={isActive ? "secondary" : "default"}
          disabled={!isUpgradeablePlan || isActive}
          onClick={() => {
            if (isUpgradeablePlan) {
              void onUpgrade(plan);
            }
          }}
        >
          {isActive ? "Active plan" : "Upgrade"}
        </Button>
      </CardFooter>
    </Card>
  );
}
