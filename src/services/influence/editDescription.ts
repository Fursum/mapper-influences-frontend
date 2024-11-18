import { toast } from 'react-toastify';

import type { Influence } from '@libs/types/rust';
import { useCurrentUser } from '@services/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const editInfluenceDescription = async (params: {
  influenceId: number;
  description: string;
}) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/influence/${params.influenceId}/description`;
  return axios.patch<Influence>(
    url,
    { description: params.description },
    { withCredentials: true },
  );
};

export const useEditInfluenceDescriptionMutation = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationFn: editInfluenceDescription,
    onSuccess: (res, variables) => {
      queryClient.setQueryData<Influence[]>(
        ['influences', user?.id.toString()],
        (old) => {
          if (!old) return old;
          return old.map((influence) => {
            if (influence.id === variables.influenceId) {
              return res.data;
            }
            return influence;
          });
        },
      );
    },
    onError: () => {
      toast.error('Could not edit influence description.');
      queryClient.invalidateQueries({
        queryKey: ['influences', user?.id.toString()],
      });
    },
  });
};
