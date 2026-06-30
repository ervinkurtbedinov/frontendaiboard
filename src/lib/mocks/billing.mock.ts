import type { BillingInfo } from "@/types";

export const mockBillingInfo: BillingInfo = {
  currentPlan: "free",
  renewalDate: "2026-07-01T00:00:00.000Z",
  usage: {
    aiGenerationsUsed: 0,
    aiGenerationsLimit: 0,
    teamMembers: 2,
    teamMembersLimit: 3,
  },
};
