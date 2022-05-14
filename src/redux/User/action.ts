import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { User } from "src/types/user";
import { GET_CURRENT_USER } from "./type";

export const getCurrentUser = createAsyncThunk(
  GET_CURRENT_USER,
  async (userId: string) => {
    try {
      //TODO: fetch user from api
      const user: User = {
        description: "",
        details: {
          avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
          followerCount: 1,
          graveyardCount: 1,
          lovedCount: 0,
          pendingCount: 1,
          rankedCount: 0,
          subCount: 2,
        },
        id: 1234,
        influences: [],
        username: "Fursum",
      };
      return user;
    } catch (err) {
      console.error(err);
      return {};
    }
  }
);
