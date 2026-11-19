"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { refreshThunk } from "../slices/thunks/refresh.thunk";
import { notify } from "@/shared/services/notification.service";

const WARNING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes before permanent refresh token expiry
const CHECK_INTERVAL_MS = 60 * 1000; // Check once per minute

/**
 * Optional session expiration warning hook.
 * Complies with enterprise security requirements:
 * - Does NOT warn for access token expiration (since silent refresh handles that seamlessly).
 * - Only warns when the permanent refresh token is genuinely nearing its expiration timestamp.
 * - Provides an action to renew the session with one click, rotating the refresh token.
 */
export function useSessionExpiryWarning(): void {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const { refreshTokenExpiresAtUtc, refreshToken, user } = useAppSelector(
    (state) => state.auth
  );

  const hasWarnedRef = useRef<boolean>(false);
  const activeToastIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only active for authenticated users with a valid refresh token
    if (!refreshToken || !refreshTokenExpiresAtUtc || !user) {
      hasWarnedRef.current = false;
      if (activeToastIdRef.current) {
        notify.dismiss(activeToastIdRef.current);
        activeToastIdRef.current = null;
      }
      return;
    }

    const checkExpiration = async () => {
      try {
        const expiresAt = new Date(refreshTokenExpiresAtUtc).getTime();
        const now = Date.now();
        const remainingMs = expiresAt - now;

        // If renewed, reset the warning flag and dismiss previous toast
        if (remainingMs > WARNING_THRESHOLD_MS) {
          hasWarnedRef.current = false;
          if (activeToastIdRef.current) {
            notify.dismiss(activeToastIdRef.current);
            activeToastIdRef.current = null;
          }
          return;
        }

        // If within warning window and hasn't warned for this cycle yet
        if (remainingMs <= WARNING_THRESHOLD_MS && remainingMs > 0 && !hasWarnedRef.current) {
          hasWarnedRef.current = true;
          const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));

          const messageText = t.has("SessionExpiringSoon")
            ? t("SessionExpiringSoon", { minutes: remainingMinutes })
            : `Your session will expire in ${remainingMinutes} minutes. Please save your work or renew your session.`;

          const renewLabel = t.has("RenewSession") ? t("RenewSession") : "Renew Session";

          const id = notify.warning(messageText, {
            title: t.has("SessionExpiredTitle") ? t("SessionExpiredTitle") : "Session Warning",
            duration: 15000,
            action: {
              label: renewLabel,
              onClick: async () => {
                try {
                  const result = await dispatch(refreshThunk());
                  if (refreshThunk.fulfilled.match(result)) {
                    hasWarnedRef.current = false;
                    notify.success(
                      t.has("SessionRenewed")
                        ? t("SessionRenewed")
                        : "Session renewed successfully.",
                      { title: t.has("ConnectedTitle") ? t("ConnectedTitle") : "Success" }
                    );
                  }
                } catch {
                  // Handled by thunk error pipeline
                }
              },
            },
          });

          activeToastIdRef.current = id;
        }
      } catch {
        // Ignore date parse errors
      }
    };

    // Run check immediately on mount/update, then every minute
    checkExpiration();
    const interval = setInterval(checkExpiration, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [refreshToken, refreshTokenExpiresAtUtc, user, dispatch, t]);
}

export default useSessionExpiryWarning;
