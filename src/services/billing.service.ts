import { mockDelay } from "@/lib/mock-delay";
import { mockBillingInfo } from "@/lib/mocks";
import type { ApiResponse, BillingInfo, BillingPlan } from "@/types";

export const billingService = {
  async getBillingInfo(): Promise<ApiResponse<BillingInfo>> {
    await mockDelay();
    return { data: mockBillingInfo, error: null };
  },

  async upgradePlan(plan: Exclude<BillingPlan, "free">): Promise<ApiResponse<BillingInfo>> {
    await mockDelay();
    return {
      data: {
        ...mockBillingInfo,
        currentPlan: plan,
      },
      error: null,
    };
  },
};
