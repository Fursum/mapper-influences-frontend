export type MapInfo = {
  title: string;
  artist: string;
  diff: string;
  backgroundUrl: string;
  mapUrl: string;
};

export type BeatmapResponse = {
  difficulty_rating: number;
  id: number;
  url: string;
  name: string;
};

export type CoversResponse = {
  cover: string;
  card: string;
  list: string;
  slimcover: string;
};

//** Generated from api response */
export enum BeatmapType {
  Graveyard,
  Loved,
  /// Includes Pending and WIP maps.
  Pending,
  Ranked,
  Guest,
  Nominated,
}
