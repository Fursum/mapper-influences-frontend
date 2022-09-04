import { createSlice } from "@reduxjs/toolkit";

type StateType = {
  isAdmin: boolean;
} | null;

const initialState: StateType = null;

export const SessionSlice = createSlice({
  name: "session",
  initialState: initialState as StateType,
  reducers: {
    login: (state) => ({ isAdmin: true }),
    logout: (state) => null,
  },
});

export const SessionActions = SessionSlice.actions;
