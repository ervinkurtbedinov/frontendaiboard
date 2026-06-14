export type BillingPlan = "free" | "pro" | "team";

export type UsageStats = {
  aiGenerationsUsed: number;
  aiGenerationsLimit: number;
  teamMembers: number;
};

export type BillingInfo = {
  currentPlan: BillingPlan;
  renewalDate: string;
  usage: UsageStats;
};
