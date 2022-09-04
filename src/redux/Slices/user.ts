import { Status } from "@libs/enums/status";
import { User } from "@libs/types/user";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface StateInterface {
  currentUser: {
    data: User;
    status: Status;
  };
}

const initialState: StateInterface = {
  currentUser: {
    data: {} as User,
    status: Status.EMPTY,
  },
};

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.currentUser = {
          ...state.currentUser,
          status: Status.PENDING,
        };
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.currentUser = {
          status: Status.SUCCESS,
          data: action.payload as User,
        };
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.currentUser = {
          ...state.currentUser,
          data: {} as User,
          status: Status.ERROR,
        };
      }).addCase;
  },
});

export const UserActions = UserSlice.actions;

const GET_CURRENT_USER = "USER/GET_CURRENT_USER";
const getCurrentUser = createAsyncThunk(
  GET_CURRENT_USER,
  async (userId: string) => {
    try {
      //TODO: fetch user from api
      const user: User = {
        description: "",
        details: {
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
        avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
      };
      return user;
    } catch (err) {
      console.error(err);
      return {};
    }
  }
);
