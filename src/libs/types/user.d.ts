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
  influences: Influence[];
}

export type UserDetails = {
  graveyardCount: number;
  pendingCount: number;
  rankedCount: number;
  lovedCount: number;
  followerCount: number;
  subCount: number;
};
