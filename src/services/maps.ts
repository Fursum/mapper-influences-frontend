import type { BeatmapResponse } from '@libs/types/IOsuApi';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

function getMapData({ id, isSet }: { isSet?: boolean; id: string | number }) {
  return axios
    .get<BeatmapResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/osu_api/beatmap/${id}?type=${isSet ? 'beatmapset' : 'beatmap'}`,
      {
        withCredentials: true,
      },
    )
    .then((res) => {
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
