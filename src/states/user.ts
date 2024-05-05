import type { UserBaseResponse } from "@services/user";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type SessionStore = {
  user?: UserBaseResponse;
  login: (user: UserBaseResponse) => void;
  logout: () => void;
};

export const useSessionStore = create<SessionStore>()(
  devtools(
    persist(
      (set) => ({
        login: (user) => set({ user: user }),
        logout: () => set({ user: undefined }),
      }),
      { name: "userStore" }
    )
  )
);
