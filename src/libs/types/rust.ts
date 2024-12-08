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
  previous_usernames: string[];
};

export type User = UserSmall & {
  beatmaps: BeatmapsetSmall[];
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

export type BeatmapsetSmall = {
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

export type Influence = {
  beatmaps: BeatmapsetSmall[];
  description: string;
  user: UserSmall;
  influence_type: number;
};
