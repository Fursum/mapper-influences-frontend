import type { UserSmall } from '@libs/types/rust';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type UserLeaderboardItem = {
  user: UserSmall;
  count: number;
};

function getUserLeaderboards(filters?: {
  country?: string;
  ranked?: boolean;
  limit: number;
}) {
  const params = new URLSearchParams();
  if (filters?.country) params.append('country', filters.country);
  if (filters?.ranked) params.append('ranked', filters.ranked.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return axios
    .get<
      UserLeaderboardItem[]
    >(`${process.env.NEXT_PUBLIC_API_URL}/leaderboard/user?${params.toString()}`)
    .then((res) => res.data);
}

export const useGetUserLeaderboards = (filters?: {
  country?: string;
  ranked?: boolean;
  limit: number;
}) =>
  useQuery({
    queryKey: [
      'userLeaderboards',
      filters?.country,
      filters?.ranked,
      filters?.limit,
    ],
    queryFn: () => getUserLeaderboards(filters),
    staleTime: 60 * 1000,
  });
