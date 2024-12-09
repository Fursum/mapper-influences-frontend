export type MapInfo = {
  title: string;
  artist: string;
  diff: string;
  backgroundUrl: string;
  mapUrl: string;
};

export type CoversResponse = {
  cover: string;
  card: string;
  list: string;
  slimcover: string;
};

//** Generated from api response */
export enum BeatmapType {
  Graveyard = 0,
  Loved = 1,
  /// Includes Pending and WIP maps.
  Pending = 2,
  Ranked = 3,
  Guest = 4,
  Nominated = 5,
}
