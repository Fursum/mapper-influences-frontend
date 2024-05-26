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
  id: string;
  influenced_by: number;
  influenced_to: number;
  created_at: string;
  modified_at: string;
  type: number;
  description: string;
  beatmaps: BeatmapId[];
};

export async function getInfluences(userId: string | number) {
  // Dev response
  if (process.env.NODE_ENV === 'development') {
    return mockRequest<InfluenceResponse[]>(
      [
        {
          id: '123',
          influenced_by: 1,
          influenced_to: 5,
          created_at: '2021-01-01T00:00:00Z',
          modified_at: '2021-01-01T00:00:00Z',
          type: 1,
          description: 'Test description',
          beatmaps: [],
        },
        {
          id: '1234',
          influenced_by: 1,
          influenced_to: 4,
          created_at: '2021-01-01T00:00:00Z',
          modified_at: '2021-01-01T00:00:00Z',
          type: 1,
          description: 'Test',
          beatmaps: [],
        },
      ],
      1000,
    );
  }

  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/get_influences/${userId}`;
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

export function addInfluence(body: AddInfluenceRequest) {
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence`;
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
      const newInfluence = res.data;
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

        newObject.push(newInfluence);
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
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/remove_influence/${target}`;
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
  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/influence/get_mentions/${userId}`;
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
