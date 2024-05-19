import { toast } from 'react-toastify';

import type { BeatmapResponse } from '@libs/types/IOsuApi';
import {
  type Updater,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';

import type { BeatmapId } from './influence';
import { type UserBioResponse, useCurrentUser } from './user';

function getMapData({ id, isSet }: { isSet?: boolean; id: string | number }) {
  return axios
    .get<BeatmapResponse>(
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

export function addMapToSelf({
  mapId,
  isSet,
}: {
  mapId: number;
  isSet?: boolean;
}) {
  if (!mapId) throw new Error('No map id provided');
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/users/add_beatmap`,
    { id: mapId, is_beatmapset: isSet },
    { withCredentials: true },
  );
}

export const useAddMapToSelfMutation = () => {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMapToSelf,
    onSuccess: (_, variables) => {
      const updater: Updater<
        UserBioResponse | undefined,
        UserBioResponse | undefined
      > = (old) => {
        if (!old || !variables.mapId) return old;
        return {
          ...old,
          beatmaps: [
            ...(old.beatmaps || []),
            {
              id: variables.mapId,
              is_beatmapset: !!variables.isSet,
            },
          ],
        };
      };

      queryClient.setQueryData<UserBioResponse>(
        ['userBio', currentUser?.id],
        updater,
      );
      queryClient.setQueryData<UserBioResponse>(['currentUser'], updater);

      toast.success('New map added.');
    },
    onError: () => {
      queryClient.refetchQueries({ queryKey: ['currentUser'] });
      queryClient.refetchQueries({
        queryKey: ['userBio', currentUser?.id],
      });

      toast.error('Failed to add map');
    },
  });
};

export function deleteMapFromSelf(map: BeatmapId) {
  return axios.delete(
    `${process.env.NEXT_PUBLIC_API_URL}/users/remove_beatmap/${map.is_beatmapset ? 'set' : 'diff'}/${map.id}`,
    { withCredentials: true },
  );
}

export const useDeleteMapFromSelfMutation = () => {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMapFromSelf,
    onSuccess: (_, variables) => {
      const updater: Updater<
        UserBioResponse | undefined,
        UserBioResponse | undefined
      > = (old) => {
        if (!old) return old;
        return {
          ...old,
          beatmaps: old.beatmaps.filter((b) => b.id !== variables.id),
        };
      };

      queryClient.setQueryData<UserBioResponse>(
        ['userBio', currentUser?.id],
        updater,
      );
      queryClient.setQueryData<UserBioResponse>(['currentUser'], updater);

      toast.success('Map deleted.');
    },
    onError: () => {
      queryClient.refetchQueries({ queryKey: ['currentUser'] });
      queryClient.refetchQueries({
        queryKey: ['userBio', currentUser?.id],
      });

      toast.error('Failed to delete map');
    },
  });
};
