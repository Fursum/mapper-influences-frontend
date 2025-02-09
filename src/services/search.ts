import type { BeatmapsetSmall, UserSmall } from '@libs/types/rust';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function getSearchResults(query: string) {
  return axios
    .get<UserSmall[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/search/user/${query}`,
      {
        withCredentials: true,
      },
    )
    .then((res) => res.data);
}

export function searchMaps(query: string) {
  return axios
    .get<BeatmapsetSmall[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/search/map?q=${query}&nsfw=true`,
      {
        withCredentials: true,
      },
    )
    .then((res) => res.data);
}

export const useMapSearch = (query: string) => {
  return useQuery({
    queryKey: ['mapSearch', query],
    queryFn: () => searchMaps(query),
    enabled: !!query,
  });
};
