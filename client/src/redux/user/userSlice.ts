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
  currentUser: userObj | null;
  error: string;
  loading: boolean;
}

const initialState: UserState = {
  currentUser: null,
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
    signInSuccess: (state, action: PayloadAction<userObj>) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = "";
    },
    signInFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateAvatarUrl: (state, action: PayloadAction<string>) => {
      if (state.currentUser && state.currentUser.profile) {
        state.currentUser.profile.avatarUrl = action.payload;
      }
    },
  },
});

export const { signInFailure, signInStart, signInSuccess, updateAvatarUrl } =
  userSlice.actions;

export default userSlice.reducer;
