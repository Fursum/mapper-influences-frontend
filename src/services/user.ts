import { DUMMY_USER } from "@libs/consts/dummyUserData";
import { mockAxiosReject, mockRequest } from "@libs/functions";
import type {
  BeatmapResponse,
  BeatmapType,
  CoversResponse,
} from "@libs/types/user";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type UserBaseResponse = {
  id: number;
  user_name: string;
  profile_picture: string;
  bio?: string;
  flag: { code: string; name: string }; // ! not implemented in api
};

export async function getUserBase(userId?: number | string) {
  // Mock data for dev
  if (process.env.NODE_ENV !== "production")
    return mockRequest<UserBaseResponse>(
      {
        id: DUMMY_USER.id,
        profile_picture: DUMMY_USER.profile_picture,
        user_name: DUMMY_USER.user_name,
        flag: DUMMY_USER.flag,
      },
      1000
    );

  let searchUrl = `${process.env.API_URL}/api/v1/user/get`;
  // Add query when using with an id
  if (userId) searchUrl += `/${userId}`;

  return await axios.get<UserBaseResponse>(searchUrl).then((res) => res.data);
}

export const useBaseUser = (userId?: number | string) => {
  return useQuery({
    queryFn: () => getUserBase(userId),
    queryKey: ["userBase", userId],
    staleTime: 60 * 1000,
  });
};

export type FeaturedMapsResponse = {
  beatmapset: {
    id: number;
    status: BeatmapType;
    creator: string;
    beatmaps: BeatmapResponse[];
    covers: CoversResponse;
    names: {
      artist: string;
      artist_unicode: string;
      title: string;
      title_unicode: string;
    };
  };
  featured_map_id: number;
};

export type UserFullResponse = {
  id: number;
  user_name: string;
  profile_picture: string;
  flag: { code: string; name: string }; // ! not implemented in api
  groups: any[]; // ! not implemented in api
  bio?: string;
  featured_maps: FeaturedMapsResponse[];
  ranked_count: number;
  loved_count: number;
  nominated_count: number;
  graveyard_count: number;
  guest_count: number;
  osu_data_modified_at: any;
  profile_data_modified_at: any;
};

export async function getUserFull(userId?: number | string) {
  // Mock data for dev
  if (process.env.NODE_ENV !== "production")
    return mockRequest<UserFullResponse>(DUMMY_USER, 1000);

  let searchUrl = `${process.env.API_URL}/api/v1/user/get`;

  if (userId) searchUrl += `/${userId}/full`;
  else searchUrl += "/full";

  return await axios.get<UserFullResponse>(searchUrl).then((res) => res.data);
}

export const useFullUser = (userId?: number | string) => {
  return useQuery({
    queryFn: () => getUserFull(userId),
    queryKey: ["userFull", userId],
    staleTime: 60 * 1000,
  });
};

export type UserEditRequest = {
  user_name?: string;
  profile_picture?: string;
  bio?: string;
};

export function editUser(body: UserEditRequest) {
  // Mock data for dev
  if (process.env.NODE_ENV !== "production") return mockAxiosReject({}, 1000);

  const searchUrl = `${process.env.API_URL}/api/v1/user/update`;
  return axios.post(searchUrl, body);
}
