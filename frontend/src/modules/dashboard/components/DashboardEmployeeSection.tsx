"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { alpha, useTheme } from "@mui/material/styles";
import {
  IconClock,
  IconMapPin,
  IconAward,
  IconCheck,
  IconX,
  IconArrowRight,
  IconArrowLeft,
} from "@tabler/icons-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatTimeOnly } from "@/shared/utils/i18nFormatters";
import type { CurrentAttendanceStatus } from "@/modules/attendance/types";
import type { EmployeePointsSummary } from "@/modules/points/types";

interface DashboardEmployeeSectionProps {
  attendanceStatus: CurrentAttendanceStatus | null;
  pointsSummary: EmployeePointsSummary | null;
  loading: boolean;
}

export const DashboardEmployeeSection: React.FC<DashboardEmployeeSectionProps> = ({
  attendanceStatus,
  pointsSummary,
  loading,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  if (loading) {
    return (
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={220} sx={{ borderRadius: "14px" }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={220} sx={{ borderRadius: "14px" }} />
        </Grid>
      </Grid>
    );
  }

  const shift = attendanceStatus?.todayShift;
  const isCheckedIn = Boolean(attendanceStatus?.isCheckedIn);
  const locationName = isRtl
    ? attendanceStatus?.assignedLocationNameAr || attendanceStatus?.assignedLocationName || t("NotAssigned")
    : attendanceStatus?.assignedLocationName || t("NotAssigned");
  const shiftName = isRtl
    ? shift?.nameAr || shift?.name || t("NoScheduledShiftToday")
    : shift?.name || t("NoScheduledShiftToday");

  return (
    <Grid container spacing={2.5}>
      {/* 1. Today's Work Shift & Location */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          variant="outlined"
          sx={{
            height: "100%",
            borderRadius: "14px",
            borderColor: "divider",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: (th) => `0 6px 20px ${alpha(th.palette.primary.main, 0.08)}`,
            },
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {t("TodayShiftAndLocation")}
              </Typography>
              <Chip
                size="small"
                icon={isCheckedIn ? <IconCheck size={14} /> : <IconX size={14} />}
                label={isCheckedIn ? t("CurrentlyCheckedIn") : t("NotCheckedIn")}
                color={isCheckedIn ? "success" : "default"}
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            <Stack spacing={2}>
              {/* Location item */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: "10px",
                  bgcolor: (th) => alpha(th.palette.primary.main, 0.05),
                  border: (th) => `1px solid ${alpha(th.palette.primary.main, 0.12)}`,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconMapPin size={20} stroke={1.75} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {t("AssignedLocation")}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} noWrap color="text.primary">
                    {locationName}
                  </Typography>
                </Box>
              </Box>

              {/* Shift item */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: "10px",
                  bgcolor: (th) => alpha(th.palette.info.main, 0.05),
                  border: (th) => `1px solid ${alpha(th.palette.info.main, 0.12)}`,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                    bgcolor: "info.main",
                    color: "info.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconClock size={20} stroke={1.75} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {t("WorkShift")}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} noWrap color="text.primary">
                    {shiftName}
                    {shift?.startTime && shift?.endTime && (
                      <span
                        style={{
                          marginInlineStart: "8px",
                          direction: "ltr",
                          unicodeBidi: "isolate",
                          display: "inline-block",
                          fontFamily: "monospace",
                          fontWeight: 500,
                          fontSize: "0.8rem",
                          color: theme.palette.text.secondary,
                        }}
                      >
                        ({shift.startTime} – {shift.endTime})
                      </span>
                    )}
                  </Typography>
                </Box>
              </Box>

              {/* Checkin timestamp note if checked in */}
              {isCheckedIn && attendanceStatus?.activeAttendance?.checkInTimeUtc && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: isRtl ? "right" : "left" }}>
                  {t("CheckedInAt")}:{" "}
                  <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block", fontWeight: 600 }}>
                    {formatTimeOnly(attendanceStatus.activeAttendance.checkInTimeUtc, isRtl)}
                  </span>
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* 2. Points Ledger & Recognition */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          variant="outlined"
          sx={{
            height: "100%",
            borderRadius: "14px",
            borderColor: "divider",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: (th) => `0 6px 20px ${alpha(th.palette.success.main, 0.08)}`,
            },
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {t("PointsLedgerSummary")}
              </Typography>
              <Button
                component={Link}
                href="/points"
                size="small"
                variant="text"
                color="primary"
                endIcon={isRtl ? <IconArrowLeft size={16} /> : <IconArrowRight size={16} />}
                sx={{ fontWeight: 600, textTransform: "none", p: 0.5 }}
              >
                {t("ViewPointsLedger")}
              </Button>
            </Stack>

            <Stack spacing={2}>
              {/* Total points balance highlight */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  borderRadius: "10px",
                  bgcolor: (th) => alpha(th.palette.warning.main, 0.06),
                  border: (th) => `1px solid ${alpha(th.palette.warning.main, 0.2)}`,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "10px",
                      bgcolor: "warning.main",
                      color: "warning.contrastText",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconAward size={24} stroke={1.75} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {t("TotalFinalizedPoints")}
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="text.primary">
                      {pointsSummary?.totalFinalizedPoints ?? 0}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Categorical breakdown chips */}
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Chip
                  label={`${t("GreenPoints")}: +${pointsSummary?.greenPoints ?? 0}`}
                  color="success"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600, borderRadius: "8px" }}
                />
                <Chip
                  label={`${t("RedPoints")}: ${pointsSummary?.redPoints ?? 0}`}
                  color="error"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600, borderRadius: "8px" }}
                />
                <Chip
                  label={`${t("BlackPoints")}: ${pointsSummary?.blackPoints ?? 0}`}
                  color="default"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600, borderRadius: "8px" }}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
