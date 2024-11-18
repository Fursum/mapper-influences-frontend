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

export type User = UserSmall & {
  beatmaps: BeatmapSmall[];
  bio: string;
  graveyard_beatmapset_count: number;
  guest_beatmapset_count: number;
  loved_beatmapset_count: number;
  nominated_beatmapset_count: number;
  pending_beatmapset_count: number;
  ranked_and_approved_beatmapset_count: number;
  ranked_beatmapset_count: number;
  previous_usernames: string[];
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

export type BeatmapSearch = {
  artist: string;
  beatmaps: {
    beatmapset_id: number;
    difficulty_rating: number;
    id: number;
    mode: string;
    version: string;
  }[];
  cover: string;
  id: number;
  title: string;
  user_avatar_url: string;
  user_id: number;
  user_name: string;
};
