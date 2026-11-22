"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";
import {
  IconCalendarTime,
  IconMapPin,
  IconMoon,
  IconSun,
  IconClockCheck,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { formatDateOnly, formatTimeOnly } from "@/shared/utils/i18nFormatters";
import { getLocalizedLeaveTypeName } from "@/shared/utils/localization";
import type { CurrentAttendanceStatus } from "../types";

interface AttendanceStatusCardProps {
  status: CurrentAttendanceStatus | null;
}

export const AttendanceStatusCard: React.FC<AttendanceStatusCardProps> = ({ status }) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const safeT = (key: string, arFallback: string, enFallback: string): string => {
    if (t.has(key as any)) {
      const val = t(key as any);
      if (val && val !== key) return val;
    }
    return isRtl ? arFallback : enFallback;
  };

  const shift = status?.todayShift;
  const isOvernight = Boolean(shift?.isOvernight);
  const activeAttendance = status?.activeAttendance;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Secondary Panel Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.text.primary, 0.02),
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
          {safeT("ScheduleAndLocationInfo", "بيانات المناوبة ومقر العمل", "Shift & Worksite Context")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {safeT(
            "AuthoritativeScheduleInfo",
            "بيانات جدول العمل المعتمد لليوم",
            "Authoritative daily schedule context"
          )}
        </Typography>
      </Box>

      <CardContent
        sx={{
          p: 2.5,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Stack spacing={2}>
          {/* Approved Leave Notice */}
          {status?.isOnApprovedLeave && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: "10px",
                bgcolor: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <IconCalendarEvent size={20} color={theme.palette.info.main} style={{ flexShrink: 0 }} />
              <Box>
                <Typography variant="caption" fontWeight={700} color="info.main" display="block">
                  {isRtl ? "إجازة معتمدة لليوم" : "Authorized Leave Today"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getLocalizedLeaveTypeName(
                    {
                      leaveTypeName: status.approvedLeaveTypeName,
                      leaveTypeNameAr: status.approvedLeaveTypeNameAr,
                    },
                    isRtl,
                    safeT("ApprovedLeave", "إجازة معتمدة", "Approved Leave")
                  )}
                  {status.approvedLeaveStartDate && status.approvedLeaveEndDate && (
                    ` (${formatDateOnly(status.approvedLeaveStartDate, isRtl)} - ${formatDateOnly(status.approvedLeaveEndDate, isRtl)})`
                  )}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Rest Day Overtime Notice (when session open on rest day) */}
          {!status?.isScheduledWorkDay && status?.isCheckedIn && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: "10px",
                bgcolor: alpha(theme.palette.warning.main, 0.08),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <IconCalendarTime size={20} color={theme.palette.warning.main} style={{ flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={600} color="warning.main">
                {safeT(
                  "RestDayOvertimeNotice",
                  "جلسة حضور نشطة في يوم عطلة مجدولة (عمل إضافي)",
                  "Active attendance session on a scheduled day off (Overtime)"
                )}
              </Typography>
            </Box>
          )}

          {/* Work Shift Context */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" fontWeight={500} sx={{ mb: 0.5 }}>
              {safeT("TodayAssignedShift", "مناوبة العمل المخصصة لليوم", "Today's Assigned Shift")}
            </Typography>

            {shift ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    bgcolor: isOvernight ? alpha("#7b1fa2", 0.1) : alpha("#f57c00", 0.1),
                    color: isOvernight ? "#7b1fa2" : "#f57c00",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isOvernight ? <IconMoon size={20} /> : <IconSun size={20} />}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap color="text.primary">
                    {isRtl && shift.nameAr ? shift.nameAr : shift.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}>
                      {shift.startTime} – {shift.endTime}
                    </span>{" "}
                    ({shift.durationHours} {safeT("HoursAbbr", "ساعات", "hrs")})
                  </Typography>
                </Box>
                {isOvernight && (
                  <Chip
                    label={safeT("Overnight", "مناوبة ليلية", "Overnight")}
                    size="small"
                    color="secondary"
                    sx={{ fontWeight: 600, height: 22, fontSize: "0.7rem" }}
                  />
                )}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {status?.shiftNotice || safeT("NoShiftScheduledToday", "لا توجد مناوبة عمل مجدولة لليوم", "No active shift scheduled for today")}
              </Typography>
            )}
          </Box>

          {/* Work Location Context */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: alpha(theme.palette.info.main, 0.03),
              border: `1px solid ${alpha(theme.palette.info.main, 0.08)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" fontWeight={500} sx={{ mb: 0.5 }}>
              {safeT("AssignedWorkLocation", "موقع العمل المسند", "Assigned Work Location")}
            </Typography>

            {status?.hasAssignedLocation ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: "info.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconMapPin size={20} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap color="text.primary">
                    {isRtl && status.assignedLocationNameAr ? status.assignedLocationNameAr : status.assignedLocationName}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {safeT("NoWorkLocationAssigned", "لم يتم تعيين مقر عمل بعد", "No work location assigned")}
              </Typography>
            )}
          </Box>

          {/* Recorded Check-in Time (when session active) */}
          {activeAttendance?.checkInTimeUtc && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: "10px",
                bgcolor: alpha(theme.palette.success.main, 0.03),
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: "success.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconClockCheck size={20} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {safeT("RecordedCheckInTime", "وقت تسجيل الحضور المعتمد", "Recorded Check-in Time")}
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} color="success.main">
                  <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}>
                    {formatTimeOnly(activeAttendance.checkInTimeUtc, isRtl)}
                  </span>
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>

        {/* Daily Summary Statistics */}
        <Box sx={{ pt: 2, mt: 2, borderTop: "1px dashed", borderColor: "divider" }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ p: 1.25, borderRadius: "8px", bgcolor: alpha(theme.palette.text.primary, 0.03), textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {safeT("SessionsToday", "جلسات اليوم", "Sessions Today")}
                </Typography>
                <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ mt: 0.25 }}>
                  {status?.totalSessionsToday ?? 0}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ p: 1.25, borderRadius: "8px", bgcolor: alpha(theme.palette.text.primary, 0.03), textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {safeT("TotalHoursToday", "إجمالي ساعات اليوم", "Total Hours Today")}
                </Typography>
                <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ mt: 0.25 }}>
                  {status?.totalHoursToday ? `${status.totalHoursToday.toFixed(1)}h` : "0h"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
