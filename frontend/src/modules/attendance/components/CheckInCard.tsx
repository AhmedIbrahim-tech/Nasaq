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
import { useAttendanceAction } from "../hooks";
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

  const {
    notes,
    setNotes,
    actionLoading,
    actionError,
    setActionError,
    attendanceState,
    handleAction,
    isCheckedIn,
    safeT,
  } = useAttendanceAction({ status, isLoading, onCheckIn, onCheckOut });

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
