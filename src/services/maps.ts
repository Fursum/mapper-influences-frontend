import { toast } from 'react-toastify';

import type { BeatmapSearch, User } from '@libs/types/rust';
import {
  type Updater,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';

import { useCurrentUser } from './user';

function getMapData(diffId: string | number) {
  return axios
    .get<BeatmapSearch>(
      `${process.env.NEXT_PUBLIC_API_URL}/search/map/${diffId}`,
      {
        withCredentials: true,
      },
    )
    .then((res) => {
      // biome-ignore lint/suspicious/noExplicitAny: <osu api might send a 200 with an error object>
      if ((res as any).data.error) throw new Error((res as any).data.error);
      return res.data;
    });
}

export const useMapData = (diffId?: string | number) =>
  useQuery({
    enabled: !!diffId,
    queryKey: ['map', diffId?.toString()],
    queryFn: () => getMapData(diffId || 0),
    retry: 0,
  });

export function addMapToSelf({ mapIds }: { mapIds: number[] }) {
  if (!mapIds.length) throw new Error('No map id provided');
  return axios.patch<User>(
    `${process.env.NEXT_PUBLIC_API_URL}/users/map`,
    { beatmaps: mapIds },
    {
      withCredentials: true,
    },
  );
}

// TODO: Pass in full map data instead of just id for optimistic updates
export const useAddMapToSelfMutation = () => {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMapToSelf,
    onSuccess: (res, variables) => {
      queryClient.setQueryData<User>(
        ['userBio', currentUser?.id.toString()],
        (old) => {
          if (res.data) return res.data;
          return old;
        },
      );
      queryClient.setQueryData<User>(['currentUser'], (old) => {
        if (res.data) return res.data;
        return old;
      });

      toast.success('New map added.');
    },
    onError: () => {
      queryClient.refetchQueries({ queryKey: ['currentUser'] });
      queryClient.refetchQueries({
        queryKey: ['userBio', currentUser?.id.toString()],
      });

      toast.error('Failed to add map');
    },
  });
};

export function deleteMapFromSelf(mapId: number | string) {
  return axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/map/${mapId}`, {
    withCredentials: true,
  });
}

export const useDeleteMapFromSelfMutation = () => {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMapFromSelf,
    onSuccess: (_, variables) => {
      const updater: Updater<User | undefined, User | undefined> = (old) => {
        if (!old) return old;
        return {
          ...old,
          beatmaps: old.beatmaps.filter((b) => b.id !== variables),
        };
      };

      queryClient.setQueryData<User>(
        ['userBio', currentUser?.id.toString()],
        updater,
      );
      queryClient.setQueryData<User>(['currentUser'], updater);

      toast.success('Map deleted.');
    },
    onError: () => {
      queryClient.refetchQueries({ queryKey: ['currentUser'] });
      queryClient.refetchQueries({
        queryKey: ['userBio', currentUser?.id.toString()],
      });

      toast.error('Failed to delete map');
    },
  });
};
