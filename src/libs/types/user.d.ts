import { Influence } from "./influence";

export interface UserBase {
  id: number;
  username: string;
  avatarUrl: string;
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
