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

function getMapData({ id, isSet }: { isSet?: boolean; id: string | number }) {
  return axios
    .get<BeatmapSearch>(
      `${process.env.NEXT_PUBLIC_API_URL}/osu_api/beatmap/${id}?type=${isSet ? 'beatmapset' : 'beatmap'}`,
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

export const useMapData = (mapId?: string | number, type?: 'set' | 'diff') =>
  useQuery({
    enabled: !!mapId,
    queryKey: [type, mapId?.toString()],
    queryFn: () => getMapData({ id: mapId || 0, isSet: type === 'set' }),
    retry: 0,
  });

export function addMapToSelf({ mapId }: { mapId: number }) {
  if (!mapId) throw new Error('No map id provided');
  return axios.patch<User>(
    `${process.env.NEXT_PUBLIC_API_URL}/users/map/${mapId}`,
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
