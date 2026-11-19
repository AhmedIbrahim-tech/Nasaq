import { createAsyncThunk } from "@reduxjs/toolkit";
import { LoginRequest } from "../../types";
import { login } from "../../services/auth.service";
import {
  coordinateLogin,
  AuthenticatedPayload,
} from "../../services/sessionCoordinator";
import { classifyAuthError, ClassifiedAuthError } from "../../utils/authErrorClassifier";

/**
 * Async Thunk for authenticating with ASP.NET Core Backend.
 * Uses sessionCoordinator to establish unique session identity and atomic persistence under Web Lock.
 */
export const loginThunk = createAsyncThunk<
  AuthenticatedPayload,
  LoginRequest,
  { rejectValue: ClassifiedAuthError }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const rawResult = await login(credentials);
    if (rawResult.requiresPasswordChange) {
      return {
        ...rawResult,
        sessionId: "",
        sessionRevision: 0,
      };
    }
    const coordinatedResult = await coordinateLogin(rawResult);
    return coordinatedResult;
  } catch (error: unknown) {
    return rejectWithValue(classifyAuthError(error));
  }
});


