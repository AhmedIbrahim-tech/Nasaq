"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import { useTheme, alpha } from "@mui/material/styles";
import {
  IconClockCheck,
  IconUsers,
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconArrowRight,
  IconArrowLeft,
  IconMapPin,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { AdminOperationsSummary } from "@/modules/admin-operations/types";
import type { EmployeesSummary } from "@/modules/employees/types";

interface DashboardAdminSectionProps {
  adminSummary?: AdminOperationsSummary | null;
  employeesSummary?: EmployeesSummary | null;
  loading?: boolean;
}

export const DashboardAdminSection: React.FC<DashboardAdminSectionProps> = ({
  adminSummary,
  employeesSummary,
  loading = false,
}) => {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === "rtl";
  const isDark = theme.palette.mode === "dark";

  if (loading) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: "14px" }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: "14px" }} />
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* 1. Today's Attendance Operations Overview */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            height: "100%",
            borderRadius: "12px",
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconClockCheck size={20} stroke={1.75} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {t("TodayAttendanceOverview")}
              </Typography>
            </Stack>

            <Button
              component={Link}
              href="/admin-operations"
              size="small"
              endIcon={isRtl ? <IconArrowLeft size={14} /> : <IconArrowRight size={14} />}
              sx={{ fontWeight: 600, fontSize: "0.8rem" }}
            >
              {t("ViewAll")}
            </Button>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Stack spacing={2} sx={{ flex: 1, justifyContent: "center" }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 1.5,
                borderRadius: "8px",
                bgcolor: alpha(theme.palette.success.main, isDark ? 0.15 : 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <IconCheck size={18} color={theme.palette.success.main} />
                <Typography variant="body2" fontWeight={600}>
                  {t("Verified")}
                </Typography>
              </Stack>
              <Typography variant="subtitle1" fontWeight={700} color="success.main">
                {adminSummary?.todayVerifiedAttendance ?? 0}
              </Typography>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 1.5,
                borderRadius: "8px",
                bgcolor: alpha(theme.palette.warning.main, isDark ? 0.15 : 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <IconAlertTriangle size={18} color={theme.palette.warning.main} />
                <Typography variant="body2" fontWeight={600}>
                  {t("PendingReview")}
                </Typography>
              </Stack>
              <Typography variant="subtitle1" fontWeight={700} color="warning.main">
                {adminSummary?.todayPendingAttendance ?? 0}
              </Typography>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 1.5,
                borderRadius: "8px",
                bgcolor: alpha(theme.palette.error.main, isDark ? 0.15 : 0.05),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <IconX size={18} color={theme.palette.error.main} />
                <Typography variant="body2" fontWeight={600}>
                  {t("Rejected")}
                </Typography>
              </Stack>
              <Typography variant="subtitle1" fontWeight={700} color="error.main">
                {adminSummary?.todayRejectedAttendance ?? 0}
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Grid>

      {/* 2. Workforce & Organization Capacity */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            height: "100%",
            borderRadius: "12px",
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
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
                }}
              >
                <IconUsers size={20} stroke={1.75} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {t("WorkforceCapacity")}
              </Typography>
            </Stack>

            <Button
              component={Link}
              href="/employees"
              size="small"
              endIcon={isRtl ? <IconArrowLeft size={14} /> : <IconArrowRight size={14} />}
              sx={{ fontWeight: 600, fontSize: "0.8rem" }}
            >
              {t("ViewAll")}
            </Button>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Stack spacing={2} sx={{ flex: 1, justifyContent: "center" }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 1.5,
                borderRadius: "8px",
                bgcolor: alpha(theme.palette.text.primary, 0.03),
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {t("TotalEmployees")}
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                {employeesSummary?.totalEmployees ?? 0}
              </Typography>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 1.5,
                borderRadius: "8px",
                bgcolor: alpha(theme.palette.text.primary, 0.03),
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {t("ActiveEmployees")}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  label={t("Active")}
                  color="success"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                />
                <Typography variant="subtitle1" fontWeight={700} color="success.main">
                  {employeesSummary?.activeEmployees ?? 0}
                </Typography>
              </Stack>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 1.5,
                borderRadius: "8px",
                bgcolor: alpha(theme.palette.text.primary, 0.03),
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <IconMapPin size={16} color={theme.palette.text.secondary} />
                <Typography variant="body2" fontWeight={600}>
                  {t("AssignedWorkLocation")}
                </Typography>
              </Stack>
              <Typography variant="subtitle1" fontWeight={700}>
                {employeesSummary?.assignedLocationCount ?? 0}
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
};
