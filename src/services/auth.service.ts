import type { ApiResponse, AuthSession, LoginInput, RegisterInput, UpdateProfileSettingsInput } from "@/types";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser, Session as SupabaseSession } from "@supabase/supabase-js";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  team_role: string | null;
  telegram_username: string | null;
  telegram_chat_id: number | null;
  telegram_notifications_enabled: boolean | null;
  telegram_linked_at: string | null;
  telegram_link_token: string | null;
  is_premium: boolean | null;
};

function mapSupabaseUser(user: SupabaseUser): AuthSession["user"] {
  const metadata = user.user_metadata && typeof user.user_metadata === "object" ? user.user_metadata : {};
  const fullNameFromMetadata =
    (typeof metadata.fullName === "string" && metadata.fullName) ||
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name);

  const avatarFromMetadata =
    (typeof metadata.avatar_url === "string" && metadata.avatar_url) ||
    (typeof metadata.picture === "string" && metadata.picture);

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: fullNameFromMetadata || (user.email?.split("@")[0] ?? "User"),
    avatarUrl: avatarFromMetadata || undefined,
    isPremium: Boolean(metadata.is_premium),
    teamRole:
      (typeof metadata.team_role === "string" && metadata.team_role) ||
      (typeof metadata.role === "string" && metadata.role) ||
      undefined,
    telegramUsername:
      (typeof metadata.telegram_username === "string" && metadata.telegram_username) ||
      (typeof metadata.telegramUsername === "string" && metadata.telegramUsername) ||
      undefined,
    telegramNotificationsEnabled:
      (typeof metadata.telegram_notifications_enabled === "boolean" && metadata.telegram_notifications_enabled) ||
      undefined,
  };
}

export function mapSupabaseSession(session: SupabaseSession): AuthSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: mapSupabaseUser(session.user),
  };
}

async function getProfileByUserId(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, team_role, telegram_username, telegram_chat_id, telegram_notifications_enabled, telegram_linked_at, telegram_link_token, is_premium",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

function mergeSessionWithProfile(session: SupabaseSession, profile: ProfileRow | null): AuthSession {
  const mapped = mapSupabaseSession(session);
  if (!profile) {
    return mapped;
  }

  return {
    ...mapped,
    user: {
      ...mapped.user,
      email: profile.email ?? mapped.user.email,
      fullName: profile.full_name ?? mapped.user.fullName,
      isPremium: profile.is_premium ?? mapped.user.isPremium,
      teamRole: profile.team_role ?? mapped.user.teamRole,
      telegramUsername: profile.telegram_username ?? mapped.user.telegramUsername,
      telegramChatId: profile.telegram_chat_id ?? mapped.user.telegramChatId,
      telegramNotificationsEnabled: profile.telegram_notifications_enabled ?? mapped.user.telegramNotificationsEnabled,
      telegramLinkedAt: profile.telegram_linked_at ?? mapped.user.telegramLinkedAt,
      telegramLinkToken: profile.telegram_link_token ?? mapped.user.telegramLinkToken,
    },
  };
}

export const authService = {
  async loginWithGoogle(): Promise<ApiResponse<{ ok: boolean }>> {
    const redirectTo = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: { ok: true }, error: null };
  },

  async login(input: LoginInput): Promise<ApiResponse<AuthSession>> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error) {
      return { data: null, error: error.message };
    }
    if (!data.session) {
      return { data: null, error: "No active session returned by Supabase." };
    }
    const profile = await getProfileByUserId(data.session.user.id);
    return { data: mergeSessionWithProfile(data.session, profile), error: null };
  },

  async register(input: RegisterInput): Promise<ApiResponse<AuthSession>> {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          fullName: input.fullName,
          full_name: input.fullName,
          role: input.role,
          team_role: input.role,
        },
      },
    });
    if (error) {
      return { data: null, error: error.message };
    }
    if (!data.session) {
      return {
        data: null,
        error:
          "Registration succeeded but no active session was returned. Disable Confirm Email in Supabase Auth settings for instant login, or confirm email and sign in manually.",
      };
    }
    const profile = await getProfileByUserId(data.session.user.id);
    return { data: mergeSessionWithProfile(data.session, profile), error: null };
  },

  async hydrateSession(session: SupabaseSession): Promise<AuthSession> {
    const profile = await getProfileByUserId(session.user.id);
    return mergeSessionWithProfile(session, profile);
  },

  async updateProfileSettings(input: UpdateProfileSettingsInput): Promise<ApiResponse<Pick<AuthSession["user"], "teamRole" | "telegramUsername">>> {
    const teamRole = input.teamRole.trim();
    const telegramUsername = input.telegramUsername.trim();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        team_role: teamRole.length > 0 ? teamRole : null,
        telegram_username: telegramUsername.length > 0 ? telegramUsername : null,
      })
      .eq("id", input.userId)
      .select("team_role, telegram_username")
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: {
        teamRole: data.team_role ?? undefined,
        telegramUsername: data.telegram_username ?? undefined,
      },
      error: null,
    };
  },

  async generateTelegramLinkToken(userId: string): Promise<ApiResponse<{ telegramLinkToken: string }>> {
    const nextToken = crypto.randomUUID().replaceAll("-", "");
    const { data, error } = await supabase
      .from("profiles")
      .update({
        telegram_link_token: nextToken,
      })
      .eq("id", userId)
      .select("telegram_link_token")
      .single();

    if (error || !data.telegram_link_token) {
      return { data: null, error: error?.message ?? "Failed to generate Telegram link token." };
    }

    return {
      data: { telegramLinkToken: data.telegram_link_token },
      error: null,
    };
  },

  async forgotPassword(email: string): Promise<ApiResponse<{ ok: boolean }>> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: { ok: true }, error: null };
  },

  async logout(): Promise<ApiResponse<{ ok: boolean }>> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: { ok: true }, error: null };
  },
};
