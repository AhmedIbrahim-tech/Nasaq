"use client";

import React, { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import {
  IconUsers,
  IconChecklist,
  IconClock,
  IconAlertTriangle,
  IconClockCheck,
  IconCalendarCheck,
  IconAward,
  IconChartBar,
} from "@tabler/icons-react";
import { useLocale } from "next-intl";
import {
  ModernizeStatsCards,
  ModernizeStatCardItem,
} from "@/shared/components/tables/modernize/ModernizeStatsCards";
import type { ReportSummaryKpi } from "../types";

interface ReportKpisSummaryProps {
  kpis: ReportSummaryKpi[];
  loading: boolean;
}

export const ReportKpisSummary: React.FC<ReportKpisSummaryProps> = ({ kpis, loading }) => {
  const theme = useTheme();
  const locale = useLocale();
  const isAr = locale.startsWith("ar");

  const getKpiStyle = (key: string, idx: number) => {
    switch (key.toLowerCase()) {
      case "total_records":
      case "total_attendance":
      case "total_employees":
      case "total_workforce":
      case "total_requests":
      case "active_employees":
        return {
          bgcolor: "primary.light",
          color: "primary.main",
          icon: <IconUsers size={22} color={theme.palette.primary.main} />,
        };
      case "verified_records":
      case "total_shifts":
      case "active_count":
      case "active_staff":
      case "approved_days":
      case "total_green":
      case "on_time":
        return {
          bgcolor: "success.light",
          color: "success.main",
          icon: <IconChecklist size={22} color={theme.palette.success.main} />,
        };
      case "pending_review":
      case "pending_requests":
      case "late_count":
      case "total_late":
      case "warning":
        return {
          bgcolor: "warning.light",
          color: "warning.main",
          icon: <IconClock size={22} color={theme.palette.warning.main} />,
        };
      case "incomplete":
      case "missing_checkout":
      case "black_card_count":
      case "total_black":
      case "rejected_requests":
      case "employees_flagged":
      case "critical":
        return {
          bgcolor: "error.light",
          color: "error.main",
          icon: <IconAlertTriangle size={22} color={theme.palette.error.main} />,
        };
      case "total_hours":
      case "total_hours_logged":
      case "avg_net_points":
      case "net_balance":
        return {
          bgcolor: "info.light",
          color: "info.main",
          icon: <IconClockCheck size={22} color={theme.palette.info.main} />,
        };
      case "approved_leaves":
        return {
          bgcolor: "secondary.light",
          color: "secondary.main",
          icon: <IconCalendarCheck size={22} color={theme.palette.secondary.main} />,
        };
      default: {
        const cycle = [
          {
            bgcolor: "primary.light",
            color: "primary.main",
            icon: <IconChartBar size={22} color={theme.palette.primary.main} />,
          },
          {
            bgcolor: "success.light",
            color: "success.main",
            icon: <IconChecklist size={22} color={theme.palette.success.main} />,
          },
          {
            bgcolor: "warning.light",
            color: "warning.main",
            icon: <IconClock size={22} color={theme.palette.warning.main} />,
          },
          {
            bgcolor: "error.light",
            color: "error.main",
            icon: <IconAlertTriangle size={22} color={theme.palette.error.main} />,
          },
          {
            bgcolor: "info.light",
            color: "info.main",
            icon: <IconAward size={22} color={theme.palette.info.main} />,
          },
        ];
        return cycle[idx % cycle.length];
      }
    }
  };

  const statItems: ModernizeStatCardItem[] = useMemo(() => {
    if (!kpis || kpis.length === 0) {
      if (loading) {
        return Array.from({ length: 5 }).map((_, i) => ({
          value: 0,
          label: "",
          icon: <IconChartBar size={22} />,
          bgcolor: "primary.light",
          color: "primary.main",
        }));
      }
      return [];
    }

    return kpis.map((kpi, idx) => {
      const style = getKpiStyle(kpi.key || "", idx);
      const label = isAr ? kpi.labelAr : kpi.labelEn;
      const formattedValue =
        typeof kpi.value === "number"
          ? kpi.value.toLocaleString(isAr ? "ar-SA-u-nu-latn" : "en-US")
          : kpi.value;

      return {
        value: formattedValue,
        label,
        icon: style.icon,
        bgcolor: style.bgcolor,
        color: style.color,
      };
    });
  }, [kpis, loading, isAr, theme]);

  if (!loading && statItems.length === 0) {
    return null;
  }

  return <ModernizeStatsCards items={statItems} loading={loading} />;
};
