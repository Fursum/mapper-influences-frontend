import type { BeatmapResponse } from '@libs/types/IOsuApi';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { UserCompact } from 'osu-web.js';

export function getSearchResults(query: string) {
  return axios
    .get<{
      user: { data: UserCompact[] };
    }>(`${process.env.NEXT_PUBLIC_API_URL}/osu_api/search/${query}`, {
      withCredentials: true,
    })
    .then((res) => res.data.user.data);
}

export function searchMaps(query: string) {
  return axios
    .get<{ beatmapsets: BeatmapResponse[] }>(
      `${process.env.NEXT_PUBLIC_API_URL}/osu_api/search_map?q=${query}&s=any`,
      {
        withCredentials: true,
      },
    )
    .then((res) => res.data.beatmapsets);
}

export const useMapSearch = (query: string) => {
  return useQuery({
    queryKey: ['mapSearch', query],
    queryFn: () => searchMaps(query),
    enabled: !!query,
  });
};

export type BeatmapSearchResponse = Pick<
  BeatmapResponse,
  | 'artist'
  | 'artist_unicode'
  | 'beatmaps'
  | 'bpm'
  | 'covers'
  | 'creator'
  | 'id'
  | 'user_id'
  | 'ranked'
>;
