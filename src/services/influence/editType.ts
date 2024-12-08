import { toast } from 'react-toastify';

import type { Influence } from '@libs/types/rust';
import { useCurrentUser } from '@services/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const editInfluenceType = (params: {
  influenceId: number;
  influenceType: number;
}) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/influence/${params.influenceId}/type/${params.influenceType}`;
  return axios.patch<Influence>(url, {}, { withCredentials: true });
};

export const useEditInfluenceTypeMutation = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationFn: editInfluenceType,
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
      toast.error('Could not edit influence type.');
      queryClient.invalidateQueries({
        queryKey: ['influences', user?.id.toString()],
      });
    },
  });
};
