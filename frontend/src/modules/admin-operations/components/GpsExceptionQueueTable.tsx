"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import { IconCheck, IconX, IconAlertTriangle, IconMapPin } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  ModernizeDataTable,
  ModernizeColumnDef,
} from "@/shared/components/tables/modernize/ModernizeDataTable";
import { ModernizeTableToolbar } from "@/shared/components/tables/modernize/ModernizeTableToolbar";
import {
  formatDateTime,
  formatDistance,
  formatGeofenceFailureReason,
} from "@/shared/utils/i18nFormatters";
import type { AttendanceRecord, GpsExceptionsParams } from "../types";

interface GpsExceptionQueueTableProps {
  records: AttendanceRecord[];
  totalCount: number;
  loading: boolean;
  params: GpsExceptionsParams;
  onParamsChange: (newParams: Partial<GpsExceptionsParams>) => void;
  onRefresh: () => void;
  onApprove: (record: AttendanceRecord) => void;
  onReject: (record: AttendanceRecord) => void;
}

export const GpsExceptionQueueTable: React.FC<GpsExceptionQueueTableProps> = ({
  records,
  totalCount,
  loading,
  params,
  onParamsChange,
  onRefresh,
  onApprove,
  onReject,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const columns: ModernizeColumnDef<AttendanceRecord>[] = [
    {
      id: "employee",
      header: t("Employee"),
      cell: (row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {isRtl && row.employeeNameAr ? row.employeeNameAr : row.employeeName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.employeeCode} {(isRtl && row.departmentAr ? row.departmentAr : row.department) ? `• ${isRtl && row.departmentAr ? row.departmentAr : row.department}` : ""}
          </Typography>
        </Box>
      ),
    },
    {
      id: "checkInTime",
      header: t("OriginalCheckInTime"),
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {formatDateTime(row.checkInTimeUtc, isRtl)}
        </Typography>
      ),
    },
    {
      id: "location",
      header: t("WorkLocation"),
      cell: (row) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconMapPin size={16} />
          <Typography variant="body2">{isRtl && row.workLocationNameAr ? row.workLocationNameAr : (row.workLocationName || "—")}</Typography>
        </Box>
      ),
    },
    {
      id: "distance",
      header: t("Distance"),
      cell: (row) =>
        row.checkInDistanceMeters != null ? (
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            icon={<IconAlertTriangle size={14} />}
            label={formatDistance(row.checkInDistanceMeters, isRtl)}
            sx={{ fontWeight: 600 }}
          />
        ) : (
          "—"
        ),
    },
    {
      id: "reason",
      header: t("FailureReason"),
      cell: (row) => (
        <Typography variant="caption" color="error.main" fontWeight={500}>
          {formatGeofenceFailureReason(row.checkInFailureReason || row.checkOutFailureReason, isRtl)}
        </Typography>
      ),
    },
    {
      id: "actions",
      header: t("Actions"),
      cell: (row) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t("ApproveGps")}>
            <Button
              size="small"
              variant="outlined"
              color="success"
              startIcon={<IconCheck size={16} />}
              onClick={() => onApprove(row)}
              sx={{ borderRadius: "8px", textTransform: "none", minWidth: 90 }}
            >
              {t("Approve")}
            </Button>
          </Tooltip>
          <Tooltip title={t("RejectGps")}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<IconX size={16} />}
              onClick={() => onReject(row)}
              sx={{ borderRadius: "8px", textTransform: "none", minWidth: 90 }}
            >
              {t("Reject")}
            </Button>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2.5}>
      <ModernizeTableToolbar
        title={t("GpsExceptionsQueue")}
        search={params.search || ""}
        onSearchChange={(search) => onParamsChange({ search, page: 1 })}
        showFilters={false}
        onToggleFilters={() => {}}
        onRefresh={onRefresh}
        isRefreshing={loading}
        onResetFilters={() => onParamsChange({ search: "", page: 1 })}
        hasActiveFilters={Boolean(params.search)}
      />

      <ModernizeDataTable
        data={records}
        columns={columns}
        loading={loading}
        totalCount={totalCount}
        page={params.page || 1}
        pageSize={params.pageSize || 10}
        onPageChange={(page) => onParamsChange({ page })}
        onPageSizeChange={(pageSize) => onParamsChange({ pageSize, page: 1 })}
        emptyMessage={t("NoGpsExceptions")}
      />
    </Stack>
  );
};
