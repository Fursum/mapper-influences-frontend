import { UserBase } from "./user";

export enum InfluenceTypeEnum {
  respect = "Respect",
  fascination = "Fascination",
  implementation = "Implementation",
}

export interface Influence {
  profileData: UserBase;
  description: string;
  lastUpdated: number;
  type: InfluenceTypeEnum;
}
