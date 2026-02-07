import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface userObj {
  id: string;
  name: string;
  username: string;
  isAdmin: boolean;
  status: string;
  createdAt: Date;
  profile: {
    id: string;
    bio: string;
    avatarUrl: string;
    isActive: boolean;
  };
  token: string;
}

export interface UserState {
  currentUser: userObj | object;
  error: string;
  loading: boolean;
}

const initialState: UserState = {
  currentUser: {},
  error: "",
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = "";
    },
    signInSuccess: (state, action: PayloadAction<object>) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = "";
    },
    signInFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { signInFailure, signInStart, signInSuccess } = userSlice.actions;

export default userSlice.reducer;
