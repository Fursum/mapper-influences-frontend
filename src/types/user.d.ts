import { Influence } from "./influence.d";

export interface UserBase {
  id: number;
  username: string;
}

export interface User extends UserBase {
  details: UserDetails;
  description: string;
  influences: Influence[];
}

export type UserDetails = {
  avatarUrl: string;
  graveyardCount: number;
  pendingCount: number;
  rankedCount: number;
  lovedCount: number;
  followerCount: number;
  subCount: number;
}
