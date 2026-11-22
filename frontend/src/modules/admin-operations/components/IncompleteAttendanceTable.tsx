"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import { IconClockCheck, IconClock, IconMapPin } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  ModernizeDataTable,
  ModernizeColumnDef,
} from "@/shared/components/tables/modernize/ModernizeDataTable";
import { ModernizeTableToolbar } from "@/shared/components/tables/modernize/ModernizeTableToolbar";
import { formatDateTime } from "@/shared/utils/i18nFormatters";
import type { AttendanceRecord, IncompleteAttendanceParams } from "../types";

interface IncompleteAttendanceTableProps {
  records: AttendanceRecord[];
  totalCount: number;
  loading: boolean;
  params: IncompleteAttendanceParams;
  onParamsChange: (newParams: Partial<IncompleteAttendanceParams>) => void;
  onRefresh: () => void;
  onCorrect: (record: AttendanceRecord) => void;
}

export const IncompleteAttendanceTable: React.FC<IncompleteAttendanceTableProps> = ({
  records,
  totalCount,
  loading,
  params,
  onParamsChange,
  onRefresh,
  onCorrect,
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
      id: "shift",
      header: t("WorkShift"),
      cell: (row) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconClock size={16} />
          <Typography variant="body2">{isRtl && row.workShiftNameAr ? row.workShiftNameAr : (row.workShiftName || "—")}</Typography>
        </Box>
      ),
    },
    {
      id: "actions",
      header: t("Actions"),
      cell: (row) => (
        <Tooltip title={t("CorrectIncomplete")}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<IconClockCheck size={16} />}
            onClick={() => onCorrect(row)}
            sx={{ borderRadius: "8px", textTransform: "none", minWidth: 120 }}
          >
            {t("CorrectIncomplete")}
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Stack spacing={2.5}>
      <ModernizeTableToolbar
        title={t("IncompleteAttendance")}
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
        emptyMessage={t("NoIncompleteAttendance")}
      />
    </Stack>
  );
};
