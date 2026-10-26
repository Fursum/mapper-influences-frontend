import type { BeatmapsetSmall, UserSmall } from '@libs/types/rust';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function getSearchResults(query: string) {
  return axios
    .get<UserSmall[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/search/user/${encodeURIComponent(query)}`,
      {
        withCredentials: true,
      },
    )
    .then((res) => res.data);
}

// filters is a prebuilt "&key=value" string from useFilterStore
export function searchMaps(query: string, filters = '') {
  return axios
    .get<BeatmapsetSmall[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/search/map?q=${encodeURIComponent(query)}${filters}&nsfw=true`,
      {
        withCredentials: true,
      },
    )
    .then((res) => res.data);
}

export const useMapSearch = (
  query: string,
  filters: string,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ['mapSearch', query, filters],
    queryFn: () => searchMaps(query, filters),
    enabled,
    // Keep the old results on screen while the next query loads
    placeholderData: keepPreviousData,
  });
};
