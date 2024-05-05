import type { UserBaseResponse } from "@services/user";

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
  user: UserBaseResponse;
  number: number;
};
