import { create } from "zustand";
import { authService } from "@/services";
import { supabase } from "@/lib";
import type { AuthSession, LoginInput, RegisterInput, User } from "@/types";
import type { AuthChangeEvent, Subscription } from "@supabase/supabase-js";

type AuthStore = {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  loginWithGoogle: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  updateProfileSettings: (input: { teamRole: string; telegramUsername: string }) => Promise<boolean>;
  generateTelegramLinkToken: () => Promise<string | null>;
  syncProfileFromDatabase: () => Promise<void>;
  logout: () => Promise<void>;
};

let authSubscription: Subscription | null = null;
const SESSION_TIMEOUT_MS = 8_000;

function getAuthStateFromSession(session: AuthSession | null): Pick<AuthStore, "session" | "user" | "isAuthenticated"> {
  if (!session) {
    return {
      session: null,
      user: null,
      isAuthenticated: false,
    };
  }

  return {
    session,
    user: session.user,
    isAuthenticated: true,
  };
}

function shouldSyncAuthEvent(event: AuthChangeEvent): boolean {
  return (
    event === "INITIAL_SESSION" ||
    event === "SIGNED_IN" ||
    event === "SIGNED_OUT" ||
    event === "TOKEN_REFRESHED" ||
    event === "USER_UPDATED"
  );
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
  async initializeAuth() {
    if (!authSubscription) {
      const { data: listenerData } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!shouldSyncAuthEvent(event)) {
          return;
        }

        const nextSession = session ? await authService.hydrateSession(session) : null;
        set({
          ...getAuthStateFromSession(nextSession),
          isInitializing: false,
        });
      });
      authSubscription = listenerData.subscription;
    }

    try {
      set({ isInitializing: true, error: null });

      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error("Session initialization timed out."));
          }, SESSION_TIMEOUT_MS);
        }),
      ]);

      let { data, error } = sessionResult;

      // OAuth implicit flow returns tokens in URL hash; on slow environments parsing can lag a little.
      if (!data.session && window.location.hash.includes("access_token")) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const retrySession = await supabase.auth.getSession();
        data = retrySession.data;
        error = retrySession.error;
      }

      if (error) {
        set({
          ...getAuthStateFromSession(null),
          isInitializing: false,
          error: error.message,
        });
        return;
      }

      const mappedSession = data.session ? await authService.hydrateSession(data.session) : null;
      set({
        ...getAuthStateFromSession(mappedSession),
        isInitializing: false,
      });
    } catch {
      set({
        ...getAuthStateFromSession(null),
        isInitializing: false,
        error: "Failed to initialize authentication session.",
      });
    }
  },
  clearError() {
    if (!get().error) {
      return;
    }
    set({ error: null });
  },
  async loginWithGoogle() {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.loginWithGoogle();
      if (response.error) {
        set({ error: response.error, isLoading: false });
        return;
      }

      // OAuth flow redirects away from the app.
      set({ isLoading: false });
    } catch {
      set({ error: "Google sign-in failed. Please try again.", isLoading: false });
    }
  },
  async login(input) {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(input);
      if (response.error) {
        set({ error: response.error, isLoading: false });
        return;
      }
      if (!response.data) {
        set({ error: "Empty auth response", isLoading: false });
        return;
      }
      set({
        user: response.data.user,
        session: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ error: "Login failed. Please try again.", isLoading: false });
    }
  },
  async register(input) {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.register(input);
      if (response.error) {
        set({ error: response.error, isLoading: false });
        return;
      }
      if (!response.data) {
        set({ error: "Empty registration response", isLoading: false });
        return;
      }
      set({
        user: response.data.user,
        session: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ error: "Registration failed. Please try again.", isLoading: false });
    }
  },
  async updateProfileSettings(input) {
    const currentUser = get().user;
    if (!currentUser) {
      set({ error: "You must be logged in to update profile settings." });
      return false;
    }

    try {
      set({ isLoading: true, error: null });

      const response = await authService.updateProfileSettings({
        userId: currentUser.id,
        teamRole: input.teamRole,
        telegramUsername: input.telegramUsername,
      });

      if (response.error || !response.data) {
        set({ isLoading: false, error: response.error ?? "Failed to update profile settings." });
        return false;
      }

      const nextUser: User = {
        ...currentUser,
        teamRole: response.data.teamRole,
        telegramUsername: response.data.telegramUsername,
      };

      const session = get().session;
      set({
        user: nextUser,
        session: session ? { ...session, user: nextUser } : null,
        isLoading: false,
      });

      return true;
    } catch {
      set({ error: "Failed to update profile settings.", isLoading: false });
      return false;
    }
  },
  async generateTelegramLinkToken() {
    const currentUser = get().user;
    if (!currentUser) {
      set({ error: "You must be logged in to connect Telegram." });
      return null;
    }

    try {
      set({ isLoading: true, error: null });

      const response = await authService.generateTelegramLinkToken(currentUser.id);
      if (response.error || !response.data) {
        set({ isLoading: false, error: response.error ?? "Failed to generate Telegram link." });
        return null;
      }

      const nextUser: User = {
        ...currentUser,
        telegramLinkToken: response.data.telegramLinkToken,
      };

      const session = get().session;
      set({
        user: nextUser,
        session: session ? { ...session, user: nextUser } : null,
        isLoading: false,
      });

      return response.data.telegramLinkToken;
    } catch {
      set({ error: "Failed to generate Telegram link.", isLoading: false });
      return null;
    }
  },
  async syncProfileFromDatabase() {
    const currentSession = await supabase.auth.getSession();
    const supabaseSession = currentSession.data.session;
    if (!supabaseSession) {
      return;
    }

    try {
      const nextSession = await authService.hydrateSession(supabaseSession);
      set({
        user: nextSession.user,
        session: nextSession,
      });
    } catch {
      // Keep existing user snapshot if hydration fails.
    }
  },
  async logout() {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.logout();
      if (response.error) {
        set({ error: response.error, isLoading: false });
        return;
      }
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch {
      set({ error: "Logout failed. Please try again.", isLoading: false });
    }
  },
}));
