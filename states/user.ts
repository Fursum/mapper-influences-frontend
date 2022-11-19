import create from "zustand";
import { devtools } from "zustand/middleware";
import { User } from "@libs/types/user";

type SessionStore = {
  authKey?: string;
  user?: User;
  login: (user: User, key: string) => void;
};

export const useSessionStore = create<SessionStore>()(
  devtools((set) => ({
    user: undefined,
    login: (user, key) => set({ user: user, authKey: key }),
  }))
);
