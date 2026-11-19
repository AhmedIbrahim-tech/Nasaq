import { createAsyncThunk } from "@reduxjs/toolkit";
import { CurrentUserResponse } from "../../types";
import { getCurrentUser } from "../../services/auth.service";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/errors";
import { refreshThunk } from "./refresh.thunk";

/**
 * Async Thunk to retrieve the currently authenticated user's information from Backend (/api/v1/auth/me).
 * - Reads tokens directly from Redux state.
 * - Proactively rotates expired access token via refreshThunk before calling backend.
 * - Recovers silently if backend returns 401 due to clock skew or server desync.
 * - Guards against session modifications during in-flight fetch.
 */
export const meThunk = createAsyncThunk<
  CurrentUserResponse,
  void,
  {
    state: {
      auth: {
        accessToken: string | null;
        refreshToken: string | null;
        accessTokenExpiresAtUtc: string | null;
        refreshTokenExpiresAtUtc: string | null;
        sessionId: string | null;
      };
    };
    rejectValue: NormalizedApiError;
  }
>("auth/me", async (_, { getState, dispatch, rejectWithValue }) => {
  const { auth } = getState();
  const initialSessionId = auth.sessionId;
  let tokenToUse = auth.accessToken;

  if (!tokenToUse || !initialSessionId) {
    const error: NormalizedApiError = {
      status: 401,
      code: "UNAUTHORIZED",
      message: "No active session available in state.",
    };
    return rejectWithValue(error);
  }

  const now = Date.now();
  const isAccessTokenExpired = Boolean(
    auth.accessTokenExpiresAtUtc &&
      new Date(auth.accessTokenExpiresAtUtc).getTime() - 30_000 <= now
  );

  const isRefreshTokenValid = Boolean(
    auth.refreshToken &&
      auth.refreshTokenExpiresAtUtc &&
      new Date(auth.refreshTokenExpiresAtUtc).getTime() > now
  );

  // If access token is expired but refresh token is valid, rotate token first
  if (isAccessTokenExpired && isRefreshTokenValid) {
    const refreshAction = await dispatch(refreshThunk());
    if (refreshThunk.fulfilled.match(refreshAction)) {
      tokenToUse = refreshAction.payload.accessToken;
    } else {
      return rejectWithValue(
        refreshAction.payload || {
          status: 401,
          code: "UNAUTHORIZED",
          message: "Session expired. Please log in again.",
        }
      );
    }
  }

  try {
    const user = await getCurrentUser(tokenToUse);

    // Guard: check that session was not modified or logged out during network call
    const currentSessionId = getState().auth.sessionId;
    if (currentSessionId !== initialSessionId) {
      const error: NormalizedApiError = {
        status: 401,
        code: "UNAUTHORIZED",
        message: "Session was modified during user info fetch.",
      };
      return rejectWithValue(error);
    }

    return user;
  } catch (error: unknown) {
    const normalized = normalizeApiError(error);

    // If backend rejected token with 401 and refresh token is still valid, attempt one silent retry
    if (normalized.status === 401 && isRefreshTokenValid) {
      const refreshAction = await dispatch(refreshThunk());
      if (refreshThunk.fulfilled.match(refreshAction)) {
        try {
          const retriedUser = await getCurrentUser(refreshAction.payload.accessToken);
          return retriedUser;
        } catch (retryError) {
          return rejectWithValue(normalizeApiError(retryError));
        }
      }
    }

    return rejectWithValue(normalized);
  }
});


