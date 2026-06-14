import type { ApiResponse, AuthSession, LoginInput, RegisterInput } from "@/types";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser, Session as SupabaseSession } from "@supabase/supabase-js";

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
  };
}

export function mapSupabaseSession(session: SupabaseSession): AuthSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: mapSupabaseUser(session.user),
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
    return { data: mapSupabaseSession(data.session), error: null };
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
    return { data: mapSupabaseSession(data.session), error: null };
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
