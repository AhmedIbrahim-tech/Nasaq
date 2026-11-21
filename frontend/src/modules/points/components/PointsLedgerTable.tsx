"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import {
  IconArrowBackUp,
  IconCircleCheck,
  IconAlertCircle,
  IconAlertTriangle,
  IconScale,
  IconClockPlay,
  IconCalendarTime,
  IconUserCheck,
  IconAward,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useTheme, alpha } from "@mui/material/styles";
import {
  ModernizeDataTable,
  ModernizeColumnDef,
  ModernizeRowAction,
} from "@/shared/components/tables/modernize/ModernizeDataTable";
import { formatDateTime } from "@/shared/utils/i18nFormatters";
import type { PointTransaction } from "../types";

interface PointsLedgerTableProps {
  transactions: PointTransaction[];
  totalCount: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  showEmployeeColumn?: boolean;
  canReverse?: boolean;
  onReverse?: (transaction: PointTransaction) => void;
}

export const PointsLedgerTable: React.FC<PointsLedgerTableProps> = ({
  transactions,
  totalCount,
  loading,
  page,
  pageSize,
  onPageChange,
  showEmployeeColumn = false,
  canReverse = false,
  onReverse,
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

  const getStatusChip = (status: string) => {
    switch (status) {
      case "Finalized":
        return <Chip label={t("Finalized")} color="success" variant="outlined" size="small" />;
      case "PendingReview":
        return <Chip label={t("PendingReview")} color="warning" variant="outlined" size="small" />;
      case "Reversed":
        return <Chip label={t("Reversed")} color="default" variant="outlined" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const columns: ModernizeColumnDef<PointTransaction>[] = [
    ...(showEmployeeColumn
      ? [
          {
            id: "employee",
            header: t("Employee"),
            cell: (row: PointTransaction) => (
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {row.employeeName}
                </Typography>
                <Typography variant="caption" color="text.secondary" dir="ltr">
                  {row.employeeCode}
                </Typography>
              </Box>
            ),
          },
        ]
      : []),
    {
      id: "date",
      header: t("Date"),
      cell: (row) => (
        <Typography variant="body2" dir="ltr" fontWeight={500}>
          {row.date}
        </Typography>
      ),
    },
    {
      id: "points",
      header: t("Points"),
      cell: (row) => (
        <Typography
          variant="subtitle2"
          fontWeight={700}
          dir="ltr"
          sx={{
            color: row.points > 0 ? "success.main" : "error.main",
          }}
        >
          {row.points > 0 ? `+${row.points}` : row.points}
        </Typography>
      ),
    },
    {
      id: "category",
      header: t("Category"),
      cell: (row) => getCategoryChip(row.category),
    },
    {
      id: "reason",
      header: t("Reason"),
      cell: (row) => (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, wordBreak: "break-word" }}>
          {row.reason}
        </Typography>
      ),
    },
    {
      id: "status",
      header: t("Status"),
      cell: (row) => getStatusChip(row.status),
    },
  ];

  const actions: ModernizeRowAction<PointTransaction>[] = canReverse && onReverse
    ? [
        {
          label: t("ReverseTransaction"),
          icon: <IconArrowBackUp size={18} color="#FA896B" />,
          onClick: (row) => onReverse(row),
          show: (row) => row.status === "Finalized",
        },
      ]
    : [];

  const renderExpandedRow = (tx: PointTransaction) => (
    <Box
      sx={{
        p: 2.5,
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.default, 0.6)
            : alpha(theme.palette.primary.light, 0.2),
        borderRadius: "12px",
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2.5 }}
        flexWrap="wrap"
        gap={1.5}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconAward size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
              {tx.ruleName || t("PointRule")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("TransactionAuditDetails")}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {getCategoryChip(tx.category)}
          {getStatusChip(tx.status)}
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {/* Point Rule */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: "background.paper",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "8px",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconScale size={20} stroke={1.75} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("Rule")}
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {tx.ruleName || t("NotLinkedToRule")}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Source Event */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: "background.paper",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "8px",
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                color: "warning.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconClockPlay size={20} stroke={1.75} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("SourceEvent")}
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {tx.sourceEventType ? (t.has(tx.sourceEventType) ? t(tx.sourceEventType) : tx.sourceEventType) : "—"}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Recorded Timestamp */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: "background.paper",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "8px",
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                color: "info.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconCalendarTime size={20} stroke={1.75} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("RecordedAt")}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  direction: "ltr",
                  unicodeBidi: "isolate",
                  display: "inline-block",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                }}
              >
                {formatDateTime(tx.timestampUtc, isRtl)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Operator / Created By */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: "background.paper",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "8px",
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                color: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconUserCheck size={20} stroke={1.75} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("CreatedBy")}
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {tx.created_By || t("System")}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <ModernizeDataTable
      data={transactions}
      columns={columns}
      loading={loading}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      actions={actions.length > 0 ? actions : undefined}
      renderExpandedRow={renderExpandedRow}
      getRowId={(row) => row.id}
      emptyMessage={t("NoPointTransactionsFound")}
    />
  );
};
