export type ProfileInfoIcons =
  | 'Followers'
  | 'Subscribers'
  | 'Influences'
  | 'Ranked'
  | 'Loved'
  | 'Pending'
  | 'Graved';

export type NewsType = {
  fullText: string;
  title: string;
  date: string;
  desc: string;
};

export type LeaderboardType = {
  user: any;
  number: number;
};
