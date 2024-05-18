import axios from 'axios';
import type { UserCompact } from 'osu-web.js';

export function getSearchResults(query: string) {
  return axios
    .get<
      UserCompact[]
    >(`${process.env.NEXT_PUBLIC_API_URL}/osu_api/search/${query}`, { withCredentials: true })
    .then((res) => res.data);
}
