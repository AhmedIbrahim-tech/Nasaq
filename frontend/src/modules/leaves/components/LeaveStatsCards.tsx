"use client";

import React from "react";
import {
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconCalendarOff,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  ModernizeStatsCards,
  ModernizeStatCardItem,
} from "@/shared/components/tables/modernize/ModernizeStatsCards";
import type { LeaveSummary } from "../types";

interface LeaveStatsCardsProps {
  summary: LeaveSummary | null;
  loading?: boolean;
  isManager?: boolean;
}

export const LeaveStatsCards: React.FC<LeaveStatsCardsProps> = ({
  summary,
  loading = false,
  isManager = false,
}) => {
  const t = useTranslations();

  const items: ModernizeStatCardItem[] = isManager
    ? [
        {
          label: t("PendingLeaves"),
          value: summary?.totalPending ?? 0,
          icon: <IconClock size={24} />,
          bgcolor: "warning.light",
          color: "warning.main",
        },
        {
          label: t("ApprovedLeaves"),
          value: summary?.totalApproved ?? 0,
          icon: <IconCircleCheck size={24} />,
          bgcolor: "success.light",
          color: "success.main",
        },
        {
          label: t("RejectedLeaves"),
          value: summary?.totalRejected ?? 0,
          icon: <IconCircleX size={24} />,
          bgcolor: "error.light",
          color: "error.main",
        },
        {
          label: t("CancelledLeaves"),
          value: summary?.totalCancelled ?? 0,
          icon: <IconCalendarOff size={24} />,
          bgcolor: "grey.200",
          color: "text.secondary",
        },
      ]
    : [
        {
          label: t("MyPendingLeaves"),
          value: summary?.myPendingCount ?? 0,
          icon: <IconClock size={24} />,
          bgcolor: "warning.light",
          color: "warning.main",
        },
        {
          label: t("MyApprovedDaysThisYear"),
          value: `${summary?.myApprovedDaysThisYear ?? 0} ${t("Days")}`,
          icon: <IconCircleCheck size={24} />,
          bgcolor: "success.light",
          color: "success.main",
        },
        {
          label: t("TotalApprovedLeaves"),
          value: summary?.totalApproved ?? 0,
          icon: <IconCalendarOff size={24} />,
          bgcolor: "info.light",
          color: "info.main",
        },
      ];

  return <ModernizeStatsCards items={items} loading={loading} />;
};
