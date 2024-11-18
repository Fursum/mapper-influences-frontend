import type { Influence } from '@libs/types/rust';
import { useCurrentUser } from '@services/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export type AddInfluenceRequest = {
  userId: string | number;
  influence_type: number;
  description: string;
  beatmaps?: number[];
};

export async function addInfluence(body: AddInfluenceRequest) {
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence`;

  return axios.post<Influence>(
    searchUrl,
    { beatmaps: [], ...body },
    { withCredentials: true },
  );
}

export const useAddInfluenceMutation = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const key = ['influences', user?.id.toString()];

  return useMutation({
    mutationFn: addInfluence,
    onSuccess: (res, variables) => {
      const newInfluence = { ...res.data, id: res.data.user.id };
      queryClient.setQueryData<Influence[]>(key, (old) => {
        if (!old) return [newInfluence];

        // If the influence exists, replace it
        const influenceIndex = old.findIndex(
          (inf) => inf.user.id === newInfluence.user.id,
        );

        const newObject = old.map((influence) => {
          if (influence.user.id === newInfluence.user.id) {
            return newInfluence;
          }
          return influence;
        });

        if (influenceIndex !== -1) return newObject;

        // add influence to start of array
        newObject.unshift(newInfluence);
        return newObject;
      });
      queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
      // TODO: Change this to update current user influences
      queryClient.invalidateQueries({
        queryKey: ['userBio', variables.userId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ['mentions', variables.userId.toString()],
      });
    },
    onError: () =>
      queryClient.invalidateQueries({
        queryKey: key,
      }),
  });
};
