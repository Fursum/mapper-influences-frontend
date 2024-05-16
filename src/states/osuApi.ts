import { create } from "zustand";
import { Client, type UserExtended } from "osu-web.js";

type OsuApiState = {
  osuSdk: null | Client;
  setOsuSdk: (apiKey: string) => void;
  resetOsuSdk: () => void;
  getUser: (username: string | undefined) => Promise<UserExtended>;
};

export const useOsuApi = create<OsuApiState>((set, get) => ({
  osuSdk: null,
  setOsuSdk: (apiKey: string) => {
    const client = new Client(apiKey);
    set({ osuSdk: client });
  },
  resetOsuSdk: () => set({ osuSdk: null }),
  getUser: async (username: string | undefined) => {
    const { osuSdk } = get();
    if (!osuSdk) throw new Error("osu! sdk not initialized");
    if (username) return osuSdk.users.getUser(username);
    return osuSdk.users.getSelf();
  },
}));
