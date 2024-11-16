import type { BeatmapSmall, UserSmall } from './rust';

type ActivityBase = {
  id: string;
  created_at: string; // ISO string
  user: UserSmall;
};

type Login = ActivityBase & {
  event_type: 'LOGIN';
};

type EditBio = ActivityBase & {
  event_type: 'EDIT_BIO';
  bio: string;
};

type EditSelfMaps = ActivityBase & {
  event_type: 'ADD_USER_BEATMAP' | 'REMOVE_USER_BEATMAP';
  beatmap: BeatmapSmall;
};

type EditInfluence = ActivityBase & {
  event_type: 'ADD_INFLUENCE' | 'REMOVE_INFLUENCE';
  influence: UserSmall;
};

type EditInfluenceType = ActivityBase & {
  event_type: 'EDIT_INFLUENCE_TYPE';
  influence: UserSmall;
  influence_type: number;
};

type EditInfluenceDesc = ActivityBase & {
  event_type: 'EDIT_INFLUENCE_DESC';
  influence: UserSmall;
  desc: string;
};

type EditInfluenceMaps = ActivityBase & {
  event_type: 'ADD_INFLUENCE_BEATMAP' | 'REMOVE_INFLUENCE_BEATMAP';
  beatmap: BeatmapSmall;
  influence: UserSmall;
};

export type Activity =
  | Login
  | EditBio
  | EditSelfMaps
  | EditInfluence
  | EditInfluenceType
  | EditInfluenceDesc
  | EditInfluenceMaps;
