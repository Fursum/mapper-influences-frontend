export type Gamemode = "osu" | "taiko" | "fruits" | "mania";
export type UserKey = "id" | "username";
export type RecentType = "best" | "firsts" | "recent";

export type Mods =
  | "NF"
  | "EZ"
  | "TD"
  | "HD"
  | "HR"
  | "DT"
  | "HT"
  | "NC"
  | "FL"
  | "SO";
export type UserBeatmapsType =
  | "ranked"
  | "graveyard"
  | "loved"
  | "pending"
  | "most_played"
  | "favorite";
export type UserRecentActivitiesType =
  | "beatmapsetUpdate"
  | "rank"
  | "userSupportAgain"; //maybe more
export type ScoreRank = "XH" | "SH" | "S" | "A" | "B" | "C" | "D" | "F";

export type RankStatus =
  | "graveyard"
  | "wip"
  | "pending"
  | "ranked"
  | "approved"
  | "qualified"
  | "loved";

export enum GamemodeEnum {
  osu = 0,
  taiko = 1,
  fruits = 2,
  mania = 3,
}

export enum RankStatusEnum {
  graveyard = -2,
  wip,
  pending,
  ranked,
  approved,
  qualified,
  loved,
}

export interface OsuBeatmapUserScore {
  position: number;
  score: OsuScore;
}

export interface OsuBeatmapScore {
  scores: OsuScore[];
}

export interface CurrentUserAttributes {
  pin: null;
}

export interface ScoreStatistics {
  count_50: number;
  count_100: number;
  count_300: number;
  count_geki: number;
  count_katu: number;
  count_miss: number;
}

export interface UserCompact {
  avatar_url: string;
  country_code: string;
  default_group: string;
  id: number;
  is_active: boolean;
  is_bot: boolean;
  is_deleted: boolean;
  is_online: boolean;
  is_supporter: boolean;
  last_visit: Date | null;
  pm_friends_only: boolean;
  profile_colour: string | null;
  username: string;
  country?: Country; //does not returned on search
  cover?: Cover; //does not returned on search
}

export interface Country {
  code: string;
  name: string;
}

export interface Cover {
  custom_url: null | string;
  url: string;
  id: null | string;
}

export interface OsuSearch {
  user: OsuSearchUser;
  wiki_page: WikiPage;
}

export interface OsuSearchUser {
  data: UserCompact[];
  total: number;
}

export interface WikiPage {
  data: Datum[];
  total: number;
}

export interface Datum {
  available_locales: string[];
  layout: string;
  locale: string;
  markdown: string;
  path: string;
  subtitle: string;
  tags: string[];
  title: string;
}

export interface OsuUserRecentActivities {
  created_at: Date;
  createdAt: Date;
  id: number;
  type: string;
  scoreRank?: ScoreRank;
  rank?: number;
  mode?: Gamemode;
  beatmap?: OsuUserRecentBeatmapDetails;
  user: OsuUserRecentActivityUser;
  beatmapset?: OsuUserRecentBeatmapDetails;
}

export interface OsuUserRecentBeatmapDetails {
  title: string;
  url: string;
}

export interface OsuUserRecentActivityUser {
  username: string;
  url: string;
}

export interface OsuNews {
  cursor: OsuNewsCursor;
  news_posts: NewsPost[];
  news_sidebar: NewsSidebar;
  search: Search;
}

export interface OsuNewsCursor {
  published_at: Date;
  id: number;
}

export interface NewsPost {
  id: number;
  author: string;
  edit_url: string;
  first_image: string;
  published_at: Date;
  updated_at: Date;
  slug: string;
  title: string;
  preview?: string;
}

export interface NewsSidebar {
  current_year: number;
  news_posts: NewsPost[];
  years: number[];
}

export interface Search {
  limit: number;
  sort: string;
  year: null;
}

export interface OsuRanking {
  cursor: OsuRankingCursor;
  ranking: StatisticsElement[];
  total: number;
}

export interface OsuRankingCursor {
  page: number;
}

export interface StatisticsElement {
  level: Level;
  global_rank?: number;
  pp: number;
  ranked_score: number;
  hit_accuracy: number;
  play_count: number;
  play_time: number;
  total_score: number;
  total_hits: number;
  maximum_combo: number;
  replays_watched_by_others: number;
  is_ranked: boolean;
  grade_counts: GradeCounts;
  user?: UserCompact;
  country_rank?: number;
  rank?: Rank;
  variants?: Variant[];
}

export interface GradeCounts {
  ss: number;
  ssh: number;
  s: number;
  sh: number;
  a: number;
}

export interface Level {
  current: number;
  progress: number;
}

export interface Rank {
  country: number;
}

export interface Variant {
  mode: Gamemode;
  variant: string;
  country_rank: number;
  global_rank: number;
  pp: number;
}

export interface OsuBeatmap {
  beatmapset_id: number;
  difficulty_rating: number;
  id: number;
  mode: Gamemode;
  status: RankStatus;
  total_length: number;
  user_id: number;
  version: string;
  accuracy: number;
  ar: number;
  bpm: number;
  convert: boolean;
  count_circles: number;
  count_sliders: number;
  count_spinners: number;
  cs: number;
  deleted_at: null;
  drain: number;
  hit_length: number;
  is_scoreable: boolean;
  last_updated: Date;
  mode_int: number;
  passcount: number;
  playcount: number;
  ranked: number;
  url: string;
  checksum: string;
  beatmapset?: OsuBeatmapset;
  failtimes?: Failtimes;
  max_combo?: number | null;
}

export interface OsuBeatmapset {
  artist: string;
  artist_unicode: string;
  covers: Covers;
  creator: string;
  favourite_count: number;
  hype: null;
  id: number;
  nsfw: boolean;
  play_count: number;
  preview_url: string;
  source: string;
  status: RankStatus;
  title: string;
  title_unicode: string;
  track_id: number | null;
  user_id: number;
  video: boolean;
  availability: Availability;
  bpm: number;
  can_be_hyped: boolean;
  discussion_enabled: boolean;
  discussion_locked: boolean;
  is_scoreable: boolean;
  last_updated: Date;
  legacy_thread_url: string;
  nominations_summary: NominationsSummary;
  ranked: number;
  ranked_date: Date | null;
  storyboard: boolean;
  submitted_date: Date;
  tags: string;
  beatmaps?: OsuBeatmap[];
  ratings?: number[];
}

export interface Failtimes {
  fail: number[];
  exit: number[];
}

export interface Availability {
  download_disabled: boolean;
  more_information: null | string;
}

export interface Covers {
  cover: string;
  "cover@2x": string;
  card: string;
  "card@2x": string;
  list: string;
  "list@2x": string;
  slimcover: string;
  "slimcover@2x": string;
}

export interface NominationsSummary {
  current: number;
  required: number;
}

export interface OsuScore {
  id: number;
  user_id: number;
  accuracy: number;
  mods: Mods[];
  score: number;
  max_combo: number;
  passed: boolean;
  perfect: boolean;
  statistics: ScoreStatistics;
  rank: ScoreRank;
  created_at: Date;
  best_id: number | null;
  pp: number | null;
  mode: Gamemode;
  mode_int: number;
  replay: boolean;
  current_user_attributes: CurrentUserAttributes;
  beatmap: OsuBeatmap;
  beatmapset?: BeatmapsetCompact;
  weight?: Weight;
  user: UserCompact;
}

export interface BeatmapsetCompact {
  artist: string;
  artist_unicode: string;
  covers: Covers;
  creator: string;
  favourite_count: number;
  hype: null;
  id: number;
  nsfw: boolean;
  play_count: number;
  preview_url: string;
  source: string;
  status: RankStatus;
  title: string;
  title_unicode: string;
  track_id: number | null;
  user_id: number;
  video: boolean;
}

export interface Weight {
  percentage: number;
  pp: number;
}

export interface OsuUser extends UserCompact {
  cover_url: string;
  discord: null | string;
  has_supported: boolean;
  interests: null | string;
  join_date: Date;
  kudosu: Kudosu;
  location: null | string;
  max_blocks: number;
  max_friends: number;
  occupation: null | string;
  playmode: Gamemode;
  playstyle: string[];
  post_count: number;
  profile_order: string[];
  title: null | string;
  title_url: null | string;
  twitter: null | string;
  website: null | string;
  account_history: any[];
  active_tournament_banner: ProfileBanner | null;
  badges: Badge[];
  beatmap_playcounts_count: number;
  comments_count: number;
  favourite_beatmapset_count: number;
  follower_count: number;
  graveyard_beatmapset_count: number;
  groups: Group[];
  loved_beatmapset_count: number;
  mapping_follower_count: number;
  monthly_playcounts: Count[];
  page: Page;
  pending_beatmapset_count: number;
  previous_usernames: string[];
  ranked_beatmapset_count: number;
  replays_watched_counts: Count[];
  scores_best_count: number;
  scores_first_count: number;
  scores_pinned_count: number;
  scores_recent_count: number;
  statistics: StatisticsElement;
  support_level: number;
  user_achievements: UserAchievement[];
  rankHistory: RankHistory;
  rank_history: RankHistory;
  ranked_and_approved_beatmapset_count: number;
  unranked_beatmapset_count: number;
}

export interface ProfileBanner {
  id: number;
  tournament: number;
  image: string;
}

export interface Badge {
  awarded_at: Date;
  description: string;
  image_url: string;
  url: string;
}

export interface Group {
  colour: string;
  has_listing: boolean;
  has_playmodes: boolean;
  id: number;
  identifier: string;
  is_probationary: boolean;
  name: string;
  short_name: string;
  playmodes: Gamemode[];
}

export interface Kudosu {
  total: number;
  available: number;
}

export interface Count {
  start_date: Date;
  count: number;
}

export interface RankHistory {
  mode: Gamemode;
  data: number[];
}

export interface Page {
  html: string;
  raw: string;
}

export interface UserAchievement {
  achieved_at: Date;
  achievement_id: number;
}

export interface CodeExchangeSchema {
  token_type: "Bearer";
  expires_in: number;
  access_token: string;
  refresh_token?: string;
}
