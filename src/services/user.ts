import { useCurrentUser } from '@hooks/useUser';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { UserExtended } from 'osu-web.js';

export type CurrentUserResponse = {
  id: number;
  username: string;
  avatar_url: string;
};

export function getCurrentUser() {
  return axios.get<CurrentUserResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
    { withCredentials: true },
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

export const useFullUser = (userId?: string) => {
  const { data: currentUser, isLoading } = useCurrentUser();

  const id = userId || currentUser?.id.toString();

  return useQuery({
    queryKey: ['fullUser', userId],
    enabled: !isLoading,
    queryFn: () => {
      if (!id) throw new Error('No user id provided and no current user found');

      return getFullUser(id).then((res) => {
        return res.data;
      });
    },
  });
};

type UserBioResponse = {
  id: number;
  username: string;
  avatar_url: string;
  bio: string;
};

export const getUserBio = (userId: string) => {
  return axios.get<UserBioResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
    { withCredentials: true },
  );
};

export const useUserBio = (userId?: string) => {
  const { data: currentUser, isLoading } = useCurrentUser();

  const id = userId || currentUser?.id.toString();

  return useQuery({
    queryKey: ['userBio', userId],
    enabled: !isLoading,
    queryFn: () => {
      if (!id) throw new Error('No user id provided and no current user found');

      return getUserBio(id).then((res) => res.data);
    },
  });
};

export const updateUserBio = (bio: string) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/users/bio`,
    { bio },
    { withCredentials: true },
  );
};

export const useUpdateUserBio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserBio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBio', undefined] });
    },
  });
};
