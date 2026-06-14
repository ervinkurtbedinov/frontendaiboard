import type { BillingInfo } from "@/types";

export const mockBillingInfo: BillingInfo = {
  currentPlan: "free",
  renewalDate: "2026-07-01T00:00:00.000Z",
  usage: {
    aiGenerationsUsed: 2,
    aiGenerationsLimit: 3,
    teamMembers: 2,
  },
};
