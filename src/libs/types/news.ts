export enum NewsType {
  UPDATE,
  ANNOUNCEMENT,
}

export type NewsPost = {
  id?: string;
  title: string;
  type: string;
  shortDesc: string;
  fullPost: string;
};
