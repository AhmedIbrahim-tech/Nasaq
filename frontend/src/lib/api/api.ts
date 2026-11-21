import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { store } from "@/store";
import { refreshThunk } from "@/modules/auth/slices/thunks/refresh.thunk";
import sessionTerminationService from "@/modules/auth/services/sessionTermination.service";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:7155",
  timeout: 15000,
});

// Request Interceptor: automatically inject Bearer accessToken and Accept-Language if available
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.headers.Authorization) {
    try {
      const token = store.getState()?.auth?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore store access errors during early initialization
    }
  }

  if (!config.headers["Accept-Language"]) {
    try {
      if (typeof window !== "undefined") {
        const lang = localStorage.getItem("corestarter_lang") || "en";
        config.headers["Accept-Language"] = lang;
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return config;
});

// Shared single in-flight promise for concurrent token rotation across multiple failed 401 requests
let refreshPromise: Promise<string | null> | null = null;

// Response Interceptor: handles 401 authentication rejection, silent token refresh, and session termination
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const url = (originalRequest?.url || "").toLowerCase();

    // 1. If not 401, or no original request, or already terminating, pass error through
    if (status !== 401 || !originalRequest || sessionTerminationService.isTerminating()) {
      return Promise.reject(error);
    }

    // 2. Skip authentication interceptor for auth endpoints where 401 is an expected business response
    const isLoginEndpoint = url.includes("/auth/login");
    const isFirstLoginEndpoint = url.includes("/auth/first-login-change-password");
    const isLogoutEndpoint = url.includes("/auth/logout");
    // Auxiliary file/photo downloads must never terminate the user session on failure
    const isFileDownloadEndpoint = url.includes("/files/") && url.includes("/download");

    if (isLoginEndpoint || isFirstLoginEndpoint || isLogoutEndpoint || isFileDownloadEndpoint) {
      return Promise.reject(error);
    }

    // 3. If the request that failed with 401 was the refresh endpoint ITSELF:
    // That means refresh credentials are conclusively invalid or expired
    const isRefreshEndpoint = url.includes("/auth/refresh");
    if (isRefreshEndpoint) {
      const errorData = error.response?.data as any;
      const message = (errorData?.message || "").toLowerCase();
      const reason = message.includes("deactivat")
        ? "account_deactivated"
        : message.includes("revok")
        ? "session_revoked"
        : "session_expired";

      await sessionTerminationService.triggerTermination({
        reason,
        message: errorData?.message,
      });
      return Promise.reject(error);
    }

    // 4. For any other protected endpoint:
    // If request has already been retried once, do not loop
    if (originalRequest._retry) {
      await sessionTerminationService.triggerTermination({ reason: "session_expired" });
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Check auth state
    let hasRefreshToken = false;
    let requiresPasswordChange = false;

    try {
      const state = store.getState();
      hasRefreshToken = Boolean(state?.auth?.refreshToken);
      requiresPasswordChange = Boolean(
        state?.auth?.requiresPasswordChange && state?.auth?.setupToken
      );
    } catch {
      // ignore
    }

    // If user is in first-login setup, do not force-terminate session
    if (requiresPasswordChange) {
      return Promise.reject(error);
    }

    // If there is no refresh token at all, session cannot be refreshed -> conclusive termination
    if (!hasRefreshToken) {
      await sessionTerminationService.triggerTermination({ reason: "session_expired" });
      return Promise.reject(error);
    }

    // 5. Deduplicated silent refresh using shared refreshPromise
    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const result = await store.dispatch(refreshThunk());
            if (refreshThunk.fulfilled.match(result)) {
              return result.payload.accessToken;
            }

            // Check if failure was a conclusive rejection (401 or 400)
            const payload = result.payload as any;
            const isDefinitive =
              payload?.status === 401 ||
              payload?.status === 400 ||
              payload?.code === "UNAUTHORIZED" ||
              payload?.code === "AUTH_FAILED";

            if (isDefinitive) {
              const msg = (payload?.message || "").toLowerCase();
              const reason = msg.includes("deactivat")
                ? "account_deactivated"
                : msg.includes("revok")
                ? "session_revoked"
                : "session_expired";

              await sessionTerminationService.triggerTermination({
                reason,
                message: payload?.message,
              });
            }
            return null;
          } catch {
            return null;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        // Retry the original request with rotated access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } else {
        return Promise.reject(error);
      }
    } catch {
      return Promise.reject(error);
    }
  }
);
