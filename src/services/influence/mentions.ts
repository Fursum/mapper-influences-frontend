import type { Influence } from '@libs/types/rust';
import { useCurrentUser } from '@services/user';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function getMentions(userId: string | number) {
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/mentions/${userId}`;
  return axios
    .get<Influence[]>(searchUrl, { withCredentials: true })
    .then((res) => res.data);
}

export const useGetMentions = (userId?: string | number) => {
  const { data: user } = useCurrentUser();
  const id = userId || user?.id || 0;
  return useQuery({
    queryKey: ['mentions', id.toString()],
    enabled: !!id,
    queryFn: () => getMentions(id),
  });
};
