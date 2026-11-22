"use client";

import React from "react";
import {
  IconAlertTriangle,
  IconClockExclamation,
  IconChecklist,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  ModernizeStatsCards,
  ModernizeStatCardItem,
} from "@/shared/components/tables/modernize/ModernizeStatsCards";
import type { AdminOperationsSummary } from "../types";

interface AdminOperationsStatsCardsProps {
  summary: AdminOperationsSummary | null;
  loading?: boolean;
}

export const AdminOperationsStatsCards: React.FC<AdminOperationsStatsCardsProps> = ({
  summary,
  loading = false,
}) => {
  const t = useTranslations();

  const items: ModernizeStatCardItem[] = [
    {
      label: t("PendingGpsExceptions"),
      value: summary?.pendingGpsExceptionsCount ?? 0,
      icon: <IconAlertTriangle size={24} />,
      bgcolor: "warning.light",
      color: "warning.main",
    },
    {
      label: t("IncompleteRecords"),
      value: summary?.incompleteAttendanceCount ?? 0,
      icon: <IconClockExclamation size={24} />,
      bgcolor: "action.hover",
      color: "secondary.main",
    },
    {
      label: t("TodayVerified"),
      value: summary?.todayVerifiedAttendance ?? 0,
      icon: <IconChecklist size={24} />,
      bgcolor: "success.light",
      color: "success.main",
    },
    {
      label: t("TodayTotal"),
      value: summary?.todayTotalAttendance ?? 0,
      icon: <IconUsers size={24} />,
      bgcolor: "primary.light",
      color: "primary.main",
    },
  ];

  return <ModernizeStatsCards items={items} loading={loading} />;
};
