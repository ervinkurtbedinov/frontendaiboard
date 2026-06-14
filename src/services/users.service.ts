import { supabase } from "@/lib";
import type { ApiResponse, User } from "@/types";

type FoundUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  team_role: string | null;
};

function mapFoundUser(row: FoundUserRow): User {
  return {
    id: row.id,
    email: row.email ?? "",
    fullName: row.full_name ?? "Unknown user",
    isPremium: false,
    teamRole: row.team_role ?? undefined,
  };
}

export const usersService = {
  async findUserByEmail(email: string): Promise<ApiResponse<User | null>> {
    const { data, error } = await supabase.rpc("find_user_by_email", {
      search_email: email.trim(),
    });

    if (error) {
      return { data: null, error: error.message };
    }

    const row = Array.isArray(data) ? data[0] : null;
    if (!row) {
      return { data: null, error: null };
    }

    return { data: mapFoundUser(row), error: null };
  },
};
