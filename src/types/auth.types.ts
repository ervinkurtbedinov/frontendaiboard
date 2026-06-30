export type User = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isPremium: boolean;
  teamRole?: string;
  telegramUsername?: string;
  telegramChatId?: number;
  telegramNotificationsEnabled?: boolean;
  telegramLinkedAt?: string;
  telegramLinkToken?: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  role: string;
  password: string;
};

export type UpdateProfileSettingsInput = {
  userId: string;
  teamRole: string;
  telegramUsername: string;
};
