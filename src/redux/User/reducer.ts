import { createReducer } from "@reduxjs/toolkit";
import { Status } from "src/libs/enums/status";
import { User } from "src/libs/types/user";
import { getCurrentUser } from "./action";

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

const UserReducer = createReducer(initialState, (builder) => {
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
    });
});

export default UserReducer;
