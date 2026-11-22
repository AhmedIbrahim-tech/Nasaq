"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { useTheme, alpha } from "@mui/material/styles";
import {
  IconAlertTriangle,
  IconClockExclamation,
  IconCalendarOff,
  IconCircleCheck,
  IconArrowRight,
  IconArrowLeft,
  IconClockPlay,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { AdminOperationsSummary } from "@/modules/admin-operations/types";
import type { LeaveSummary } from "@/modules/leaves/types";
import type { CurrentAttendanceStatus } from "@/modules/attendance/types";

interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  count?: number;
  icon: React.ReactNode;
  color: string;
  bgcolor: string;
  href: string;
  actionText: string;
}

interface DashboardRequiresAttentionProps {
  isAdmin: boolean;
  isSupervisor: boolean;
  adminSummary?: AdminOperationsSummary | null;
  leaveSummary?: LeaveSummary | null;
  attendanceStatus?: CurrentAttendanceStatus | null;
  loading?: boolean;
}

export const DashboardRequiresAttention: React.FC<DashboardRequiresAttentionProps> = ({
  isAdmin,
  isSupervisor,
  adminSummary,
  leaveSummary,
  attendanceStatus,
  loading = false,
}) => {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === "rtl";
  const isDark = theme.palette.mode === "dark";

  if (loading) {
    return (
      <Skeleton
        variant="rounded"
        height={140}
        sx={{ borderRadius: "14px" }}
      />
    );
  }

  const actionItems: ActionItem[] = [];

  if (isAdmin || isSupervisor) {
    if (leaveSummary && leaveSummary.totalPending > 0) {
      actionItems.push({
        id: "leaves",
        title: t("PendingLeaveApprovalsCount"),
        subtitle: `${leaveSummary.totalPending} ${t("PendingReview")}`,
        count: leaveSummary.totalPending,
        icon: <IconCalendarOff size={22} stroke={1.75} />,
        color: theme.palette.warning.main,
        bgcolor: alpha(theme.palette.warning.main, isDark ? 0.2 : 0.1),
        href: "/leaves",
        actionText: t("ReviewPendingRequests"),
      });
    }

    if (adminSummary && adminSummary.pendingGpsExceptionsCount > 0) {
      actionItems.push({
        id: "gps",
        title: t("PendingGpsExceptionsCount"),
        subtitle: `${adminSummary.pendingGpsExceptionsCount} ${t("PendingReview")}`,
        count: adminSummary.pendingGpsExceptionsCount,
        icon: <IconAlertTriangle size={22} stroke={1.75} />,
        color: theme.palette.error.main,
        bgcolor: alpha(theme.palette.error.main, isDark ? 0.2 : 0.1),
        href: "/admin-operations",
        actionText: t("ReviewGpsExceptions"),
      });
    }

    if (adminSummary && adminSummary.incompleteAttendanceCount > 0) {
      actionItems.push({
        id: "incomplete",
        title: t("IncompleteAttendanceRecordsCount"),
        subtitle: `${adminSummary.incompleteAttendanceCount} ${t("Incomplete")}`,
        count: adminSummary.incompleteAttendanceCount,
        icon: <IconClockExclamation size={22} stroke={1.75} />,
        color: theme.palette.secondary.main,
        bgcolor: alpha(theme.palette.secondary.main, isDark ? 0.2 : 0.1),
        href: "/admin-operations",
        actionText: t("CorrectIncompleteRecords"),
      });
    }
  } else {
    // Employee self-scope actionable items
    if (attendanceStatus) {
      if (attendanceStatus.hasScheduledShift && !attendanceStatus.isCheckedIn && !attendanceStatus.isOnApprovedLeave) {
        actionItems.push({
          id: "checkin",
          title: t("CheckInRequiredAction"),
          subtitle: attendanceStatus.todayShift?.startTime
            ? `${t("CheckInRequiredDesc")} (${attendanceStatus.todayShift.startTime})`
            : t("CheckInRequiredDesc"),
          icon: <IconClockPlay size={22} stroke={1.75} />,
          color: theme.palette.primary.main,
          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1),
          href: "/attendance",
          actionText: t("CheckInNow"),
        });
      } else if (attendanceStatus.isCheckedIn) {
        actionItems.push({
          id: "checkout",
          title: t("CheckOutAvailableAction"),
          subtitle: t("CheckOutAvailableDesc"),
          icon: <IconClockPlay size={22} stroke={1.75} />,
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, isDark ? 0.2 : 0.1),
          href: "/attendance",
          actionText: t("CheckOutNow"),
        });
      }
    }
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.75 }}>
        {t("RequiresAttention")}
      </Typography>

      {actionItems.length > 0 ? (
        <Grid container spacing={2}>
          {actionItems.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: actionItems.length === 1 ? 12 : actionItems.length === 2 ? 6 : 4 }}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "10px",
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    borderColor: item.color,
                    boxShadow: `0 4px 16px ${alpha(item.color, 0.12)}`,
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "10px",
                      bgcolor: item.bgcolor,
                      color: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                      {item.subtitle}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  component={Link}
                  href={item.href}
                  variant="outlined"
                  size="small"
                  endIcon={isRtl ? <IconArrowLeft size={16} /> : <IconArrowRight size={16} />}
                  sx={{
                    flexShrink: 0,
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    borderColor: theme.palette.divider,
                    color: "text.primary",
                    "&:hover": {
                      borderColor: item.color,
                      color: item.color,
                      bgcolor: item.bgcolor,
                    },
                  }}
                >
                  {item.actionText}
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card
          elevation={0}
          sx={{
            p: 2.25,
            borderRadius: "10px",
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.success.main, isDark ? 0.1 : 0.04),
          }}
        >
          <Stack direction="row" spacing={1.75} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "8px",
                bgcolor: alpha(theme.palette.success.main, 0.15),
                color: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconCircleCheck size={22} stroke={2} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                {t("AllClearNoPendingItems")}
              </Typography>
            </Box>
          </Stack>
        </Card>
      )}
    </Box>
  );
};
