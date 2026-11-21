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
import { formatDateOnly } from "@/shared/utils/i18nFormatters";
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
      case "Standard":
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

  const getBadgeLabel = (val: string) => {
    if (t.has(val)) return t(val);
    switch (val) {
      case "Verified":
        return isAr ? "معتمد" : "Verified";
      case "Completed":
        return isAr ? "مكتمل" : "Completed";
      case "PendingReview":
        return isAr ? "قيد المراجعة" : "Pending Review";
      case "Standard":
        return isAr ? "اعتيادي" : "Standard";
      case "OnTime":
        return isAr ? "في الموعد" : "On Time";
      case "Late":
        return isAr ? "متأخر" : "Late";
      case "AfterCutoff":
        return isAr ? "بعد المهلة" : "After Cutoff";
      case "MissingCheckOut":
        return isAr ? "انصراف مفقود" : "Missing Check-Out";
      case "Excused":
      case "Excused (Leave)":
        return isAr ? "معفى (إجازة)" : "Excused (Leave)";
      case "ApprovedLeave":
        return isAr ? "إجازة معتمدة" : "Approved Leave";
      case "Green":
        return isAr ? "أخضر" : "Green";
      case "Red":
        return isAr ? "أحمر" : "Red";
      case "Black":
        return isAr ? "أسود" : "Black";
      default:
        return val;
    }
  };

  const tableColumns: ModernizeColumnDef<Record<string, any>>[] = columns.map((col) => ({
    id: col.key,
    header: isAr && col.labelAr ? col.labelAr : col.labelEn,
    align: col.align || "left",
    cell: (row) => {
      const val = row[col.key];

      if (val == null || val === "") {
        return <Typography variant="caption" color="text.disabled">—</Typography>;
      }

      // Status & Classification Badges
      if (col.type === "badge") {
        const strVal = String(val);
        const color = getBadgeColor(strVal);
        const label = getBadgeLabel(strVal);
        return (
          <Chip
            size="small"
            label={label}
            color={color as any}
            variant={color === "default" ? "outlined" : "filled"}
            sx={{ fontWeight: 600, fontSize: "0.75rem", height: 24 }}
          />
        );
      }

      // Monospace Employee Code Pill
      if (col.key === "employeeCode") {
        return (
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              fontFamily: "monospace",
              bgcolor: "action.hover",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              display: "inline-block",
              direction: "ltr",
              fontSize: "0.825rem",
            }}
          >
            {String(val)}
          </Typography>
        );
      }

      // Prominent Employee Name
      if (col.key === "employeeName") {
        return (
          <Typography variant="subtitle2" fontWeight={700}>
            {String(val)}
          </Typography>
        );
      }

      // Direction-safe Timestamp Columns (checkInTime, checkOutTime, scheduledTime)
      if (col.key === "checkInTime" || col.key === "checkOutTime" || col.key === "scheduledTime") {
        return (
          <Typography
            variant="body2"
            sx={{
              direction: "ltr",
              unicodeBidi: "isolate",
              display: "inline-block",
              fontFamily: "monospace",
              fontSize: "0.825rem",
            }}
          >
            {String(val)}
          </Typography>
        );
      }

      // Date Columns
      if (col.type === "date") {
        return (
          <Typography
            variant="body2"
            sx={{
              direction: "ltr",
              unicodeBidi: "isolate",
              display: "inline-block",
              fontFamily: "monospace",
            }}
          >
            {formatDateOnly(String(val), isAr)}
          </Typography>
        );
      }

      // Numeric Columns
      if (col.type === "number") {
        return (
          <Typography variant="body2" fontWeight={600} sx={{ textAlign: "right", fontFamily: "monospace" }}>
            {typeof val === "number" ? val.toLocaleString(isAr ? "ar-SA-u-nu-latn" : "en-US") : val}
          </Typography>
        );
      }

      // Currency Columns
      if (col.type === "currency") {
        return (
          <Typography variant="body2" fontWeight={600} sx={{ textAlign: "right" }}>
            {Number(val).toLocaleString(isAr ? "ar-SA-u-nu-latn" : "en-US")} {isAr ? "ر.س" : "SAR"}
          </Typography>
        );
      }

      return (
        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
          {String(val)}
        </Typography>
      );
    },
  }));

  // Client-side pagination if rows contains all records
  const paginatedRows =
    rows.length > pageSize
      ? rows.slice((page - 1) * pageSize, page * pageSize)
      : rows;

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
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
