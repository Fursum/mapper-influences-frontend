import type { Beatmapset } from 'osu-web.js';

export type BeatmapResponse = Beatmapset & {
  beatmaps: {
    id: number;
    status: string;
    ranked: 0 | 1;
    mode: string;
    url: string;
    version: string;
    difficulty_rating: number;
    // Fill rest later
  }[];
  related_users: {
    username: string;
    avatar_url: string;
  }[];
};
