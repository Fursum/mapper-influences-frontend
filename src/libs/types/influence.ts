import { UserBase } from "./user";

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
}

export type ProfileInfoIcons =
  | "Followers"
  | "Subscribers"
  | "Influences"
  | "Ranked"
  | "Loved"
  | "Pending"
  | "Graved";
