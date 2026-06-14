import { supabase } from "@/lib";
import { mockBoardColumns } from "@/lib/mocks";
import type { ApiResponse, Board, BoardColumn, BoardMember, CreateBoardInput } from "@/types";

type BoardRow = {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

type BoardMemberRow = {
  user_id: string;
};

type BoardMemberRpcRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  team_role: string | null;
  avatar_url: string | null;
};

function mapBoardRow(board: BoardRow, members: BoardMemberRow[] = []): Board {
  const memberIds = Array.from(new Set([board.owner_id, ...members.map((member) => member.user_id)]));

  return {
    id: board.id,
    name: board.name,
    description: board.description,
    memberIds,
    createdAt: board.created_at,
    updatedAt: board.updated_at,
  };
}

function mapBoardMemberRow(member: BoardMemberRpcRow): BoardMember {
  return {
    id: member.id,
    email: member.email ?? "",
    fullName: member.full_name ?? member.email ?? "Unknown user",
    teamRole: member.team_role ?? undefined,
    avatarUrl: member.avatar_url ?? undefined,
  };
}

export const boardsService = {
  async getBoards(): Promise<ApiResponse<Board[]>> {
    const { data, error } = await supabase
      .from("boards")
      .select("id, name, description, owner_id, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    const mapped = (data ?? []).map((board) =>
      mapBoardRow({
        id: board.id,
        name: board.name,
        description: board.description,
        owner_id: board.owner_id,
        created_at: board.created_at,
        updated_at: board.updated_at,
      })
    );

    return { data: mapped, error: null };
  },

  async getBoardById(boardId: string): Promise<ApiResponse<Board | null>> {
    const { data, error } = await supabase
      .from("boards")
      .select("id, name, description, owner_id, created_at, updated_at")
      .eq("id", boardId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return {
      data: mapBoardRow({
        id: data.id,
        name: data.name,
        description: data.description,
        owner_id: data.owner_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }),
      error: null,
    };
  },

  async createBoard(input: CreateBoardInput): Promise<ApiResponse<Board>> {
    const currentUserResult = await supabase.auth.getUser();
    const currentUserId = currentUserResult.data.user?.id;

    if (!currentUserId) {
      return { data: null, error: "You must be logged in to create a board." };
    }

    const { data: insertedBoard, error: boardError } = await supabase
      .from("boards")
      .insert({
        name: input.name,
        description: "New board",
        owner_id: currentUserId,
      })
      .select("id, name, description, owner_id, created_at, updated_at")
      .single();

    if (boardError || !insertedBoard) {
      return { data: null, error: boardError?.message ?? "Failed to create board." };
    }

    const uniqueMemberIds = Array.from(new Set([...input.memberIds, currentUserId]));
    const membersToInsert = uniqueMemberIds.map((memberId) => ({
      board_id: insertedBoard.id,
      user_id: memberId,
    }));

    const { error: membersError } = await supabase.from("board_members").insert(membersToInsert);
    if (membersError) {
      await supabase.from("boards").delete().eq("id", insertedBoard.id);
      return { data: null, error: membersError.message };
    }

    return {
      data: mapBoardRow(
        {
          id: insertedBoard.id,
          name: insertedBoard.name,
          description: insertedBoard.description,
          owner_id: insertedBoard.owner_id,
          created_at: insertedBoard.created_at,
          updated_at: insertedBoard.updated_at,
        },
        uniqueMemberIds.map((memberId) => ({ user_id: memberId }))
      ),
      error: null,
    };
  },

  async getBoardMembers(boardId: string): Promise<ApiResponse<BoardMember[]>> {
    const { data, error } = await supabase.rpc("get_board_members", { p_board_id: boardId });
    if (error) {
      const functionMissing = error.message.toLowerCase().includes("could not find the function public.get_board_members");
      if (!functionMissing) {
        return { data: null, error: error.message };
      }

      const boardResponse = await this.getBoardById(boardId);
      if (boardResponse.error) {
        return { data: null, error: boardResponse.error };
      }
      if (!boardResponse.data) {
        return { data: [], error: null };
      }

      return {
        data: boardResponse.data.memberIds.map((memberId) => ({
          id: memberId,
          email: memberId,
          fullName: "Member",
        })),
        error: null,
      };
    }

    const mapped = ((data ?? []) as BoardMemberRpcRow[]).map(mapBoardMemberRow);
    return { data: mapped, error: null };
  },

  async getBoardColumns(): Promise<ApiResponse<BoardColumn[]>> {
    return { data: mockBoardColumns, error: null };
  },
};
