import { PLAN_LIMITS } from "@/lib/constants/billing-plans";
import { supabase } from "@/lib/supabase";
import type { ApiResponse, BillingInfo, BillingPlan, PaymentRecord } from "@/types";

const billingApiUrl =
  import.meta.env.VITE_BILLING_API_URL ?? "https://backbackend.ervin-kurtbedinov.workers.dev";

type ProfileBillingRow = {
  billing_plan: BillingPlan | null;
  subscription_current_period_end: string | null;
};

type PaymentRow = {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  plan: BillingPlan | null;
  created_at: string;
};

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

async function countTeamMembers(userId: string): Promise<number> {
  const { data: ownedBoards, error: boardsError } = await supabase
    .from("boards")
    .select("id")
    .eq("owner_id", userId);

  if (boardsError || !ownedBoards || ownedBoards.length === 0) {
    return 1;
  }

  const boardIds = ownedBoards.map((board) => board.id);
  const { data: members, error: membersError } = await supabase
    .from("board_members")
    .select("user_id")
    .in("board_id", boardIds);

  if (membersError || !members) {
    return 1;
  }

  const uniqueMembers = new Set(members.map((member) => member.user_id));
  uniqueMembers.add(userId);
  return uniqueMembers.size;
}

function mapPaymentRow(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    amountCents: row.amount_cents,
    currency: row.currency,
    status: row.status,
    plan: row.plan ?? "free",
    createdAt: row.created_at,
  };
}

export const billingService = {
  async getBillingInfo(): Promise<ApiResponse<BillingInfo>> {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { data: null, error: "Not authenticated" };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("billing_plan, subscription_current_period_end")
      .eq("id", userId)
      .single<ProfileBillingRow>();

    if (profileError) {
      return { data: null, error: profileError.message };
    }

    const currentPlan = profile.billing_plan ?? "free";
    const limits = PLAN_LIMITS[currentPlan];
    const teamMembers = await countTeamMembers(userId);

    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("id, amount_cents, currency, status, plan, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (paymentsError) {
      return { data: null, error: paymentsError.message };
    }

    return {
      data: {
        currentPlan,
        renewalDate: profile.subscription_current_period_end ?? new Date().toISOString(),
        usage: {
          aiGenerationsUsed: 0,
          aiGenerationsLimit: limits.aiGenerationsLimit,
          teamMembers,
          teamMembersLimit: limits.teamMembersLimit,
        },
        recentPayments: (payments ?? []).map(mapPaymentRow),
      },
      error: null,
    };
  },

  async createCheckoutSession(plan: Exclude<BillingPlan, "free">): Promise<ApiResponse<{ checkoutUrl: string }>> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (sessionError || !accessToken) {
      return { data: null, error: "Not authenticated" };
    }

    try {
      const response = await fetch(`${billingApiUrl}/billing/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ plan }),
      });

      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok) {
        return { data: null, error: payload.error ?? `Checkout request failed (${response.status})` };
      }

      if (!payload.checkoutUrl) {
        return { data: null, error: "Checkout URL was not returned" };
      }

      return { data: { checkoutUrl: payload.checkoutUrl }, error: null };
    } catch {
      return { data: null, error: "Failed to reach billing API" };
    }
  },
};
