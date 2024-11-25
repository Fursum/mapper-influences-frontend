import { toast } from 'react-toastify';

import type { Influence } from '@libs/types/rust';
import { useCurrentUser } from '@services/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const addMapToInfluence = async (params: {
  influenceId: number;
  beatmapIds: number[];
}) => {
  return await axios.patch<Influence>(
    `${process.env.NEXT_PUBLIC_API_URL}/influence/${params.influenceId}/map`,
    { beatmaps: params.beatmapIds },
    { withCredentials: true },
  );
};

export const useAddMapToInfluenceMutation = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  return useMutation({
    mutationFn: addMapToInfluence,
    onSuccess: (res, variables) => {
      queryClient.setQueryData<Influence[]>(
        ['influences', user?.id.toString()],
        (old) => {
          if (!old) return old;
          return old.map((influence) => {
            if (influence.user.id === variables.influenceId) {
              return res.data;
            }
            return influence;
          });
        },
      );
    },
    onError: () => {
      toast.error('Could not add maps to influence.');
      queryClient.invalidateQueries({
        queryKey: ['influences', user?.id.toString()],
      });
    },
  });
};
