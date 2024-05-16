import axios from "axios";
import type { UserExtended } from "osu-web.js";

export type CurrentUserResponse = {
  id: number;
  username: string;
  avatar_url: string;
};

export function getCurrentUser() {
  return axios.get<CurrentUserResponse>(
    `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
    { withCredentials: true }
  );
}

export function getFullUser(userId: string) {
  return axios.get<UserExtended>(
    `${process.env.NEXT_PUBLIC_API_URL}/osu_api/user/${userId}`,
    { withCredentials: true }
  );
}
