"use client";
import { getAllUsers, getUserId, getUserObjectById } from "@/actions/user-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useUsers(id?: number) {
  const queryClient = useQueryClient();

  const users = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await getAllUsers();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const user = useQuery({
    queryKey: ["user", id],
    enabled: typeof id === "number",
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as ["user", number];
      const res = await getUserObjectById(id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const current_user = useQuery({
    queryKey: ["current_user"],
    queryFn: async () => {
      const res = await getUserId();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  return {
    // Get all users
    users: users.data,
    isUsersLoading: users.isLoading,
    getUsersError: users.isError,

    // Get current user
    currentUser: current_user.data,
    isCurrentUserLoading: current_user.isLoading,
    getCurrentUserError: current_user.isError,

    // Get user by id
    user: user.data,
    isUserLoading: user.isLoading,
    getUserError: user.isError,
  };
}
