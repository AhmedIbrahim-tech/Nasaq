import { createAsyncThunk } from "@reduxjs/toolkit";
import { refreshSession } from "../../services/auth.service";
import {
  coordinateRefresh,
  AuthenticatedPayload,
} from "../../services/sessionCoordinator";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/errors";

// Module-level in-flight promise to prevent duplicate concurrent refresh requests in the same browser tab
let inFlightRefreshPromise: Promise<AuthenticatedPayload> | null = null;
let activeSessionEpoch = 0;

/**
 * Invalidates any in-flight refresh request (e.g. called during logout).
 */
export function invalidateInFlightRefresh(): void {
  inFlightRefreshPromise = null;
  activeSessionEpoch++;
}

/**
 * Async Thunk to refresh authentication session using token rotation.
 * - Deduplicates concurrent calls in the same tab.
 * - Coordinates across browser tabs via sessionCoordinator under Web Lock.
 * - Reuses rotated tokens without calling Backend if another tab already rotated them.
 */
export const refreshThunk = createAsyncThunk<
  AuthenticatedPayload,
  void,
  {
    state: { auth: { refreshToken: string | null; sessionId: string | null } };
    rejectValue: NormalizedApiError;
  }
>("auth/refresh", async (_, { getState, rejectWithValue }) => {
  const { auth } = getState();
  const initialRefreshToken = auth.refreshToken;
  const initialSessionId = auth.sessionId;

  if (!initialRefreshToken) {
    const error: NormalizedApiError = {
      status: 401,
      code: "UNAUTHORIZED",
      message: "No refresh token available in state.",
    };
    return rejectWithValue(error);
  }

  const currentLocalCancelToken = activeSessionEpoch;

  try {
    if (!inFlightRefreshPromise) {
      inFlightRefreshPromise = coordinateRefresh({
        initialRefreshToken,
        initialSessionId,
        onExecuteRefresh: (token) => refreshSession(token),
      }).finally(() => {
        inFlightRefreshPromise = null;
      });
    }

    const response = await inFlightRefreshPromise;

    // Verify session wasn't terminated locally during in-flight call
    if (
      activeSessionEpoch !== currentLocalCancelToken ||
      !getState().auth.refreshToken
    ) {
      const error: NormalizedApiError = {
        status: 401,
        code: "UNAUTHORIZED",
        message: "Session was terminated during refresh.",
      };
      throw error;
    }

    return response;
  } catch (error: unknown) {
    return rejectWithValue(normalizeApiError(error));
  }
});

