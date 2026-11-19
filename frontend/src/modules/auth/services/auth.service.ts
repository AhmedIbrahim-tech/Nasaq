import { api } from "@/lib/api/api";
import { Router } from "@/lib/api/router";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/errors";
import type { GenericBaseResponse } from "@/shared/types/api.types";
import {
  LoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  AuthResponse,
  CurrentUserResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  FirstLoginChangePasswordRequest,
} from "../types";


/**
 * Sends login credentials to ASP.NET Core Backend
 * Returns the full AuthResponse payload
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await api.post<GenericBaseResponse<AuthResponse>>(
      Router.Auth.Login,
      data,
      {
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 400 || status === 401,
      }
    );

    if (response.status === 400 || response.status === 401) {
      const customError: NormalizedApiError = {
        status: response.status,
        code: "AUTH_FAILED",
        message: response.data?.message || "Invalid credentials.",
        errors: response.data?.errors || undefined,
      };
      throw customError;
    }

    const result = response.data;

    if (!result.succeeded || !result.data) {
      const customError: NormalizedApiError = {
        status: result.statusCode || 400,
        code: "AUTH_FAILED",
        message: result.message || "Invalid credentials.",
        errors: result.errors || undefined,
      };
      throw customError;
    }

    return result.data;
  } catch (error: unknown) {
    if ((error as NormalizedApiError)?.code === "AUTH_FAILED") {
      throw error;
    }
    throw normalizeApiError(error);
  }
}

/**
 * Refreshes authentication session by sending refreshToken to Backend
 */
export async function refreshSession(refreshToken: string): Promise<AuthResponse> {
  if (!refreshToken) {
    const error: NormalizedApiError = {
      status: 401,
      code: "UNAUTHORIZED",
      message: "No refresh token provided.",
    };
    throw error;
  }

  try {
    const requestPayload: RefreshTokenRequest = { refreshToken };

    const response = await api.post<GenericBaseResponse<AuthResponse>>(
      Router.Auth.Refresh,
      requestPayload,
      {
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 400 || status === 401,
      }
    );

    if (response.status === 400 || response.status === 401) {
      const customError: NormalizedApiError = {
        status: response.status,
        code: "UNAUTHORIZED",
        message: response.data?.message || "Session expired. Please log in again.",
        errors: response.data?.errors || undefined,
      };
      throw customError;
    }

    const result = response.data;

    if (!result.succeeded || !result.data) {
      const customError: NormalizedApiError = {
        status: result.statusCode || 401,
        code: "UNAUTHORIZED",
        message: result.message || "Session expired. Please log in again.",
        errors: result.errors || undefined,
      };
      throw customError;
    }

    return result.data;
  } catch (error: unknown) {
    if ((error as NormalizedApiError)?.code === "UNAUTHORIZED") {
      throw error;
    }
    throw normalizeApiError(error);
  }
}

/**
 * Retrieves the currently authenticated user's details from Backend (/api/v1/auth/me)
 */
export async function getCurrentUser(accessToken: string): Promise<CurrentUserResponse> {
  if (!accessToken) {
    const error: NormalizedApiError = {
      status: 401,
      code: "UNAUTHORIZED",
      message: "No access token provided.",
    };
    throw error;
  }

  try {
    const response = await api.get<GenericBaseResponse<CurrentUserResponse>>(
      Router.Auth.Me,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 401,
      }
    );

    if (response.status === 401) {
      const customError: NormalizedApiError = {
        status: 401,
        code: "UNAUTHORIZED",
        message: response.data?.message || "Authentication token has expired or is invalid.",
      };
      throw customError;
    }

    const result = response.data;

    if (!result.succeeded || !result.data) {
      const customError: NormalizedApiError = {
        status: result.statusCode || 401,
        code: "UNAUTHORIZED",
        message: result.message || "Failed to retrieve current user.",
        errors: result.errors || undefined,
      };
      throw customError;
    }

    return result.data;
  } catch (error: unknown) {
    if ((error as NormalizedApiError)?.code === "UNAUTHORIZED") {
      throw error;
    }
    throw normalizeApiError(error);
  }
}

/**
 * Sends a logout request to revoke the refresh token on the Backend
 */
export async function logout(refreshToken?: string | null): Promise<void> {
  if (!refreshToken) {
    return;
  }

  try {
    const requestPayload: LogoutRequest = { refreshToken };

    await api.post<GenericBaseResponse<object | null>>(
      Router.Auth.Logout,
      requestPayload
    );
  } catch (error: unknown) {
    normalizeApiError(error);
  }
}

/**
 * Updates authenticated user profile details (safe self-service edit)
 * PUT /api/v1/auth/me/profile
 */
export async function updateProfile(
  data: UpdateProfileRequest,
  accessToken?: string | null
): Promise<CurrentUserResponse> {
  if (!accessToken) {
    const customError: NormalizedApiError = {
      status: 401,
      code: "UNAUTHORIZED",
      message: "Authentication token missing.",
    };
    throw customError;
  }

  try {
    const response = await api.put<GenericBaseResponse<CurrentUserResponse>>(
      Router.Auth.Profile,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const result = response.data;
    if (!result.succeeded || !result.data) {
      const customError: NormalizedApiError = {
        status: result.statusCode || 400,
        code: "UPDATE_PROFILE_FAILED",
        message: result.message || "Failed to update profile.",
        errors: result.errors || undefined,
      };
      throw customError;
    }

    return result.data;
  } catch (error: unknown) {
    if ((error as NormalizedApiError)?.code === "UPDATE_PROFILE_FAILED") {
      throw error;
    }
    throw normalizeApiError(error);
  }
}

/**
 * Changes authenticated user password, revoking other sessions
 * POST /api/v1/auth/me/change-password
 */
export async function changePassword(
  data: ChangePasswordRequest,
  accessToken?: string | null
): Promise<void> {
  if (!accessToken) {
    const customError: NormalizedApiError = {
      status: 401,
      code: "UNAUTHORIZED",
      message: "Authentication token missing.",
    };
    throw customError;
  }

  try {
    const response = await api.post<GenericBaseResponse<object | null>>(
      Router.Auth.ChangePassword,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const result = response.data;
    if (!result.succeeded) {
      const customError: NormalizedApiError = {
        status: result.statusCode || 400,
        code: "CHANGE_PASSWORD_FAILED",
        message: result.message || "Failed to change password.",
        errors: result.errors || undefined,
      };
      throw customError;
    }
  } catch (error: unknown) {
    if ((error as NormalizedApiError)?.code === "CHANGE_PASSWORD_FAILED") {
      throw error;
    }
    throw normalizeApiError(error);
  }
}

/**
 * Changes password on first login using temporary setupToken
 * POST /api/v1/auth/first-login-change-password
 */
export async function firstLoginChangePassword(
  data: FirstLoginChangePasswordRequest
): Promise<AuthResponse> {
  try {
    const response = await api.post<GenericBaseResponse<AuthResponse>>(
      Router.Auth.FirstLoginChangePassword,
      data
    );

    const result = response.data;
    if (!result.succeeded || !result.data) {
      const customError: NormalizedApiError = {
        status: result.statusCode || 400,
        code: "FIRST_LOGIN_CHANGE_PASSWORD_FAILED",
        message: result.message || "Failed to change temporary password.",
        errors: result.errors || undefined,
      };
      throw customError;
    }

    return result.data;
  } catch (error: unknown) {
    if ((error as NormalizedApiError)?.code === "FIRST_LOGIN_CHANGE_PASSWORD_FAILED") {
      throw error;
    }
    throw normalizeApiError(error);
  }
}


