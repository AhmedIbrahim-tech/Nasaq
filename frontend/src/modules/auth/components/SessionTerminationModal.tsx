"use client";

import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme, alpha } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import {
  IconShieldLock,
  IconArrowRight,
  IconArrowLeft,
  IconUserOff,
  IconDeviceDesktopOff,
} from "@tabler/icons-react";
import { CustomizerContext } from "@/theme/customizerContext";
import sessionTerminationService, {
  SessionTerminationState,
} from "../services/sessionTermination.service";

const TOTAL_COUNTDOWN_MS = 4000;
const UPDATE_INTERVAL_MS = 50;

/**
 * Global non-dismissible session termination modal.
 * - Displays when an authentication session is definitively invalid, expired, revoked, or deactivated.
 * - Non-dismissible: No close button, no cancel button, Escape & Backdrop clicks ignored.
 * - Smooth 4-second linear progress countdown with automatic router.replace("/login").
 * - Offers an immediate "Log In Now" button to bypass the 4-second waiting period.
 * - Fully supports RTL / LTR, Dark / Light themes, and Arabic / English localizations.
 */
export function SessionTerminationModal(): React.JSX.Element | null {
  const router = useRouter();
  const t = useTranslations();
  const theme = useTheme();
  const { activeDir } = useContext(CustomizerContext);
  const isRtl = activeDir === "rtl";

  const [state, setState] = useState<SessionTerminationState>({
    isOpen: false,
    reason: "default",
  });

  const [remainingMs, setRemainingMs] = useState<number>(TOTAL_COUNTDOWN_MS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasNavigatedRef = useRef<boolean>(false);

  // Subscribe to centralized session termination controller
  useEffect(() => {
    const unsubscribe = sessionTerminationService.subscribe((newState) => {
      setState(newState);
      if (newState.isOpen) {
        hasNavigatedRef.current = false;
        setRemainingMs(TOTAL_COUNTDOWN_MS);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Safe navigation to login page
  const handleRedirect = useCallback(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    sessionTerminationService.reset();
    router.replace("/login");
  }, [router]);

  // Manage 4-second smooth countdown when modal is active
  useEffect(() => {
    if (!state.isOpen) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, TOTAL_COUNTDOWN_MS - elapsed);
      setRemainingMs(remaining);

      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        handleRedirect();
      }
    }, UPDATE_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.isOpen, handleRedirect]);

  // Prevent rendering if on login page
  if (typeof window !== "undefined" && window.location.pathname.includes("/login")) {
    return null;
  }

  if (!state.isOpen) {
    return null;
  }

  const progressPercent = (remainingMs / TOTAL_COUNTDOWN_MS) * 100;
  const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

  // Determine reason-specific heading and message
  let title = t.has("SessionTerminationTitle")
    ? t("SessionTerminationTitle")
    : "Session Expired";
  let message = t.has("SessionTerminationDesc")
    ? t("SessionTerminationDesc")
    : "Your session has expired or is no longer valid. You will be redirected to the sign-in page.";
  let IconComponent = IconShieldLock;

  if (state.reason === "account_deactivated") {
    title = t.has("AccountDeactivatedTitle")
      ? t("AccountDeactivatedTitle")
      : "Account Deactivated";
    message = t.has("AccountDeactivatedDesc")
      ? t("AccountDeactivatedDesc")
      : "Your account has been deactivated. Please contact your platform administrator.";
    IconComponent = IconUserOff;
  } else if (state.reason === "session_revoked") {
    title = t.has("SessionRevokedTitle")
      ? t("SessionRevokedTitle")
      : "Session Revoked";
    message = t.has("SessionRevokedDesc")
      ? t("SessionRevokedDesc")
      : "Your session has been terminated by the server or from another device. Please sign in again.";
    IconComponent = IconDeviceDesktopOff;
  }

  // Allow custom override if provided
  if (state.title) title = state.title;
  if (state.message) message = state.message;

  const secondsLabel = t.has("Seconds") ? t("Seconds") : "seconds";
  const redirectingLabel = t.has("RedirectingToLoginIn")
    ? t("RedirectingToLoginIn")
    : "Redirecting to sign-in page in";
  const noticeText = t.has("AutomaticRedirectionNotice")
    ? t("AutomaticRedirectionNotice")
    : "Redirection is automatic. You do not need to take any action.";
  const loginNowText = t.has("LogInNow") ? t("LogInNow") : "Sign In Now";

  return (
    <Dialog
      open={state.isOpen}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      onClose={(_event, reason) => {
        // Prevent dismissal via backdrop click or Escape key
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          handleRedirect();
        }
      }}
      aria-labelledby="session-termination-dialog-title"
      aria-describedby="session-termination-dialog-description"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            zIndex: 9998,
          },
        },
      }}
      PaperProps={{
        elevation: 24,
        sx: {
          borderRadius: 3,
          p: { xs: 2.5, sm: 3.5 },
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
          zIndex: 9999,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 20px 40px -15px rgba(0,0,0,0.8)"
              : "0 20px 40px -15px rgba(15,23,42,0.25)",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Security / Warning Icon */}
        <Box
          sx={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.error.main, 0.12),
            border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2.5,
          }}
        >
          <IconComponent
            size={40}
            color={theme.palette.error.main}
            stroke={1.8}
          />
        </Box>

        {/* Heading */}
        <Typography
          id="session-termination-dialog-title"
          variant="h4"
          fontWeight={700}
          sx={{ mb: 1.5, color: "text.primary" }}
        >
          {title}
        </Typography>

        {/* Explanatory Message */}
        <Typography
          id="session-termination-dialog-description"
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, px: 1, lineHeight: 1.6 }}
        >
          {message}
        </Typography>

        {/* Animated Countdown Progress Line */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            bgcolor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.grey[800], 0.6)
                : alpha(theme.palette.grey[100], 0.8),
            border: `1px solid ${theme.palette.divider}`,
            mb: 3,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              {redirectingLabel}
            </Typography>
            <Box
              sx={{
                px: 1.2,
                py: 0.3,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.error.main, 0.12),
                color: theme.palette.error.main,
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            >
              {remainingSeconds} {secondsLabel}
            </Box>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.error.main, 0.15),
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                bgcolor: theme.palette.error.main,
                transition: "transform 0.05s linear",
              },
            }}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1.5, textAlign: "center" }}
          >
            {noticeText}
          </Typography>
        </Box>

        {/* Immediate Login Action Button */}
        <Button
          variant="contained"
          color="error"
          size="large"
          fullWidth
          onClick={handleRedirect}
          endIcon={
            isRtl ? <IconArrowLeft size={20} /> : <IconArrowRight size={20} />
          }
          sx={{
            py: 1.25,
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
          }}
        >
          {loginNowText}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default SessionTerminationModal;
