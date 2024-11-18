import type { User } from '@libs/types/rust';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import type { BeatmapId } from './influence';

export type UserBioResponse = {
  id: number;
  username: string;
  avatar_url: string;
  have_ranked_map: boolean;
  bio: string;
  beatmaps: BeatmapId[];
  mention_count: number;
};

export function logoutRequest() {
  return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/oauth/logout`, {
    withCredentials: true,
  });
}

export function getCurrentUser() {
  return axios
    .get<User>(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      withCredentials: true,
    })
    .then((res) => res.data);
}

export const useCurrentUser = () =>
  useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: 1,
  });

export function getUserBio(userId: string | number) {
  return axios
    .get<User>(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
      withCredentials: true,
    })
    .then((res) => res.data);
}

export const useUserBio = (userId?: string | number) => {
  const { data: currentUser, isLoading } = useCurrentUser();

  const id = userId || currentUser?.id || 0;

  return useQuery({
    queryKey: ['userBio', id?.toString()],
    enabled: !isLoading && !!id && !!currentUser,
    queryFn: () => {
      if (!id) return currentUser;

      return getUserBio(id);
    },
  });
};

export function updateUserDescription(bio: string) {
  return axios.post<unknown>(
    `${process.env.NEXT_PUBLIC_API_URL}/users/bio`,
    { bio },
    {
      withCredentials: true,
    },
  );
}

export const useDescriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserDescription,
    onSuccess: (_, variables: string) => {
      queryClient.setQueryData<UserBioResponse>(['currentUser'], (old) => {
        if (!old) return old;
        return {
          ...old,
          bio: variables,
        };
      });
    },
  });
};
