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
    queryKey: ['influences', id],
    queryFn: () => getInfluences(id),
    staleTime: 60 * 1000,
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
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/`;
  return await axios.post(searchUrl, body, { withCredentials: true });
}

export const useAddInfluenceMutation = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const key = ['influences', user?.id];

  return useMutation({
    mutationFn: addInfluence,
    onSuccess: (_, variables) => {
      queryClient.cancelQueries({
        queryKey: key,
      });
      queryClient.setQueryData<InfluenceResponse[]>(key, (old) => {
        const newInfluence: InfluenceResponse = {
          influenced_by: user?.id || 0,
          influenced_to: user?.id || 0,
          type: variables.type,
          description: variables.description,
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
          beatmaps: [],
        };
        if (!old) return [newInfluence];
        return [...old, newInfluence];
      });
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: key,
      }),
  });
};

export async function deleteInfluence(from_id: string | number) {
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/remove_influence/${from_id}`;
  return await axios.delete(searchUrl);
}

export const useDeleteInfluenceMutation = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const key = ['influences', user?.id];

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
    },
    onError: () => toast.error('Failed to remove influence.'),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: key,
      }),
  });
};
