import type { BeatmapsetSmall, UserSmall } from '@libs/types/rust';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type LeaderboardResponse = {
  user?: UserSmall;
  beatmap?: BeatmapsetSmall;
  count: number;
}[];

function getLeaderboards(filters: {
  country?: string;
  ranked?: boolean;
  limit: number;
  type: 'user' | 'beatmap';
}) {
  const params = new URLSearchParams();
  if (filters?.country) params.append('country', filters.country);
  if (filters?.ranked) params.append('ranked', filters.ranked.toString());
  params.append('limit', filters.limit.toString());

  return axios
    .get<LeaderboardResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/leaderboard/${filters.type}?${params.toString()}`,
    )
    .then((res) => res.data);
}

export const useGetLeaderboards = (filters: {
  country?: string;
  ranked?: boolean;
  limit: number;
  type: 'user' | 'beatmap';
}) =>
  useQuery({
    queryKey: [
      'leaderboards',
      filters.country,
      filters.ranked,
      filters.limit,
      filters.type,
    ],
    queryFn: () => getLeaderboards(filters),
    staleTime: 60 * 1000,
  });
