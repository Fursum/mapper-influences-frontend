import { Influence } from "./influence";
import { Group } from "./IOsuApi";

export interface UserBase {
  id: number;
  username: string;
  avatarUrl: string;
  groups?: Group[];
}

export interface User extends UserBase {
  details: UserDetails;
  description: string;
  maps: MapInfo[];
  influences: Influence[];
  mentions: UserBase[];
}

export type UserDetails = {
  graveyardCount: number;
  pendingCount: number;
  rankedCount: number;
  lovedCount: number;
  followerCount: number;
  subCount: number;
};

export type MapInfo = {
  title: string;
  artist: string;
  diff: string;
  backgroundUrl: string;
  mapUrl: string;
};
