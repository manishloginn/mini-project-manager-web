import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PublicUser } from "@/lib/types";

type AuthState = {
  token: string | null;
  user: PublicUser | null;
  hydrated: boolean;
};

const initialState: AuthState = {
  token: null,
  user: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<{ accessToken: string; user: PublicUser }>) {
      state.token = action.payload.accessToken;
      state.user = action.payload.user;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setUser(state, action: PayloadAction<PublicUser>) {
      state.user = action.payload;
    },
    markHydrated(state) {
      state.hydrated = true;
    },
    clearSession(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setSession, setToken, setUser, markHydrated, clearSession } = authSlice.actions;
export default authSlice.reducer;
