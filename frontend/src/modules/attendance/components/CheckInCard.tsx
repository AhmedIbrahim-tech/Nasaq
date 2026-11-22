"use client";

import React, { useState, useRef, useMemo } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { alpha, useTheme } from "@mui/material/styles";
import {
  IconMapPin,
  IconClockCheck,
  IconClockOff,
  IconClockPlay,
  IconCalendarEvent,
  IconCalendarTime,
  IconClock,
  IconShieldCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { formatTimeOnly } from "@/shared/utils/i18nFormatters";
import type { CurrentAttendanceStatus, CheckInRequest, CheckOutRequest } from "../types";

interface CheckInCardProps {
  status: CurrentAttendanceStatus | null;
  isLoading: boolean;
  onCheckIn: (req: CheckInRequest) => Promise<void>;
  onCheckOut: (req: CheckOutRequest) => Promise<void>;
}

export const CheckInCard: React.FC<CheckInCardProps> = ({
  status,
  isLoading,
  onCheckIn,
  onCheckOut,
}) => {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === "rtl";

  const [notes, setNotes] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // In-flight execution lock to strictly prevent duplicate submissions
  const isSubmittingRef = useRef<boolean>(false);

  const safeT = (key: string, arFallback: string, enFallback: string): string => {
    if (t.has(key as any)) {
      const val = t(key as any);
      if (val && val !== key) return val;
    }
    return isRtl ? arFallback : enFallback;
  };

  const isCheckedIn = Boolean(status?.isCheckedIn);
  const activeAttendance = status?.activeAttendance;
  const isPendingReview = activeAttendance?.checkInStatus === "PendingReview";
  const isVerified = activeAttendance?.checkInStatus === "Verified";
  const isOnApprovedLeave = Boolean(status?.isOnApprovedLeave);
  const hasScheduledShift = Boolean(status?.hasScheduledShift);
  const isScheduledWorkDay = Boolean(status?.isScheduledWorkDay);
  const totalSessionsToday = status?.totalSessionsToday ?? 0;

  /**
   * Authoritative State Resolution Model
   * Separates Attendance Session State from Administrative/GPS Verification State.
   */
  const attendanceState = useMemo(() => {
    // 1. Session is currently OPEN
    if (isCheckedIn) {
      return {
        statusTitle: safeT("CurrentlyCheckedIn", "أنت حاضر حالياً", "Currently Checked In"),
        instructionText: safeT(
          "InstructionCurrentlyCheckedIn",
          "أنت مسجل حضورك. عند انتهاء العمل، اضغط على تسجيل الانصراف.",
          "You're checked in. Press Check Out when you finish working."
        ),
        statusColor: "success" as const,
        themeColor: theme.palette.success.main,
        themeLight: alpha(theme.palette.success.main, 0.08),
        icon: <IconClockCheck size={32} stroke={2} />,
        actionText: safeT("CheckOutAction", "تسجيل الانصراف", "Check Out"),
        actionColor: "error" as const,
        actionIcon: <IconClockOff size={22} stroke={2} />,
        canAct: true,
        sessionBadge: safeT("ActiveSession", "جلسة نشطة", "Active Session"),
        checkInTime: activeAttendance?.checkInTimeUtc
          ? formatTimeOnly(activeAttendance.checkInTimeUtc, isRtl)
          : null,
        verificationBadge: isPendingReview
          ? {
              label: safeT("GpsReviewPending", "مراجعة الموقع معلقة", "GPS Review Pending"),
              color: "warning" as const,
              icon: <IconAlertTriangle size={14} />,
            }
          : isVerified
          ? {
              label: safeT("GpsVerified", "تم التحقق من الموقع", "GPS Verified"),
              color: "success" as const,
              icon: <IconShieldCheck size={14} />,
            }
          : null,
      };
    }

    // 2. On Approved Leave today
    if (isOnApprovedLeave) {
      return {
        statusTitle: safeT("OnApprovedLeave", "في إجازة معتمدة", "On Approved Leave"),
        instructionText: safeT(
          "InstructionApprovedLeave",
          "لديك إجازة معتمدة اليوم وأنت معفى من الحضور والانصراف. يمكنك تسجيل الحضور في حال تكليفك بمهام استثنائية.",
          "You are on approved leave today and excused from daily attendance. Press Check In if you have special work assigned."
        ),
        statusColor: "info" as const,
        themeColor: theme.palette.info.main,
        themeLight: alpha(theme.palette.info.main, 0.08),
        icon: <IconCalendarEvent size={32} stroke={2} />,
        actionText: safeT("CheckInAction", "تسجيل الحضور", "Check In"),
        actionColor: "primary" as const,
        actionIcon: <IconClockPlay size={22} stroke={2} />,
        canAct: true,
        sessionBadge: safeT("ApprovedLeave", "إجازة معتمدة", "Approved Leave"),
        checkInTime: null,
        verificationBadge: null,
      };
    }

    // 3. Has completed attendance session(s) today
    if (totalSessionsToday > 0) {
      return {
        statusTitle: safeT("CheckedOutStatus", "تم تسجيل الانصراف", "Checked Out"),
        instructionText: safeT(
          "InstructionCompleted",
          "تم تسجيل حضورك وانصرافك بنجاح. يمكنك تسجيل الحضور مجدداً إذا كان لديك فترة عمل إضافية.",
          "Your check-in and check-out have been recorded. You can check in again if you have additional work sessions."
        ),
        statusColor: "info" as const,
        themeColor: theme.palette.info.main,
        themeLight: alpha(theme.palette.info.main, 0.08),
        icon: <IconClockOff size={32} stroke={2} />,
        actionText: safeT("CheckInAction", "تسجيل الحضور", "Check In"),
        actionColor: "primary" as const,
        actionIcon: <IconClockPlay size={22} stroke={2} />,
        canAct: true,
        sessionBadge: safeT("Completed", "مكتمل", "Completed"),
        checkInTime: null,
        verificationBadge: null,
      };
    }

    // 4. Scheduled Rest Day (without active session)
    if (!isScheduledWorkDay) {
      return {
        statusTitle: safeT("ScheduledRestDay", "يوم راحة مجدول", "Scheduled Rest Day"),
        instructionText: safeT(
          "InstructionRestDay",
          "اليوم هو يوم عطلة أو راحة أسبوعية مجدولة لك. اضغط على تسجيل الحضور إذا كنت مكلفاً بعمل إضافي.",
          "Today is your scheduled rest day. Press Check In if you are assigned to an overtime work shift."
        ),
        statusColor: "default" as const,
        themeColor: theme.palette.text.secondary,
        themeLight: alpha(theme.palette.text.primary, 0.04),
        icon: <IconCalendarTime size={32} stroke={2} />,
        actionText: safeT("CheckInAction", "تسجيل الحضور", "Check In"),
        actionColor: "primary" as const,
        actionIcon: <IconClockPlay size={22} stroke={2} />,
        canAct: true,
        sessionBadge: safeT("DayOff", "راحة أسبوعية", "Day Off"),
        checkInTime: null,
        verificationBadge: null,
      };
    }

    // 5. No Assigned Shift
    if (!hasScheduledShift) {
      return {
        statusTitle: safeT("NoAssignedShift", "لا توجد وردية محددة", "No Assigned Shift"),
        instructionText: safeT(
          "InstructionNoShift",
          "لا توجد وردية عمل مجدولة لك حالياً. يمكنك تسجيل الحضور عند بدء مهامك اليومية.",
          "No work shift is currently scheduled for you. Press Check In when you begin your work."
        ),
        statusColor: "default" as const,
        themeColor: theme.palette.text.secondary,
        themeLight: alpha(theme.palette.text.primary, 0.04),
        icon: <IconClock size={32} stroke={2} />,
        actionText: safeT("CheckInAction", "تسجيل الحضور", "Check In"),
        actionColor: "primary" as const,
        actionIcon: <IconClockPlay size={22} stroke={2} />,
        canAct: true,
        sessionBadge: safeT("NoShift", "بدون وردية", "No Shift"),
        checkInTime: null,
        verificationBadge: null,
      };
    }

    // 6. Default: Ready to Check In (normal scheduled workday)
    return {
      statusTitle: safeT("NotCheckedInYet", "لم تسجل حضورك بعد", "Not Checked In"),
      instructionText: safeT(
        "InstructionNotCheckedIn",
        "اضغط على تسجيل الحضور عند بدء يوم عملك.",
        "Press Check In when you start your workday."
      ),
      statusColor: "primary" as const,
      themeColor: theme.palette.primary.main,
      themeLight: alpha(theme.palette.primary.main, 0.08),
      icon: <IconClockPlay size={32} stroke={2} />,
      actionText: safeT("CheckInAction", "تسجيل الحضور", "Check In"),
      actionColor: "primary" as const,
      actionIcon: <IconClockPlay size={22} stroke={2} />,
      canAct: true,
      sessionBadge: safeT("OffDuty", "خارج وقت العمل", "Off Duty"),
      checkInTime: null,
      verificationBadge: null,
    };
  }, [
    isCheckedIn,
    isOnApprovedLeave,
    totalSessionsToday,
    isScheduledWorkDay,
    hasScheduledShift,
    activeAttendance,
    isPendingReview,
    isVerified,
    isRtl,
    theme,
  ]);

  /**
   * Fresh Point-In-Time GPS Acquisition (DEC-002, DEC-005, DEC-006)
   * Strictly invoked ONCE per explicit user action (Check In or Check Out).
   * Never runs on page mount, tab switch, focus, or render.
   * If GPS is denied or fails, resolves null to proceed with Pending Review workflow.
   */
  const obtainFreshLocation = (): Promise<{ lat: number; lng: number; accuracy: number } | null> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !navigator?.geolocation) {
        resolve(null);
        return;
      }

      let resolved = false;
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, 8000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
          }
        },
        (err) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            // Per DEC-006, GPS denial or failure does not abort attendance; resolves null for Pending Review
            console.warn("GPS acquisition failed or denied:", err.message);
            resolve(null);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 7500,
          maximumAge: 0, // Strict fresh point-in-time coordinates; never reuse cached coordinates
        }
      );
    });
  };

  const handleAction = async () => {
    if (isSubmittingRef.current || actionLoading || isLoading) return;
    isSubmittingRef.current = true;
    setActionLoading(true);
    setActionError(null);

    try {
      // 1. Obtain fresh point-in-time GPS coordinates strictly upon explicit action
      const freshCoords = await obtainFreshLocation();

      // 2. Build payload with authoritative client device info
      const payload = {
        latitude: freshCoords?.lat ?? null,
        longitude: freshCoords?.lng ?? null,
        accuracyMeters: freshCoords?.accuracy ?? null,
        notes: notes.trim() || null,
        deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent.substring(0, 150) : "Web",
      };

      // 3. Submit mutation based on active state
      if (isCheckedIn) {
        await onCheckOut(payload);
      } else {
        await onCheckIn(payload);
      }
      setNotes("");
    } catch (err: any) {
      setActionError(err.message || safeT("AttendanceActionFailed", "فشلت عملية الحضور والانصراف", "Attendance operation failed"));
    } finally {
      setActionLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1.5px solid",
        borderColor: isCheckedIn ? alpha(theme.palette.success.main, 0.4) : "divider",
        bgcolor: "background.paper",
        boxShadow: isCheckedIn
          ? `0 8px 24px ${alpha(theme.palette.success.main, 0.08)}`
          : `0 8px 24px ${alpha(theme.palette.primary.main, 0.04)}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Area A: Prominent Current Status Banner */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          bgcolor: attendanceState.themeLight,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Status Icon Box */}
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: "14px",
                bgcolor: alpha(attendanceState.themeColor, 0.16),
                color: attendanceState.themeColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {attendanceState.icon}
            </Box>

            {/* Status Title & Badges */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="text.primary"
                  sx={{ letterSpacing: "-0.01em" }}
                >
                  {attendanceState.statusTitle}
                </Typography>

                {attendanceState.verificationBadge && (
                  <Chip
                    icon={attendanceState.verificationBadge.icon}
                    label={attendanceState.verificationBadge.label}
                    color={attendanceState.verificationBadge.color}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>

              {attendanceState.checkInTime ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {safeT("CheckedInAt", "وقت تسجيل الحضور", "Checked in at")}:{" "}
                  <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block", fontWeight: 700 }}>
                    {attendanceState.checkInTime}
                  </span>
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                  {safeT("RecordYourDailyAttendance", "سجّل حضورك أو انصرافك لمناوبة العمل اليومية", "Record your daily attendance arrival or departure")}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Session State Badge */}
          <Chip
            label={attendanceState.sessionBadge}
            color={isCheckedIn ? "success" : "default"}
            size="small"
            sx={{ fontWeight: 700, mt: 0.5 }}
          />
        </Stack>

        {/* Area B: What Should I Do Now? Guidance Instruction */}
        <Box
          sx={{
            mt: 2.25,
            pt: 2,
            borderTop: "1px dashed",
            borderColor: alpha(attendanceState.themeColor, 0.25),
          }}
        >
          <Typography
            variant="body1"
            fontWeight={600}
            color="text.primary"
            sx={{ lineHeight: 1.6 }}
          >
            {attendanceState.instructionText}
          </Typography>
        </Box>
      </Box>

      {/* Main Action Content Area */}
      <CardContent
        sx={{
          p: { xs: 2.5, sm: 3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          {actionError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }}>
              {actionError}
            </Alert>
          )}

          {/* Area D: GPS Simplified Explanatory Notice */}
          <Box
            sx={{
              p: 1.5,
              mb: 2.25,
              borderRadius: "10px",
              bgcolor: alpha(theme.palette.text.primary, 0.03),
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            <IconMapPin size={18} color={theme.palette.text.secondary} style={{ flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {safeT(
                "LocationCheckNotice",
                "سيتم التحقق من موقعك عند تسجيل الحضور أو الانصراف.",
                "Your location will be checked when you check in or check out."
              )}
            </Typography>
          </Box>

          {/* Optional Notes Field */}
          <TextField
            fullWidth
            size="small"
            placeholder={safeT(
              "AttendanceNotesPlaceholder",
              "ملاحظات تشغيلية اختيارية...",
              "Optional operational notes or reason..."
            )}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={actionLoading || isLoading}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />
        </Box>

        {/* Area C: Visually Dominant Primary Action Button */}
        <Button
          fullWidth
          size="large"
          variant="contained"
          color={attendanceState.actionColor}
          onClick={handleAction}
          disabled={isLoading || actionLoading}
          startIcon={
            actionLoading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              attendanceState.actionIcon
            )
          }
          sx={{
            py: 1.75,
            fontSize: "1.05rem",
            fontWeight: 800,
            borderRadius: "12px",
            letterSpacing: 0.25,
            boxShadow: isCheckedIn
              ? `0 6px 20px ${alpha(theme.palette.error.main, 0.35)}`
              : `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: isCheckedIn
                ? `0 8px 24px ${alpha(theme.palette.error.main, 0.45)}`
                : `0 8px 24px ${alpha(theme.palette.primary.main, 0.45)}`,
            },
          }}
        >
          {actionLoading
            ? safeT("VerifyingGpsAndSubmitting", "جاري التحقق من الموقع وتسجيل العملية...", "Verifying location and recording attendance...")
            : attendanceState.actionText}
        </Button>
      </CardContent>
    </Card>
  );
};
