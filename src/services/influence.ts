import { toast } from 'react-toastify';

import { useCurrentUser } from '@hooks/useUser';
import { DUMMY_INFLUENCES } from '@libs/consts/dummyUserData';
import { mockAxiosReject, mockRequest } from '@libs/functions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export type InfluenceResponse = {
  from_id: number;
  to_id: number;
  influence_level: number;
  info?: string;
  created_at: any;
  modified_at: any;
};

export async function getInfluences(userId: string | number) {
  if (process.env.NODE_ENV !== 'production')
    return mockRequest(DUMMY_INFLUENCES, 1000);

  const searchUrl = `/api/v1/influence/get/${userId}`;
  return axios.get<InfluenceResponse[]>(searchUrl).then((res) => res.data);
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
      queryClient.setQueryData(key, (old: InfluenceResponse[] | undefined) => {
        const newInfluence = {
          from_id: user?.id || 0,
          influence_level: variables.type,
          info: variables.description,
          created_at: new Date(),
          modified_at: new Date(),
        };
        if (!old) return [newInfluence];
        return [...old, newInfluence];
      });
      toast.success('Influence added successfully.');
    },
    onError: () => toast.error('Failed to add influence.'),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: key,
      }),
  });
};

export async function deleteInfluence(from_id: string | number) {
  // Mock data for dev
  if (process.env.NODE_ENV !== 'production') return mockRequest({}, 1000);

  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/influence/delete/${from_id}`;
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
        return old.filter((influence) => influence.from_id !== variables);
      });
      toast.success('Influence removed successfully.');
    },
    onError: () => toast.error('Failed to remove influence.'),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: key,
      }),
  });
};

export type EditInfluenceInfoRequest = {
  from_id: number;
  info?: string;
};

export async function editInfluenceInfo(body: EditInfluenceInfoRequest) {
  // Mock data for dev
  if (process.env.NODE_ENV !== 'production') return mockRequest({}, 1000);

  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/influence/update/info`;
  return await axios.post(searchUrl, body);
}

export type EditInfluenceLevelRequest = {
  from_id: number;
  level: number;
};

export async function editInfluenceLevel(body: EditInfluenceLevelRequest) {
  // Mock data for dev
  if (process.env.NODE_ENV !== 'production') return mockAxiosReject({}, 1000);

  const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/influence/update/level`;
  return await axios.post(searchUrl, body);
}
