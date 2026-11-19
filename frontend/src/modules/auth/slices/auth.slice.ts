import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TLoading } from "@/shared/types/loading.types";
import { AuthUserResponse, CurrentUserResponse, AuthResponse } from "../types";
import { AuthenticatedPayload } from "../services/sessionCoordinator";
import { loginThunk } from "./thunks/login.thunk";
import { refreshThunk } from "./thunks/refresh.thunk";
import { logoutThunk } from "./thunks/logout.thunk";
import { meThunk } from "./thunks/me.thunk";

export type AuthUser = AuthUserResponse | CurrentUserResponse;

export interface AuthState {
  user: AuthUser | null;
  roles: string[];
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAtUtc: string | null;
  refreshTokenExpiresAtUtc: string | null;
  sessionId: string | null;
  sessionRevision: number;
  loading: TLoading;
  error: string | null;
  requiresPasswordChange: boolean;
  setupToken: string | null;
}

const initialState: AuthState = {
  user: null,
  roles: [],
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAtUtc: null,
  refreshTokenExpiresAtUtc: null,
  sessionId: null,
  sessionRevision: 0,
  loading: "idle",
  error: null,
  requiresPasswordChange: false,
  setupToken: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (
      state,
      action: PayloadAction<
        AuthResponse & { sessionId?: string | null; sessionRevision?: number }
      >
    ) => {
      state.user = action.payload.user;
      state.roles = action.payload.roles;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.accessTokenExpiresAtUtc = action.payload.accessTokenExpiresAtUtc;
      state.refreshTokenExpiresAtUtc = action.payload.refreshTokenExpiresAtUtc;
      state.sessionId = action.payload.sessionId ?? null;
      state.sessionRevision =
        action.payload.sessionRevision ?? state.sessionRevision + 1;
      state.requiresPasswordChange = false;
      state.setupToken = null;
      state.loading = "succeeded";
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<TLoading>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.loading = "failed";
      }
    },
    clearAuth: (
      state,
      action: PayloadAction<{ sessionRevision?: number } | undefined>
    ) => {
      state.user = null;
      state.roles = [];
      state.accessToken = null;
      state.refreshToken = null;
      state.accessTokenExpiresAtUtc = null;
      state.refreshTokenExpiresAtUtc = null;
      state.sessionId = null;
      state.requiresPasswordChange = false;
      state.setupToken = null;
      if (action.payload?.sessionRevision) {
        state.sessionRevision = action.payload.sessionRevision;
      }
      state.loading = "idle";
      state.error = null;
    },
    clearSetupToken: (state) => {
      state.requiresPasswordChange = false;
      state.setupToken = null;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Thunk
      .addCase(loginThunk.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<AuthenticatedPayload>) => {
        state.loading = "succeeded";
        if (action.payload.requiresPasswordChange) {
          state.requiresPasswordChange = true;
          state.setupToken = action.payload.setupToken ?? null;
          state.user = action.payload.user;
          state.roles = action.payload.roles;
          state.accessToken = null;
          state.refreshToken = null;
          state.accessTokenExpiresAtUtc = null;
          state.refreshTokenExpiresAtUtc = null;
          state.sessionId = null;
          state.sessionRevision = 0;
          state.error = null;
          return;
        }
        state.requiresPasswordChange = false;
        state.setupToken = null;
        state.user = action.payload.user;
        state.roles = action.payload.roles;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.accessTokenExpiresAtUtc = action.payload.accessTokenExpiresAtUtc;
        state.refreshTokenExpiresAtUtc = action.payload.refreshTokenExpiresAtUtc;
        state.sessionId = action.payload.sessionId;
        state.sessionRevision = action.payload.sessionRevision;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = "failed";
        state.error =
          action.payload?.serverMessage ||
          action.payload?.category ||
          (typeof action.payload === 'string' ? action.payload : "Authentication failed.");
      })
      // Refresh Thunk
      .addCase(refreshThunk.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(refreshThunk.fulfilled, (state, action: PayloadAction<AuthenticatedPayload>) => {
        // If user logged out while refresh was in flight, do not restore old session
        if (!state.refreshToken && !state.user) {
          return;
        }
        state.loading = "succeeded";
        state.user = action.payload.user;
        state.roles = action.payload.roles;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.accessTokenExpiresAtUtc = action.payload.accessTokenExpiresAtUtc;
        state.refreshTokenExpiresAtUtc = action.payload.refreshTokenExpiresAtUtc;
        state.sessionId = action.payload.sessionId;
        state.sessionRevision = action.payload.sessionRevision;
        state.error = null;
      })
      .addCase(refreshThunk.rejected, (state, action) => {
        // If already logged out, do not alter logged out state
        if (!state.refreshToken && !state.user) {
          return;
        }
        state.loading = "failed";
        state.error = action.payload?.message || action.error.message || "Session refresh failed.";

        // Clear auth state only when the Backend definitively rejects/revokes the Refresh Token
        const isDefinitive =
          action.payload?.status === 401 ||
          action.payload?.status === 400 ||
          action.payload?.code === "UNAUTHORIZED" ||
          action.payload?.code === "AUTH_FAILED";

        if (isDefinitive) {
          state.user = null;
          state.roles = [];
          state.accessToken = null;
          state.refreshToken = null;
          state.accessTokenExpiresAtUtc = null;
          state.refreshTokenExpiresAtUtc = null;
          state.sessionId = null;
        }
      })
      // Logout Thunk
      .addCase(logoutThunk.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = "idle";
        state.sessionId = null;
        if (typeof action.payload === "number") {
          state.sessionRevision = action.payload;
        }
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.loading = "idle";
        state.sessionId = null;
        state.error = action.payload || "Logout failed on server.";
      })
      // Me Thunk
      .addCase(meThunk.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(meThunk.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.user = action.payload;
        state.roles = action.payload.roles;
        state.error = null;
      })
      .addCase(meThunk.rejected, (state, action) => {
        state.loading = "failed";
        state.error =
          action.payload?.message ||
          action.error.message ||
          "Failed to retrieve current user.";
      });
  },
});

export const { setAuthenticated, setLoading, setError, clearAuth, clearSetupToken, updateUserProfile } = authSlice.actions;

export const authReducer = authSlice.reducer;
export default authSlice.reducer;



