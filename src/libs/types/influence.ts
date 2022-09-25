import { MapInfo, UserBase } from "./user";

export enum InfluenceTypeEnum {
  Respect = "Respect",
  Fascination = "Fascination",
  Implementation = "Implementation",
}
export const InfluenceOrder = [
  InfluenceTypeEnum.Respect,
  InfluenceTypeEnum.Fascination,
  InfluenceTypeEnum.Implementation,
];

export interface Influence {
  profileData: UserBase;
  description: string;
  lastUpdated: number;
  type: InfluenceTypeEnum;
  strength: 1 | 2 | 3;
  maps: MapInfo[];
}

export type ProfileInfoIcons =
  | "Followers"
  | "Subscribers"
  | "Influences"
  | "Ranked"
  | "Loved"
  | "Pending"
  | "Graved";

export type NewsType = {
  fullText: string;
  title: string;
  date: string;
  desc: string;
};

export type LeaderboardType = {
  user: UserBase;
  number: number;
};
