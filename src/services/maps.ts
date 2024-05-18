import type { BeatmapResponse } from '@libs/types/IOsuApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import type { CurrentUserResponse } from './user';

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
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/users/add_beatmap`,
    { mapId, is_beatmapset: isSet },
    { withCredentials: true },
  );
}

export const useAddMapToSelfMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMapToSelf,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<CurrentUserResponse>(['currentUser'], (old) => {
        if (!old) return old;
        return {
          ...old,
          beatmaps: [
            ...old.beatmaps,
            {
              id: Number(variables.mapId),
              is_beatmapset: !!variables.isSet,
            },
          ],
        };
      });
    },
  });
};
