import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type LeaderboardResponse = {
  data: {
    id: number;
    username: string;
    avatar_url: string;
    bio: string;
    mention_count: number;
    country: string;
  }[];
  count: number;
};

function getLeaderboards(filters?: {
  country?: string;
  ranked?: boolean;
  limit: number;
}) {
  const params = new URLSearchParams();
  if (filters?.country) params.append('country', filters.country);
  if (filters?.ranked) params.append('ranked', filters.ranked.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return axios
    .get<LeaderboardResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/leaderboard?${params.toString()}`,
    )
    .then((res) => res.data);
}

export const useGetLeaderboards = (filters?: {
  country?: string;
  ranked?: boolean;
  limit: number;
}) =>
  useQuery({
    queryKey: [
      'leaderboards',
      filters?.country,
      filters?.ranked,
      filters?.limit,
    ],
    queryFn: () => getLeaderboards(filters),
    staleTime: 60 * 1000,
  });
