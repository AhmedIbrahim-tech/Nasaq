"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { meThunk } from "../slices/thunks/me.thunk";
import { refreshThunk } from "../slices/thunks/refresh.thunk";
import { clearAuth } from "../slices/auth.slice";
import { coordinateLocalInvalidation } from "../services/sessionCoordinator";
import { notify } from "@/shared/services/notification.service";
import sessionTerminationService from "../services/sessionTermination.service";
import { sessionEventBus } from "../services/sessionEvents";
import { purgeSensitiveAppState } from "@/store";
import type { ConnectionErrorReason } from "@/shared/components/recovery/ConnectionRecoveryView";

export type AuthSessionStatus =
  | "initializing"
  | "authenticated"
  | "unauthenticated"
  | "unverified";

export type { ConnectionErrorReason };

export interface AuthSessionResult {
  status: AuthSessionStatus;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isVerifying: boolean;
  isNetworkError: boolean;
  errorReason: ConnectionErrorReason;
  retryCount: number;
  maxRetries: number;
  nextRetryIn: number | null;
  retryVerification: () => Promise<void>;
  resetAndLogin: () => Promise<void>;
}

const ACCESS_TOKEN_BUFFER_MS = 30 * 1000; // 30 seconds safety buffer
const MAX_AUTO_RETRIES = 3;

/**
 * Custom hook to initialize, verify, and automatically recover the authentication session.
 * - Runs once after Redux Persist rehydration.
 * - Distinguishes between initializing, authenticated, unauthenticated, and unverified states.
 * - Differentiates connection errors: offline, backend unreachable, timeout, server error, and forbidden.
 * - Automatic exponential backoff with jitter and online event listener for seamless recovery.
 * - Seamlessly restores dashboard routing without full page reloads upon successful reconnect.
 */
export function useAuthSession(): AuthSessionResult {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    accessToken,
    refreshToken,
    accessTokenExpiresAtUtc,
    refreshTokenExpiresAtUtc,
    sessionId,
  } = useAppSelector((state) => state.auth);

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isNetworkError, setIsNetworkError] = useState<boolean>(false);
  const [errorReason, setErrorReason] = useState<ConnectionErrorReason>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [nextRetryIn, setNextRetryIn] = useState<number | null>(null);

  const isVerifyingRef = useRef<boolean>(false);
  const lastProcessedSessionIdRef = useRef<string | null>(null);
  const autoRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasPreviouslyUnverifiedRef = useRef<boolean>(false);

  // Clear any scheduled auto-retry timeouts and countdown intervals
  const clearRetryTimers = useCallback(() => {
    if (autoRetryTimerRef.current) {
      clearTimeout(autoRetryTimerRef.current);
      autoRetryTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setNextRetryIn(null);
  }, []);

  // Classify API / Network error accurately
  const classifyError = useCallback((errorPayload: any): ConnectionErrorReason => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return "offline";
    }

    const status = errorPayload?.status;
    const code = errorPayload?.code;
    const message = (errorPayload?.message || "").toLowerCase();

    if (status === 403) {
      return "forbidden";
    }

    if (
      status === 408 ||
      code === "TIMEOUT" ||
      message.includes("timed out") ||
      message.includes("timeout")
    ) {
      return "timeout";
    }

    if (status && status >= 500 && status <= 504) {
      return "server_error";
    }

    return "unreachable";
  }, []);

  // Primary verification workflow
  const runVerification = useCallback(
    async (isAutoRetry = false, isManualRetry = false): Promise<void> => {
      // 1. If no persisted session exists, finish immediately as unauthenticated
      if (!sessionId || !refreshToken) {
        lastProcessedSessionIdRef.current = null;
        clearRetryTimers();
        setIsAuthenticated(false);
        setIsVerifying(false);
        setIsNetworkError(false);
        setErrorReason(null);
        setIsInitialized(true);
        return;
      }

      // Avoid overlapping verifications
      if (isVerifyingRef.current) {
        return;
      }

      isVerifyingRef.current = true;
      setIsVerifying(true);
      clearRetryTimers();

      try {
        const now = Date.now();

        const isAccessTokenValid = Boolean(
          accessToken &&
            accessTokenExpiresAtUtc &&
            new Date(accessTokenExpiresAtUtc).getTime() - ACCESS_TOKEN_BUFFER_MS > now
        );

        const isRefreshTokenValid = Boolean(
          refreshTokenExpiresAtUtc &&
            new Date(refreshTokenExpiresAtUtc).getTime() > now
        );

        // Case A: Refresh Token is locally expired
        if (!isRefreshTokenValid) {
          setIsAuthenticated(false);
          setIsVerifying(false);
          setIsNetworkError(false);
          setErrorReason(null);
          setIsInitialized(true);
          lastProcessedSessionIdRef.current = sessionId;
          await sessionTerminationService.triggerTermination({
            reason: "session_expired",
          });
          return;
        }

        // Case B: Access Token is still valid -> verify with server
        if (isAccessTokenValid) {
          const meResult = await dispatch(meThunk());

          if (meThunk.fulfilled.match(meResult)) {
            // Success! Session verified
            const hadBeenUnverified = wasPreviouslyUnverifiedRef.current;
            wasPreviouslyUnverifiedRef.current = false;
            setIsAuthenticated(true);
            setIsVerifying(false);
            setIsNetworkError(false);
            setErrorReason(null);
            setRetryCount(0);
            setIsInitialized(true);
            lastProcessedSessionIdRef.current = sessionId;

            if (hadBeenUnverified) {
              notify.success("Connection restored. Welcome back!", {
                title: "Connected",
              });
            }
            return;
          }

          // If meThunk failed with 401, attempt token rotation
          if (
            meThunk.rejected.match(meResult) &&
            meResult.payload?.status === 401
          ) {
            const refreshResult = await dispatch(refreshThunk());

            if (refreshThunk.fulfilled.match(refreshResult)) {
              const hadBeenUnverified = wasPreviouslyUnverifiedRef.current;
              wasPreviouslyUnverifiedRef.current = false;
              setIsAuthenticated(true);
              setIsVerifying(false);
              setIsNetworkError(false);
              setErrorReason(null);
              setRetryCount(0);
              setIsInitialized(true);
              lastProcessedSessionIdRef.current = sessionId;

              if (hadBeenUnverified) {
                notify.success("Connection restored. Welcome back!", {
                  title: "Connected",
                });
              }
              return;
            }

            // If refresh definitively rejected on server (401/400)
            if (
              refreshResult.payload?.status === 401 ||
              refreshResult.payload?.status === 400 ||
              refreshResult.payload?.code === "UNAUTHORIZED"
            ) {
              setIsAuthenticated(false);
              setIsNetworkError(false);
              setErrorReason(null);
              const msg = (refreshResult.payload?.message || "").toLowerCase();
              const reason = msg.includes("deactivat")
                ? "account_deactivated"
                : msg.includes("revok")
                ? "session_revoked"
                : "session_expired";
              await sessionTerminationService.triggerTermination({
                reason,
                message: refreshResult.payload?.message,
              });
            } else {
              // Transient failure during refresh
              const reason = classifyError(refreshResult.payload);
              wasPreviouslyUnverifiedRef.current = true;
              setIsAuthenticated(false);
              setIsNetworkError(true);
              setErrorReason(reason);
              handleScheduleAutoRetry();
            }

            setIsVerifying(false);
            setIsInitialized(true);
            lastProcessedSessionIdRef.current = sessionId;
            return;
          }

          // Non-401 error on meThunk (e.g. offline, timeout, server unavailable, 403)
          const reason = classifyError(meResult.payload);
          wasPreviouslyUnverifiedRef.current = true;
          setIsAuthenticated(false);
          setIsVerifying(false);
          setIsNetworkError(true);
          setErrorReason(reason);
          setIsInitialized(true);
          lastProcessedSessionIdRef.current = sessionId;

          if (isManualRetry) {
            notify.warning("Reconnection attempt failed. Server is still unreachable.", {
              title: "Connection Issue",
            });
          }

          handleScheduleAutoRetry();
          return;
        }

        // Case C: Access Token expired, but Refresh Token is valid -> perform refresh
        const refreshResult = await dispatch(refreshThunk());

        if (refreshThunk.fulfilled.match(refreshResult)) {
          const hadBeenUnverified = wasPreviouslyUnverifiedRef.current;
          wasPreviouslyUnverifiedRef.current = false;
          setIsAuthenticated(true);
          setIsNetworkError(false);
          setErrorReason(null);
          setRetryCount(0);

          if (hadBeenUnverified) {
            notify.success("Connection restored. Welcome back!", {
              title: "Connected",
            });
          }
        } else {
          if (
            refreshResult.payload?.status === 401 ||
            refreshResult.payload?.status === 400 ||
            refreshResult.payload?.code === "UNAUTHORIZED"
          ) {
            setIsAuthenticated(false);
            setIsNetworkError(false);
            setErrorReason(null);
            const msg = (refreshResult.payload?.message || "").toLowerCase();
            const reason = msg.includes("deactivat")
              ? "account_deactivated"
              : msg.includes("revok")
              ? "session_revoked"
              : "session_expired";
            await sessionTerminationService.triggerTermination({
              reason,
              message: refreshResult.payload?.message,
            });
          } else {
            // Transient network failure
            const reason = classifyError(refreshResult.payload);
            wasPreviouslyUnverifiedRef.current = true;
            setIsAuthenticated(false);
            setIsNetworkError(true);
            setErrorReason(reason);

            if (isManualRetry) {
              notify.warning("Reconnection attempt failed. Server is still unreachable.", {
                title: "Connection Issue",
              });
            }

            handleScheduleAutoRetry();
          }
        }

        setIsVerifying(false);
        setIsInitialized(true);
        lastProcessedSessionIdRef.current = sessionId;
      } finally {
        isVerifyingRef.current = false;
      }
    },
    [
      sessionId,
      refreshToken,
      accessToken,
      accessTokenExpiresAtUtc,
      refreshTokenExpiresAtUtc,
      dispatch,
      clearRetryTimers,
      classifyError,
    ]
  );

  // Schedules next auto-retry with exponential backoff & jitter
  const handleScheduleAutoRetry = useCallback(() => {
    setRetryCount((prevCount) => {
      const nextCount = prevCount + 1;
      if (nextCount > MAX_AUTO_RETRIES) {
        clearRetryTimers();
        return prevCount;
      }

      // Exponential backoff: ~2s, ~4s, ~8s with ±300ms jitter
      const baseDelay = Math.min(2000 * Math.pow(2, prevCount), 8000);
      const jitter = Math.floor(Math.random() * 600) - 300;
      const totalDelayMs = Math.max(1500, baseDelay + jitter);
      const totalDelaySec = Math.round(totalDelayMs / 1000);

      clearRetryTimers();
      setNextRetryIn(totalDelaySec);

      // Countdown interval for UI feedback
      countdownIntervalRef.current = setInterval(() => {
        setNextRetryIn((prevSec) => {
          if (prevSec === null || prevSec <= 1) {
            return null;
          }
          return prevSec - 1;
        });
      }, 1000);

      // Trigger verification when delay expires
      autoRetryTimerRef.current = setTimeout(() => {
        clearRetryTimers();
        runVerification(true, false);
      }, totalDelayMs);

      return nextCount;
    });
  }, [clearRetryTimers, runVerification]);

  // Manual retry invoked by user clicking "Try Again"
  const retryVerification = useCallback(async () => {
    clearRetryTimers();
    lastProcessedSessionIdRef.current = null;
    await runVerification(false, true);
  }, [clearRetryTimers, runVerification]);

  // Secondary recovery action: safely clear local unverified session and navigate to login
  const resetAndLogin = useCallback(async () => {
    clearRetryTimers();
    const finalRevision = await coordinateLocalInvalidation();
    dispatch(clearAuth({ sessionRevision: finalRevision }));
    setIsAuthenticated(false);
    setIsNetworkError(false);
    setErrorReason(null);
    router.replace("/login");
  }, [clearRetryTimers, dispatch, router]);

  // Re-verify immediately if browser comes back online
  useEffect(() => {
    const handleOnline = () => {
      clearRetryTimers();
      lastProcessedSessionIdRef.current = null;
      runVerification(true, false);
    };

    const handleOffline = () => {
      setErrorReason("offline");
      setIsNetworkError(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, [clearRetryTimers, runVerification]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      clearRetryTimers();
    };
  }, [clearRetryTimers]);

  // Synchronize cross-tab intentional logout
  useEffect(() => {
    const unsubscribe = sessionEventBus.subscribe((event) => {
      if (event.type === "SESSION_LOGOUT") {
        clearRetryTimers();
        dispatch(purgeSensitiveAppState());
        dispatch(clearAuth());
        setIsAuthenticated(false);
        setIsVerifying(false);
        setIsNetworkError(false);
        router.replace("/login");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [clearRetryTimers, dispatch, router]);

  // Trigger initial verification when session credentials appear or change
  useEffect(() => {
    if (!sessionId || !refreshToken) {
      lastProcessedSessionIdRef.current = null;
      clearRetryTimers();
      setIsAuthenticated(false);
      setIsVerifying(false);
      setIsNetworkError(false);
      setErrorReason(null);
      setIsInitialized(true);
      return;
    }

    if (lastProcessedSessionIdRef.current !== sessionId) {
      runVerification();
    }
  }, [sessionId, refreshToken, runVerification, clearRetryTimers]);

  let status: AuthSessionStatus = "initializing";
  if (!isInitialized) {
    status = "initializing";
  } else if (isAuthenticated) {
    status = "authenticated";
  } else if (isNetworkError) {
    status = "unverified";
  } else {
    status = "unauthenticated";
  }

  return {
    status,
    isInitialized,
    isAuthenticated,
    isVerifying,
    isNetworkError,
    errorReason,
    retryCount,
    maxRetries: MAX_AUTO_RETRIES,
    nextRetryIn,
    retryVerification,
    resetAndLogin,
  };
}

export default useAuthSession;
