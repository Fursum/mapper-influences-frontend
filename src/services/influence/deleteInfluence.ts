import { toast } from 'react-toastify';

import type { Influence } from '@libs/types/rust';
import { useCurrentUser } from '@services/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export async function deleteInfluence(target: string | number) {
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/${target}`;
  return await axios.delete(searchUrl, { withCredentials: true });
}

export const useDeleteInfluenceMutation = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const key = ['influences', user?.id.toString()];

  return useMutation({
    mutationFn: deleteInfluence,
    onSuccess: (_, variables) => {
      queryClient.cancelQueries({
        queryKey: key,
      });
      queryClient.setQueryData(key, (old: Influence[] | undefined) => {
        if (!old) return [];
        return old.filter(
          (influence) => influence.user.id.toString() !== variables.toString(),
        );
      });
      queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
      queryClient.invalidateQueries({
        queryKey: ['userBio', variables.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ['mentions', variables.toString()],
      });
    },
    onError: () => {
      toast.error('Failed to remove influence.');
      queryClient.invalidateQueries({
        queryKey: key,
      });
    },
  });
};
