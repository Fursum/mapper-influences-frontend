import { toast } from 'react-toastify';

import type { Influence } from '@libs/types/rust';
import { useCurrentUser } from '@services/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function deleteMapFromInfluence(params: {
  influenceId: number;
  mapId: number | string;
}) {
  return axios.delete<Influence>(
    `${process.env.NEXT_PUBLIC_API_URL}/influence/${params.influenceId}/map/${params.mapId}`,
    {
      withCredentials: true,
    },
  );
}

export const useDeleteMapFromInfluenceMutation = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: deleteMapFromInfluence,
    onSuccess: (res, variables) => {
      queryClient.setQueryData<Influence[]>(['influences', user?.id], (old) => {
        if (!old) return old;
        return old.map((influence) => {
          if (influence.id === variables.influenceId) {
            return res.data;
          }
          return influence;
        });
      });
    },
    onError: () => {
      toast.error('Could not remove map from influence.');
      queryClient.invalidateQueries({
        queryKey: ['influences', user?.id],
      });
    },
  });
};
