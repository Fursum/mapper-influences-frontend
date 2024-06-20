import { toast } from 'react-toastify';

import { mockRequest } from '@libs/functions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { useCurrentUser } from './user';

export type BeatmapId = {
  id: number;
  is_beatmapset: boolean;
};

export type InfluenceResponse = {
  id: number;
  influenced_by: number;
  influenced_to: number;
  created_at: string;
  modified_at: string;
  type: number;
  description: string;
  beatmaps: BeatmapId[];
};

export async function getInfluences(userId: string | number) {
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/${userId}`;
  return axios
    .get<InfluenceResponse[]>(searchUrl, { withCredentials: true })
    .then((res) => res.data);
}

export const useGetInfluences = (userId?: string | number) => {
  const { data: user } = useCurrentUser();
  const id = userId || user?.id || 0;
  return useQuery({
    queryKey: ['influences', id.toString()],
    enabled: !!id,
    queryFn: () =>
      getInfluences(id).then(
        // Mongo changes the id on updates, and i need a stable unique id
        (data) => data.map((e) => ({ ...e, id: e.influenced_to })) || [],
      ),
  });
};

export type AddInfluenceRequest = {
  influenced_to: number;
  type: number;
  description: string;
  beatmaps?: {
    is_beatmapset: boolean;
    id: number;
  }[];
};

export async function addInfluence(body: AddInfluenceRequest) {
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence`;

  await mockRequest(null, 1000);

  return axios.post<InfluenceResponse>(
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
      const newInfluence = { ...res.data, id: res.data.influenced_to };
      queryClient.setQueryData<InfluenceResponse[]>(key, (old) => {
        if (!old) return [newInfluence];

        // If the influence exists, replace it
        const influenceIndex = old.findIndex(
          (inf) => inf.influenced_to === newInfluence.influenced_to,
        );

        const newObject = old.map((influence) => {
          if (influence.influenced_to === newInfluence.influenced_to) {
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
      queryClient.invalidateQueries({
        queryKey: ['userBio', variables.influenced_to.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ['mentions', variables.influenced_to.toString()],
      });
    },
    onError: () =>
      queryClient.invalidateQueries({
        queryKey: key,
      }),
  });
};

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
      queryClient.setQueryData(key, (old: InfluenceResponse[] | undefined) => {
        if (!old) return [];
        return old.filter(
          (influence) =>
            influence.influenced_to.toString() !== variables.toString(),
        );
      });
      toast.success('Influence removed.');
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

export function getMentions(userId: string | number) {
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/${userId}/mentions`;
  return axios
    .get<InfluenceResponse[]>(searchUrl, { withCredentials: true })
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

export function setInfluenceOrder(order: number[]) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/users/influence-order`;
  return axios.post(
    url,
    {
      influence_ids: order,
    },
    { withCredentials: true },
  );
}
