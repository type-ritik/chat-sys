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

interface UserData {
  userData: {
    id: string;
    name: string;
    isAdmin: boolean;
    username: string;
    profile: {
      id: string;
      bio: string;
      avatarUrl: string;
      isActive: boolean;
    };
  };
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
    logOut: (state) => {
      state.currentUser = null;
      state.error = "";
      state.loading = false;
    },
    updateCurrentUser: (state, action: PayloadAction<UserData>) => {
      // if (state.currentUser && state.currentUser.profile) {
      //   state.currentUser.profile.bio = action.payload.profile.bio;
      //   state.currentUser.profile.avatarUrl = action.payload.profile.avatarUrl;
      //   state.currentUser.profile.isActive = action.payload.profile.isActive;
      //   state.currentUser.id = action.payload.id;
      //   state.currentUser.name = action.payload.name;
      //   state.currentUser.username = action.payload.username;
      //   state.currentUser.isAdmin = action.payload.isAdmin;
      // }
      if (state.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          id: action.payload.userData.id,
          name: action.payload.userData.name,
          username: action.payload.userData.username,
          isAdmin: action.payload.userData.isAdmin,
          profile: {
            id: action.payload.userData.profile.id,
            bio: action.payload.userData.profile.bio,
            avatarUrl: action.payload.userData.profile.avatarUrl,
            isActive: action.payload.userData.profile.isActive,
          },
          status: state.currentUser.status,
          createdAt: state.currentUser.createdAt,
          token: state.currentUser.token,
        };
      }
    },
  },
});

export const {
  signInFailure,
  signInStart,
  signInSuccess,
  updateAvatarUrl,
  updateCurrentUser,
  logOut,
} = userSlice.actions;

export default userSlice.reducer;
