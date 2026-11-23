"use client";

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  ModernizeDataTable,
  ModernizeColumnDef,
  ModernizeRowAction,
} from "@/shared/components/tables/modernize/ModernizeDataTable";
import { ModernizeTableToolbar } from "@/shared/components/tables/modernize/ModernizeTableToolbar";
import { formatDateOnly } from "@/shared/utils/i18nFormatters";
import { getLocalizedName, getLocalizedDescription } from "@/shared/utils/localization";
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
  onAddNew?: () => void;
  onRefresh?: () => void;
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
  onAddNew,
  onRefresh,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

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
      cell: (row) => {
        const desc = getLocalizedDescription(row, isRtl);
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {getLocalizedName(row, isRtl)}
            </Typography>
            {desc && desc !== "—" && (
              <Typography variant="caption" color="text.secondary">
                {desc}
              </Typography>
            )}
          </Box>
        );
      },
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
          sx={{ color: row.points > 0 ? "success.main" : "error.main" }}
        >
          <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}>
            {row.points > 0 ? `+${row.points}` : row.points}
          </span>
        </Typography>
      ),
    },
    {
      id: "effectiveDates",
      header: t("EffectiveDates"),
      cell: (row) => (
        <Typography variant="caption" color="text.secondary">
          <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}>
            {row.effectiveFrom ? formatDateOnly(row.effectiveFrom, isRtl) : ""} {row.effectiveTo ? `→ ${formatDateOnly(row.effectiveTo, isRtl)}` : `(${t("OpenEnded")})`}
          </span>
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
      icon: <IconPencil size={18} color={theme.palette.warning.main} />,
      onClick: (row) => onEdit(row),
    },
  ];

  return (
    <Stack spacing={2.5}>
      <ModernizeTableToolbar
        title={t("ConfiguredPointRules")}
        action={
          onAddNew ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconPlus size={18} />}
              onClick={onAddNew}
              sx={{ borderRadius: "8px", fontWeight: 600 }}
            >
              {t("NewRule")}
            </Button>
          ) : undefined
        }
        onRefresh={onRefresh}
        isRefreshing={loading}
        showFilters={false}
        onToggleFilters={() => {}}
      />
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
    </Stack>
  );
};
