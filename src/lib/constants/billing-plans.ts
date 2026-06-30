import type { BillingPlan } from "@/types";

export const PLAN_LIMITS = {
  free: { aiGenerationsLimit: 0, teamMembersLimit: 3 },
  pro: { aiGenerationsLimit: Infinity, teamMembersLimit: 10 },
  team: { aiGenerationsLimit: Infinity, teamMembersLimit: Infinity },
} as const;

export const PLAN_FEATURES: Record<BillingPlan, string[]> = {
  free: ["No AI requests", "Up to 3 team members"],
  pro: ["Unlimited AI generations", "Extended team collaboration"],
  team: [
    "Unlimited AI generations",
    "Unlimited team members",
    "Telegram notifications",
    "Create tasks via Telegram",
  ],
};

export const PLAN_SUBTITLES: Record<BillingPlan, string> = {
  free: "For small teams getting started",
  pro: "For growing teams with AI workflows",
  team: "For large teams at scale",
};
