"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import { IconEdit, IconCheck, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  ModernizeDataTable,
  ModernizeColumnDef,
  ModernizeRowAction,
} from "@/shared/components/tables/modernize/ModernizeDataTable";
import type { PointRule } from "../types";

interface PointRulesTableProps {
  rules: PointRule[];
  totalCount: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onEdit: (rule: PointRule) => void;
  onToggleStatus: (rule: PointRule) => void;
}

export const PointRulesTable: React.FC<PointRulesTableProps> = ({
  rules,
  totalCount,
  loading,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onToggleStatus,
}) => {
  const t = useTranslations();

  const getCategoryChip = (cat: string) => {
    switch (cat) {
      case "Green":
        return <Chip label={t("GreenCategory")} color="success" size="small" />;
      case "Red":
        return <Chip label={t("RedCategory")} color="warning" size="small" />;
      case "Black":
        return <Chip label={t("BlackCategory")} color="error" size="small" />;
      default:
        return <Chip label={cat} size="small" />;
    }
  };

  const columns: ModernizeColumnDef<PointRule>[] = [
    {
      id: "name",
      header: t("RuleName"),
      cell: (row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {row.name}
          </Typography>
          {row.description && (
            <Typography variant="caption" color="text.secondary">
              {row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: "category",
      header: t("Category"),
      cell: (row) => getCategoryChip(row.category),
    },
    {
      id: "eventType",
      header: t("EventType"),
      cell: (row) => (
        <Chip label={t(row.eventType)} variant="outlined" size="small" />
      ),
    },
    {
      id: "points",
      header: t("PointsValue"),
      cell: (row) => (
        <Typography
          variant="subtitle2"
          fontWeight={700}
          dir="ltr"
          sx={{ color: row.points > 0 ? "success.main" : "error.main" }}
        >
          {row.points > 0 ? `+${row.points}` : row.points}
        </Typography>
      ),
    },
    {
      id: "effectiveDates",
      header: t("EffectiveDates"),
      cell: (row) => (
        <Typography variant="caption" dir="ltr" color="text.secondary">
          {row.effectiveFrom} {row.effectiveTo ? `→ ${row.effectiveTo}` : `(${t("OpenEnded")})`}
        </Typography>
      ),
    },
    {
      id: "status",
      header: t("Status"),
      cell: (row) => (
        <Switch
          size="small"
          checked={row.isActive}
          onChange={() => onToggleStatus(row)}
          color="primary"
        />
      ),
    },
  ];

  const actions: ModernizeRowAction<PointRule>[] = [
    {
      label: t("EditRule"),
      icon: <IconEdit size={18} color="#5D87FF" />,
      onClick: (row) => onEdit(row),
    },
  ];

  return (
    <ModernizeDataTable
      data={rules}
      columns={columns}
      loading={loading}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      actions={actions}
      getRowId={(row) => row.id}
      emptyMessage={t("NoPointRulesFound")}
    />
  );
};
