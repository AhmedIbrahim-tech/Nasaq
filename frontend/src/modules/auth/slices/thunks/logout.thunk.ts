import { createAsyncThunk } from "@reduxjs/toolkit";
import { logout } from "../../services/auth.service";
import { coordinateLogout } from "../../services/sessionCoordinator";
import { axiosErrorHandler } from "@/lib/api/errors";
import { invalidateInFlightRefresh } from "./refresh.thunk";
import { clearAuth } from "../auth.slice";

/**
 * Async Thunk for authenticating logout:
 * 1. Reads refreshToken from Redux state first before state is cleared.
 * 2. Invalidates any in-flight refresh requests in this tab.
 * 3. Coordinates logout across tabs via sessionCoordinator under Web Lock.
 * 4. Clears local Redux state immediately with incremented sessionRevision.
 * 5. Calls Backend logout service to revoke the refresh token on the server.
 */
export const logoutThunk = createAsyncThunk<
  number,
  void,
  {
    state: { auth: { refreshToken: string | null } };
    rejectValue: string;
  }
>("auth/logout", async (_, { dispatch, getState, rejectWithValue }) => {
  // 1. Capture the refresh token first
  const { auth } = getState();
  const refreshToken = auth.refreshToken;

  // 2. Invalidate any in-flight refresh requests in this tab
  invalidateInFlightRefresh();

  // 3. Coordinate logout across tabs under Web Lock and revoke token on Backend
  try {
    const finalRevision = await coordinateLogout({
      refreshToken,
      onExecuteLogout: (token) => logout(token),
    });

    // 4. Update local Redux state with final revision
    dispatch(clearAuth({ sessionRevision: finalRevision }));

    return finalRevision;
  } catch (error: unknown) {
    dispatch(clearAuth());
    return rejectWithValue(axiosErrorHandler(error));
  }
});

