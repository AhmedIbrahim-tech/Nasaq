"use client";

import React from "react";
import {
  IconAward,
  IconCircleCheck,
  IconAlertCircle,
  IconAlertTriangle,
  IconHourglassEmpty,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  ModernizeStatsCards,
  ModernizeStatCardItem,
} from "@/shared/components/tables/modernize/ModernizeStatsCards";
import type { EmployeePointsSummary } from "../types";

interface PointsSummaryCardsProps {
  summary: EmployeePointsSummary | null;
  loading?: boolean;
}

export const PointsSummaryCards: React.FC<PointsSummaryCardsProps> = ({
  summary,
  loading = false,
}) => {
  const t = useTranslations();

  const items: ModernizeStatCardItem[] = [
    {
      label: t("TotalPointsBalance"),
      value: summary?.totalFinalizedPoints ?? 0,
      icon: <IconAward size={24} />,
      bgcolor: "primary.light",
      color: "primary.main",
    },
    {
      label: t("GreenPointsPositive"),
      value: `+${summary?.greenPoints ?? 0}`,
      icon: <IconCircleCheck size={24} />,
      bgcolor: "success.light",
      color: "success.main",
    },
    {
      label: t("RedPointsNegative"),
      value: `${summary?.redPoints ?? 0}`,
      icon: <IconAlertCircle size={24} />,
      bgcolor: "error.light",
      color: "error.main",
    },
    {
      label: t("BlackPointsSevere"),
      value: `${summary?.blackPoints ?? 0}`,
      icon: <IconAlertTriangle size={24} />,
      bgcolor: "action.hover",
      color: "text.primary",
    },
    {
      label: t("PendingReviewPoints"),
      value: summary?.pendingPoints ?? 0,
      icon: <IconHourglassEmpty size={24} />,
      bgcolor: "warning.light",
      color: "warning.main",
    },
  ];

  return <ModernizeStatsCards items={items} loading={loading} />;
};
