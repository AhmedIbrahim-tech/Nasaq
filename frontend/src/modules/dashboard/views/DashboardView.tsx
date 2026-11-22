"use client";

import React, { useEffect, useState, useMemo, useContext } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import {
  IconUsers,
  IconClockPlay,
  IconCalendarTime,
  IconAlertTriangle,
  IconCalendarCheck,
  IconAward,
  IconChecklist,
  IconClockCheck,
} from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";

import PageContainer from "@/shared/components/container/PageContainer";
import {
  ModernizeStatsCards,
  ModernizeStatCardItem,
} from "@/shared/components/tables/modernize";
import { useAppSelector } from "@/store/hooks";
import { CustomizerContext } from "@/theme/customizerContext";

import { DashboardWelcomeHeader } from "../components/DashboardWelcomeHeader";
import { DashboardRequiresAttention } from "../components/DashboardRequiresAttention";
import { DashboardAdminSection } from "../components/DashboardAdminSection";
import { DashboardEmployeeSection } from "../components/DashboardEmployeeSection";
import { DashboardQuickActions } from "../components/DashboardQuickActions";

import { adminOperationsService } from "@/modules/admin-operations/services/admin-operations.service";
import { employeeService } from "@/modules/employees/services/employee.service";
import { leavesService } from "@/modules/leaves/services/leaves.service";
import { attendanceService } from "@/modules/attendance/services/attendance.service";
import { pointsService } from "@/modules/points/services/points.service";

import type { AdminOperationsSummary } from "@/modules/admin-operations/types";
import type { EmployeesSummary } from "@/modules/employees/types";
import type { LeaveSummary } from "@/modules/leaves/types";
import type { CurrentAttendanceStatus } from "@/modules/attendance/types";
import type { EmployeePointsSummary } from "@/modules/points/types";

export default function DashboardView() {
  const theme = useTheme();
  const t = useTranslations();
  const locale = useLocale();
  const customizer = useContext(CustomizerContext);
  const isRtl =
    customizer?.isLanguage === "ar" ||
    customizer?.activeDir === "rtl" ||
    theme.direction === "rtl" ||
    locale.startsWith("ar");

  const user = useAppSelector((state) => state.auth.user);
  const roles = useAppSelector((state) => state.auth.roles) || [];

  const isAdmin = roles.some((r) => r === "SuperAdmin" || r === "Admin");
  const isSupervisor = roles.some((r) => r === "Supervisor" || r === "DepartmentHead");
  const isEmployeeOnly = !isAdmin && !isSupervisor;
  const displayName = user?.fullName || user?.email?.split("@")[0] || t("User");

  const [loading, setLoading] = useState<boolean>(true);
  const [adminSummary, setAdminSummary] = useState<AdminOperationsSummary | null>(null);
  const [employeesSummary, setEmployeesSummary] = useState<EmployeesSummary | null>(null);
  const [leaveSummary, setLeaveSummary] = useState<LeaveSummary | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<CurrentAttendanceStatus | null>(null);
  const [pointsSummary, setPointsSummary] = useState<EmployeePointsSummary | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchDashboardData = async () => {
      const promises: Promise<any>[] = [];

      // 1. Administrative & Supervisor operations data
      if (isAdmin || isSupervisor) {
        promises.push(
          adminOperationsService.getSummary().then((res) => {
            if (isMounted) setAdminSummary(res);
          })
        );
        promises.push(
          employeeService.getSummary().then((res) => {
            if (isMounted) setEmployeesSummary(res);
          })
        );
      }

      // 2. Leave Summary (Relevant for all roles)
      promises.push(
        leavesService.getSummary().then((res) => {
          if (isMounted) setLeaveSummary(res);
        })
      );

      // 3. Employee personal status & points (Safe: may fail gracefully for admin-only accounts without employee record)
      promises.push(
        attendanceService.getStatus().then((res) => {
          if (isMounted) setAttendanceStatus(res);
        })
      );
      promises.push(
        pointsService.getMySummary().then((res) => {
          if (isMounted) setPointsSummary(res);
        })
      );

      await Promise.allSettled(promises);
      if (isMounted) setLoading(false);
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, isSupervisor]);

  // Construct Role-Tailored KPI Cards using standard ModernizeStatsCards
  const safeT = (key: string, arFallback: string, enFallback: string): string => {
    try {
      if (typeof t.has === "function" && t.has(key as any)) {
        const val = t(key as any);
        if (val && val !== key && !val.includes(key) && !val.startsWith("[Translation error")) {
          // In RTL mode, prevent English fallback string from displaying if an Arabic translation exists
          if (isRtl && /^[\x00-\x7F\s'&]+$/.test(val) && arFallback) {
            return arFallback;
          }
          return val;
        }
      }
    } catch {
      // ignore
    }
    return isRtl ? arFallback : enFallback;
  };

  const kpiItems = useMemo<ModernizeStatCardItem[]>(() => {
    if (isAdmin) {
      return [
        {
          label: safeT("TotalEmployees", "إجمالي الموظفين", "Total Employees"),
          value: employeesSummary?.totalEmployees ?? 0,
          color: "primary.main",
          bgcolor: "primary.light",
          icon: <IconUsers size={22} color={theme.palette.primary.main} stroke={1.75} />,
        },
        {
          label: safeT("TodayAttendance", "حضور اليوم", "Today's Attendance"),
          value: adminSummary?.todayTotalAttendance ?? 0,
          color: "success.main",
          bgcolor: "success.light",
          icon: <IconClockPlay size={22} color={theme.palette.success.main} stroke={1.75} />,
        },
        {
          label: safeT("PendingLeaves", "طلبات معلقة", "Pending Leaves"),
          value: leaveSummary?.totalPending ?? 0,
          color: "warning.main",
          bgcolor: "warning.light",
          icon: <IconCalendarTime size={22} color={theme.palette.warning.main} stroke={1.75} />,
        },
        {
          label: safeT("ExceptionsAndIncomplete", "استثناءات وسجلات معلقة", "Exceptions & Incomplete"),
          value:
            (adminSummary?.pendingGpsExceptionsCount ?? 0) +
            (adminSummary?.incompleteAttendanceCount ?? 0),
          color: "error.main",
          bgcolor: "error.light",
          icon: <IconAlertTriangle size={22} color={theme.palette.error.main} stroke={1.75} />,
        },
      ];
    }

    if (isSupervisor) {
      return [
        {
          label: safeT("TeamAttendanceToday", "حضور الفريق اليوم", "Team Attendance Today"),
          value: adminSummary?.todayTotalAttendance ?? 0,
          color: "success.main",
          bgcolor: "success.light",
          icon: <IconClockPlay size={22} color={theme.palette.success.main} stroke={1.75} />,
        },
        {
          label: safeT("PendingApprovals", "طلبات بانتظار الاعتماد", "Pending Approvals"),
          value: leaveSummary?.totalPending ?? 0,
          color: "warning.main",
          bgcolor: "warning.light",
          icon: <IconChecklist size={22} color={theme.palette.warning.main} stroke={1.75} />,
        },
        {
          label: safeT("ExceptionsQueue", "طابور الاستثناءات", "Exceptions Queue"),
          value: adminSummary?.pendingGpsExceptionsCount ?? 0,
          color: "error.main",
          bgcolor: "error.light",
          icon: <IconAlertTriangle size={22} color={theme.palette.error.main} stroke={1.75} />,
        },
        {
          label: safeT("ActiveTeamMembers", "أعضاء الفريق النشطين", "Active Team Members"),
          value: employeesSummary?.activeEmployees ?? employeesSummary?.totalEmployees ?? 0,
          color: "primary.main",
          bgcolor: "primary.light",
          icon: <IconUsers size={22} color={theme.palette.primary.main} stroke={1.75} />,
        },
      ];
    }

    // Default Employee KPI Items
    const isCheckedIn = Boolean(attendanceStatus?.isCheckedIn);
    return [
      {
        label: safeT("TodayStatus", "حالة اليوم", "Today's Status"),
        value: isCheckedIn ? safeT("Present", "حاضر", "Present") : safeT("NotCheckedIn", "لم يسجل", "Not Checked In"),
        color: isCheckedIn ? "success.main" : "warning.main",
        bgcolor: isCheckedIn ? "success.light" : "warning.light",
        icon: <IconClockCheck size={22} color={isCheckedIn ? theme.palette.success.main : theme.palette.warning.main} stroke={1.75} />,
      },
      {
        label: safeT("TotalPoints", "رصيد النقاط", "Total Points"),
        value: pointsSummary?.totalFinalizedPoints ?? 0,
        color: "warning.main",
        bgcolor: "warning.light",
        icon: <IconAward size={22} color={theme.palette.warning.main} stroke={1.75} />,
      },
      {
        label: safeT("MyPendingLeaves", "طلبات إجازاتي المعلقة", "My Pending Leaves"),
        value: leaveSummary?.myPendingCount ?? 0,
        color: "info.main",
        bgcolor: "info.light",
        icon: <IconCalendarTime size={22} color={theme.palette.info.main} stroke={1.75} />,
      },
      {
        label: safeT("ApprovedLeavesThisYear", "إجازات معتمدة هذا العام", "Approved Leaves This Year"),
        value: leaveSummary?.myApprovedDaysThisYear ?? 0,
        color: "secondary.main",
        bgcolor: "secondary.light",
        icon: <IconCalendarCheck size={22} color={theme.palette.secondary.main} stroke={1.75} />,
      },
    ];
  }, [isAdmin, isSupervisor, adminSummary, employeesSummary, leaveSummary, attendanceStatus, pointsSummary, t, theme, isRtl]);

  return (
    <PageContainer
      title={`${t("DashboardTitle")} — NASAQ`}
      description={t("DashboardSubtitle")}
    >
      <Stack spacing={3} sx={{ mt: 1 }}>
        {/* 1. Compact Personalized Welcome Header */}
        <DashboardWelcomeHeader
          displayName={displayName}
          photoId={user?.profilePhoto}
          roles={roles}
          isAdmin={isAdmin}
          isSupervisor={isSupervisor}
        />

        {/* 2. Role-Appropriate Operational KPI Summary Cards */}
        <ModernizeStatsCards items={kpiItems} loading={loading} />

        {/* 3. Actionable "Requires Attention" Section */}
        <DashboardRequiresAttention
          isAdmin={isAdmin}
          isSupervisor={isSupervisor}
          adminSummary={adminSummary}
          leaveSummary={leaveSummary}
          attendanceStatus={attendanceStatus}
          loading={loading}
        />

        {/* 4. Role-Tailored Operational Breakdown */}
        {(isAdmin || isSupervisor) && (
          <DashboardAdminSection
            adminSummary={adminSummary}
            employeesSummary={employeesSummary}
            loading={loading}
          />
        )}

        {/* Employee Section: Shift & Location + Points Ledger */}
        {(isEmployeeOnly || (!isAdmin && !isSupervisor)) && (
          <DashboardEmployeeSection
            attendanceStatus={attendanceStatus}
            pointsSummary={pointsSummary}
            loading={loading}
          />
        )}

        {/* 5. Contextual Quick Actions */}
        <DashboardQuickActions isAdmin={isAdmin} isSupervisor={isSupervisor} />
      </Stack>
    </PageContainer>
  );
}
