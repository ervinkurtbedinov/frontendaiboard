import type { AuthSession, User } from "@/types";

export const mockUser: User = {
  id: "user_1",
  email: "ervin@example.com",
  fullName: "Ervin",
  isPremium: false,
};

export const mockSession: AuthSession = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  user: mockUser,
};
