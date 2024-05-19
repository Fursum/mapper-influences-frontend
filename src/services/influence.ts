import { toast } from 'react-toastify';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { useCurrentUser } from './user';

export type BeatmapId = {
  id: number;
  is_beatmapset: boolean;
};

export type InfluenceResponse = {
  influenced_by: number;
  influenced_to: number;
  created_at: string;
  modified_at: string;
  type: number;
  description: string;
  beatmaps: BeatmapId[];
};

export async function getInfluences(userId: string | number) {
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/get_influences/${userId}`;
  return axios
    .get<InfluenceResponse[]>(searchUrl, { withCredentials: true })
    .then((res) => res.data);
}

export const useGetInfluences = (userId?: string | number) => {
  const { data: user } = useCurrentUser();
  const id = userId || user?.id || 0;
  return useQuery({
    queryKey: ['influences', Number(id)],
    enabled: !!id,
    queryFn: () => getInfluences(id),
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
  return await axios.post(
    searchUrl,
    { beatmaps: [], ...body },
    { withCredentials: true },
  );
}

export const useAddInfluenceMutation = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const key = ['influences', Number(user?.id)];

  return useMutation({
    mutationFn: addInfluence,
    onSuccess: (_, variables) => {
      queryClient.cancelQueries({
        queryKey: key,
      });
      queryClient.setQueryData<InfluenceResponse[]>(key, (old) => {
        const newInfluence: InfluenceResponse = {
          influenced_by: user?.id || 0,
          influenced_to: variables.influenced_to || 0,
          type: variables.type,
          description: variables.description,
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          beatmaps: [],
        };
        if (!old) return [newInfluence];

        // If the influence exists, replace it
        if (
          old.some((inf) => inf.influenced_to === newInfluence.influenced_to)
        ) {
          return old.map((inf) =>
            inf.influenced_to === newInfluence.influenced_to
              ? newInfluence
              : inf,
          );
        }

        return [...old, newInfluence];
      });
      queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
      queryClient.invalidateQueries({
        queryKey: ['userBio', Number(variables.influenced_to)],
      });
      queryClient.invalidateQueries({
        queryKey: ['mentions', Number(variables.influenced_to)],
      });
    },
    onError: () =>
      queryClient.invalidateQueries({
        queryKey: key,
      }),
  });
};

export async function deleteInfluence(from_id: string | number) {
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/remove_influence/${from_id}`;
  return await axios.delete(searchUrl, { withCredentials: true });
}

export const useDeleteInfluenceMutation = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const key = ['influences', Number(user?.id)];

  return useMutation({
    mutationFn: deleteInfluence,
    onSuccess: (_, variables) => {
      queryClient.cancelQueries({
        queryKey: key,
      });
      queryClient.setQueryData(key, (old: InfluenceResponse[] | undefined) => {
        if (!old) return [];
        return old.filter((influence) => influence.influenced_to !== variables);
      });
      toast.success('Influence removed.');
      queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
      queryClient.invalidateQueries({
        queryKey: ['userBio', Number(variables)],
      });
      queryClient.invalidateQueries({
        queryKey: ['mentions', Number(variables)],
      });
    },
    onError: () => toast.error('Failed to remove influence.'),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: key,
      }),
  });
};

export function getMentions(userId: string | number) {
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/get_mentions/${userId}`;
  return axios
    .get<InfluenceResponse[]>(searchUrl, { withCredentials: true })
    .then((res) => res.data);
}

export const useGetMentions = (userId?: string | number) => {
  const { data: user } = useCurrentUser();
  const id = userId || user?.id || 0;
  return useQuery({
    queryKey: ['mentions', Number(id)],
    enabled: !!id,
    queryFn: () => getMentions(id),
  });
};
