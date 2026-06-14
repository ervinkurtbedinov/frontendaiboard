import type { User } from "@/types";

export const mockTeamMembers: User[] = [
  {
    id: "user_1",
    email: "ervin@example.com",
    fullName: "Ervin",
    isPremium: false,
    teamRole: "Frontend",
  },
  {
    id: "user_2",
    email: "diliara@example.com",
    fullName: "Diliara",
    isPremium: false,
    teamRole: "Designer",
  },
  {
    id: "user_3",
    email: "amir@example.com",
    fullName: "Amir",
    isPremium: true,
    teamRole: "Backend",
  },
];
