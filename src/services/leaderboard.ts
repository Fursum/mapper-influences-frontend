import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type LeaderboardResponse = {
  id: number;
  username: string;
  avatar_url: string;
  bio: string;
  mention_count: number;
  country: string;
}[];

function getLeaderboards(filters?: { country?: string; ranked?: boolean }) {
  const params = new URLSearchParams();
  if (filters?.country) params.append('country', filters.country);
  if (filters?.ranked) params.append('ranked', filters.ranked.toString());

  return axios
    .get<LeaderboardResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/leaderboard?${params.toString()}`,
    )
    .then((res) => res.data);
}

export const useGetLeaderboards = (filters?: {
  country?: string;
  ranked?: boolean;
}) =>
  useQuery({
    queryKey: ['leaderboards', filters?.country, filters?.ranked],
    queryFn: () => getLeaderboards(filters),
    staleTime: 60 * 1000,
  });
