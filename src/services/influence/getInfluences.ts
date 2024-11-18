import type { Influence } from '@libs/types/rust';
import { useCurrentUser } from '@services/user';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export async function getInfluences(userId: string | number) {
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/influences/${userId}`;
  return axios
    .get<Influence[]>(searchUrl, { withCredentials: true })
    .then((res) => res.data);
}

export const useGetInfluences = (userId?: string | number) => {
  const { data: user } = useCurrentUser();
  const id = userId || user?.id || 0;
  return useQuery({
    queryKey: ['influences', id.toString()],
    enabled: !!id,
    queryFn: () => getInfluences(id),
  });
};
