"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { useLocale, useTranslations } from "next-intl";
import {
  ModernizeDataTable,
  ModernizeColumnDef,
} from "@/shared/components/tables/modernize/ModernizeDataTable";
import type { ReportColumn } from "../types";

interface ReportDataTableProps {
  columns: ReportColumn[];
  rows: Record<string, any>[];
  totalRecords: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

export const ReportDataTable: React.FC<ReportDataTableProps> = ({
  columns,
  rows,
  totalRecords,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale.startsWith("ar");

  const getBadgeColor = (val: string) => {
    switch (val) {
      case "Verified":
      case "Completed":
      case "Approved":
      case "Active":
      case "Paid":
      case "Green":
      case "OnTime":
        return "success";
      case "PendingReview":
      case "Pending":
      case "Late":
      case "LateArrival":
      case "Warning":
      case "Review":
        return "warning";
      case "Rejected":
      case "AfterCutoff":
      case "Black":
      case "Critical":
        return "error";
      case "Present":
      case "Submitted":
        return "primary";
      case "Incomplete":
      case "MissingCheckOut":
        return "secondary";
      default:
        return "default";
    }
  };

  const tableColumns: ModernizeColumnDef<Record<string, any>>[] = columns.map((col) => ({
    id: col.key,
    header: isAr ? col.labelAr : col.labelEn,
    align: col.align || "left",
    cell: (row) => {
      const val = row[col.key];

      if (val == null || val === "") {
        return <Typography variant="caption" color="text.disabled">—</Typography>;
      }

      if (col.type === "badge") {
        const color = getBadgeColor(String(val));
        return (
          <Chip
            size="small"
            label={t.has(String(val)) ? t(String(val)) : String(val)}
            color={color as any}
            variant={color === "default" ? "outlined" : "filled"}
          />
        );
      }

      if (col.type === "number") {
        return (
          <Typography variant="body2" fontWeight={600}>
            {typeof val === "number" ? val.toLocaleString() : val}
          </Typography>
        );
      }

      return <Typography variant="body2">{String(val)}</Typography>;
    },
  }));

  // Client-side pagination if rows contains all records
  const paginatedRows =
    rows.length > pageSize
      ? rows.slice((page - 1) * pageSize, page * pageSize)
      : rows;

  return (
    <Box>
      <ModernizeDataTable
        data={paginatedRows}
        columns={tableColumns}
        loading={loading}
        totalCount={totalRecords || rows.length}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        emptyMessage={t("NoReportData")}
      />
    </Box>
  );
};
