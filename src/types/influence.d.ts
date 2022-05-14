import { UserBase } from "./user";

export interface Influence {
  profileData: UserBase
  description: string;
  lastUpdated: number;
  affection: number;
}
