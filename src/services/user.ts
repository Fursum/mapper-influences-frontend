import { useCurrentUser } from "@hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { UserExtended } from "osu-web.js";

export type CurrentUserResponse = {
  id: number;
  username: string;
  avatar_url: string;
};

export function getCurrentUser() {
  return axios.get<CurrentUserResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
    { withCredentials: true }
  );
}

export function getFullUser(userId: string) {
  return axios.get<
    UserExtended & {
      nominated_beatmapset_count: number;
      ranked_and_approved_beatmapset_count: number;
      guest_beatmapset_count: number;
    }
  >(`${process.env.NEXT_PUBLIC_API_URL}/osu_api/user/${userId}`, {
    withCredentials: true,
  });
}

export const useFullUser = (userId: string | undefined) => {
  const { data: currentUser, isLoading } = useCurrentUser();

  return useQuery({
    queryKey: ["fullUser", userId],
    enabled: !isLoading,
    queryFn: () => {
      const id = userId || currentUser?.id.toString();

      if (!id) throw new Error("No user id provided and no current user found");

      return getFullUser(id).then((res) => {
        return res.data;
      });
    },
  });
};
