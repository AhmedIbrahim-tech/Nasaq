"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { alpha, useTheme } from "@mui/material/styles";
import {
  IconClockPlay,
  IconCalendarPlus,
  IconShieldCheck,
  IconFileAnalytics,
  IconAward,
  IconUser,
  IconChecklist,
} from "@tabler/icons-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface DashboardQuickActionsProps {
  isAdmin: boolean;
  isSupervisor: boolean;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  isAdmin,
  isSupervisor,
}) => {
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

  const getActions = () => {
    if (isAdmin) {
      return [
        {
          label: safeT("RecordAttendance", "تسجيل الحضور", "Record Attendance"),
          href: "/attendance",
          icon: <IconClockPlay size={18} stroke={1.75} />,
          color: "primary" as const,
        },
        {
          label: safeT("SubmitLeaveRequest", "طلب إجازة جديد", "Request Leave"),
          href: "/leaves",
          icon: <IconCalendarPlus size={18} stroke={1.75} />,
          color: "info" as const,
        },
        {
          label: safeT("ReviewExceptions", "مراجعة الاستثناءات", "Review Exceptions"),
          href: "/admin-operations",
          icon: <IconShieldCheck size={18} stroke={1.75} />,
          color: "warning" as const,
        },
        {
          label: safeT("ReportsCenter", "التقارير والتصدير", "Reports & Export"),
          href: "/reports",
          icon: <IconFileAnalytics size={18} stroke={1.75} />,
          color: "secondary" as const,
        },
      ];
    }

    if (isSupervisor) {
      return [
        {
          label: safeT("RecordAttendance", "تسجيل الحضور", "Record Attendance"),
          href: "/attendance",
          icon: <IconClockPlay size={18} stroke={1.75} />,
          color: "primary" as const,
        },
        {
          label: safeT("SubmitLeaveRequest", "طلب إجازة جديد", "Request Leave"),
          href: "/leaves",
          icon: <IconCalendarPlus size={18} stroke={1.75} />,
          color: "info" as const,
        },
        {
          label: safeT("ReviewApprovals", "طلبات الاعتماد", "Review Approvals"),
          href: "/leaves",
          icon: <IconChecklist size={18} stroke={1.75} />,
          color: "warning" as const,
        },
        {
          label: safeT("AdminOperations", "العمليات والإشراف", "Admin Operations"),
          href: "/admin-operations",
          icon: <IconShieldCheck size={18} stroke={1.75} />,
          color: "secondary" as const,
        },
      ];
    }

    // Standard Employee actions
    return [
      {
        label: safeT("CheckInOrOut", "تسجيل الحضور / الانصراف", "Check In / Out"),
        href: "/attendance",
        icon: <IconClockPlay size={18} stroke={1.75} />,
        color: "primary" as const,
      },
      {
        label: safeT("SubmitLeaveRequest", "طلب إجازة جديد", "Request Leave"),
        href: "/leaves",
        icon: <IconCalendarPlus size={18} stroke={1.75} />,
        color: "info" as const,
      },
      {
        label: safeT("MyPointsLedger", "سجل النقاط", "Points Ledger"),
        href: "/points",
        icon: <IconAward size={18} stroke={1.75} />,
        color: "warning" as const,
      },
      {
        label: safeT("MyProfile", "الملف الشخصي", "My Profile"),
        href: "/profile",
        icon: <IconUser size={18} stroke={1.75} />,
        color: "secondary" as const,
      },
    ];
  };

  const actions = getActions();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "14px",
        borderColor: "divider",
        bgcolor: (th) =>
          th.palette.mode === "dark"
            ? alpha(th.palette.background.default, 0.5)
            : alpha(th.palette.primary.main, 0.02),
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 2 }}>
          {t("QuickActions")}
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap" useFlexGap>
          {actions.map((act) => (
            <Button
              key={act.href + act.label}
              component={Link}
              href={act.href}
              variant="outlined"
              color={act.color}
              startIcon={act.icon}
              sx={{
                borderRadius: "10px",
                fontWeight: 600,
                px: 2.5,
                py: 1.1,
                fontSize: "0.875rem",
                textTransform: "none",
                bgcolor: (th) => alpha(th.palette[act.color].main, 0.04),
                borderColor: (th) => alpha(th.palette[act.color].main, 0.25),
                "&:hover": {
                  bgcolor: (th) => alpha(th.palette[act.color].main, 0.12),
                  borderColor: `${act.color}.main`,
                },
              }}
            >
              {act.label}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
