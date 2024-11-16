// Types that are used in rust responses

export type UserSmall = {
  avatar_url: string;
  country_code: string;
  country_name: string;
  groups: {
    colour: string;
    name: string;
    short_name: string;
  }[];
  id: number;
  mentions: number | null;
  ranked_maps: number;
  username: string;
};

export type BeatmapSmall = {
  artist: string;
  beatmapset_id: number;
  cover: string;
  difficulty_rating: number;
  id: number;
  mode: string;
  title: string;
  user_avatar_url: string;
  user_id: number;
  user_name: string;
  version: string;
};
