import axios from "axios";

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
