export type BillingPlan = "free" | "pro" | "team";

export type UsageStats = {
  aiGenerationsUsed: number;
  aiGenerationsLimit: number;
  teamMembers: number;
  teamMembersLimit: number;
};

export type BillingInfo = {
  currentPlan: BillingPlan;
  renewalDate: string;
  usage: UsageStats;
  recentPayments?: PaymentRecord[];
};

export type PaymentRecord = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  plan: BillingPlan;
  createdAt: string;
};
