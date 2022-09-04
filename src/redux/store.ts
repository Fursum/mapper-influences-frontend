import { combineReducers, configureStore, Middleware } from "@reduxjs/toolkit";
import { SessionSlice } from "./Slices/session";
import { UserSlice } from "./Slices/user";

const reducer = combineReducers({
  user: UserSlice.reducer,
  session: SessionSlice.reducer,
});

const logger: Middleware = (store) => (next) => (action) => {
  console.log("dispatching", action);
  let result = next(action);
  console.log("next state", store.getState());
  return result;
};

const store = configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
