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
  IconClock,
  IconHourglassEmpty,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { formatDateOnly } from "@/shared/utils/i18nFormatters";
import type { CurrentAttendanceStatus } from "../types";

interface AttendanceStatusCardProps {
  status: CurrentAttendanceStatus | null;
}

export const AttendanceStatusCard: React.FC<AttendanceStatusCardProps> = ({ status }) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const shift = status?.todayShift;
  const isOvernight = Boolean(shift?.isOvernight);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" fontWeight={700}>
          {t("ScheduleAndLocationInfo")}
        </Typography>
      </Box>

      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Stack spacing={2.5}>
          {/* Approved Leave Banner */}
          {status?.isOnApprovedLeave && (
            <Box
              sx={{
                p: 1.75,
                borderRadius: "10px",
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
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
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.15),
                  color: "info.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconCalendarEvent size={20} stroke={2} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="info.main">
                  {isRtl ? "إجازة رسمية معتمدة اليوم" : "Authorized Leave Today"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isRtl && status.approvedLeaveTypeNameAr
                    ? status.approvedLeaveTypeNameAr
                    : status.approvedLeaveTypeName || t("ApprovedLeave")}
                  {status.approvedLeaveStartDate && status.approvedLeaveEndDate && (
                    ` (${formatDateOnly(status.approvedLeaveStartDate, isRtl)} - ${formatDateOnly(status.approvedLeaveEndDate, isRtl)})`
                  )}
                  {" • "}
                  {isRtl ? "معفى من الحضور والانصراف" : "Excused from daily attendance"}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Work Shift Details */}
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              {t("TodayAssignedShift")}
            </Typography>
            {shift ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                {isOvernight ? (
                  <IconMoon size={22} color="#7b1fa2" />
                ) : (
                  <IconSun size={22} color="#f57c00" />
                )}
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {isRtl && shift.nameAr ? shift.nameAr : shift.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" dir="ltr">
                    {shift.startTime} – {shift.endTime} ({shift.durationHours} hrs)
                  </Typography>
                </Box>
                {isOvernight && (
                  <Chip label={t("Overnight")} size="small" color="secondary" sx={{ fontWeight: 600 }} />
                )}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {status?.shiftNotice || t("NoShiftScheduledToday")}
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Work Location Details */}
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              {t("AssignedWorkLocation")}
            </Typography>
            {status?.hasAssignedLocation ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <IconMapPin size={22} color="#1976d2" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {isRtl && status.assignedLocationNameAr ? status.assignedLocationNameAr : status.assignedLocationName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("GeofenceRadius")}: {status.assignedRadiusMeters}m (Threshold: {status.assignedAccuracyThresholdMeters}m)
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t("NoWorkLocationAssigned")}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Daily Summary Statistics */}
        <Box sx={{ pt: 3, mt: 2, borderTop: "1px dashed", borderColor: "divider" }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover", textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  {t("SessionsToday")}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                  {status?.totalSessionsToday ?? 0}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover", textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  {t("TotalHoursToday")}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
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
