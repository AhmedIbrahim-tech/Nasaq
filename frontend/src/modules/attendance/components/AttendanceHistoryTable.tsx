"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import {
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconMapPin,
  IconDeviceLaptop,
  IconFileDescription,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useTheme, alpha } from "@mui/material/styles";
import {
  ModernizeDataTable,
  ModernizeColumnDef,
} from "@/shared/components/tables/modernize/ModernizeDataTable";
import {
  formatDateOnly,
  formatTimeOnly,
  formatDistance,
  formatCoordinates,
  formatGeofenceFailureReason,
} from "@/shared/utils/i18nFormatters";
import type { AttendanceRecord } from "../types";

interface AttendanceHistoryTableProps {
  records: AttendanceRecord[];
  totalCount: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  showEmployeeColumn?: boolean;
}

export const AttendanceHistoryTable: React.FC<AttendanceHistoryTableProps> = ({
  records,
  totalCount,
  loading,
  page,
  pageSize,
  onPageChange,
  showEmployeeColumn = false,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const getStatusChip = (status: string) => {
    switch (status) {
      case "Completed":
        return <Chip label={t("Completed")} color="success" size="small" />;
      case "Present":
        return <Chip label={t("Present")} color="primary" size="small" />;
      case "PendingReview":
        return <Chip label={t("PendingReview")} color="warning" size="small" />;
      case "Rejected":
        return <Chip label={t("Rejected")} color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getArrivalChip = (classification: string) => {
    switch (classification) {
      case "OnTime":
        return <Chip label={t("OnTime")} color="success" variant="outlined" size="small" />;
      case "Early":
        return <Chip label={t("Early")} color="info" variant="outlined" size="small" />;
      case "Late":
        return <Chip label={t("Late")} color="warning" variant="outlined" size="small" />;
      case "AfterCutoff":
        return <Chip label={t("AfterCutoff")} color="error" variant="outlined" size="small" />;
      default:
        return <Chip label={t("Standard")} variant="outlined" size="small" />;
    }
  };

  const columns: ModernizeColumnDef<AttendanceRecord>[] = [
    ...(showEmployeeColumn
      ? [
          {
            id: "employee",
            header: t("Employee"),
            cell: (row: AttendanceRecord) => (
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {isRtl && row.employeeNameAr ? row.employeeNameAr : row.employeeName}
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
        <Typography variant="body2" fontWeight={600} sx={{ direction: "ltr", display: "inline-block" }}>
          {formatDateOnly(row.date, isRtl)}
        </Typography>
      ),
    },
    {
      id: "checkIn",
      header: t("CheckIn"),
      cell: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" fontWeight={600}>
            {formatTimeOnly(row.checkInTimeUtc, isRtl)}
          </Typography>
          {getArrivalChip(row.arrivalClassification)}
        </Stack>
      ),
    },
    {
      id: "checkOut",
      header: t("CheckOut"),
      cell: (row) => (
        <Typography variant="body2" color={row.checkOutTimeUtc ? "text.primary" : "text.secondary"}>
          {row.checkOutTimeUtc ? formatTimeOnly(row.checkOutTimeUtc, isRtl) : "—"}
        </Typography>
      ),
    },
    {
      id: "duration",
      header: t("Duration"),
      cell: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {row.durationHours > 0 ? `${row.durationHours.toFixed(1)} ${t("HoursAbbr")}` : "—"}
        </Typography>
      ),
    },
    {
      id: "location",
      header: t("Location"),
      cell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.workLocationName || "—"}
        </Typography>
      ),
    },
    {
      id: "status",
      header: t("Status"),
      cell: (row) => getStatusChip(row.status),
    },
  ];

  const renderExpandedRow = (record: AttendanceRecord) => (
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
          <Typography variant="subtitle2" fontWeight={700} color="primary.main">
            {t("CheckInVerificationDetails")}
          </Typography>
        </Stack>
        {getStatusChip(record.status)}
      </Stack>

      <Grid container spacing={2}>
        {/* Work Location */}
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
              <IconMapPin size={20} stroke={1.75} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("WorkLocation")}
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {isRtl && record.workLocationNameAr ? record.workLocationNameAr : (record.workLocationName || "—")}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Work Shift */}
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
              <IconClock size={20} stroke={1.75} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("WorkShift")}
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {isRtl && record.workShiftNameAr ? record.workShiftNameAr : (record.workShiftName || "—")}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* GPS Coordinates */}
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
              <IconDeviceLaptop size={20} stroke={1.75} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("GPSCoordinates")}
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
                {formatCoordinates(record.checkInLatitude, record.checkInLongitude)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Distance & Accuracy */}
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
              <IconFileDescription size={20} stroke={1.75} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("DistanceToWorksite")}
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {record.checkInDistanceMeters != null
                  ? formatDistance(record.checkInDistanceMeters, isRtl)
                  : "—"}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Exception Reason Box */}
        {(record.checkInFailureReason || record.checkOutFailureReason) && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: "10px",
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <IconAlertTriangle size={20} color={theme.palette.error.main} style={{ flexShrink: 0 }} />
              <Box>
                <Typography variant="caption" color="error.main" fontWeight={700} sx={{ display: "block" }}>
                  {t("ReviewReason")}:
                </Typography>
                <Typography variant="body2" color="error.dark" fontWeight={500}>
                  {formatGeofenceFailureReason(record.checkInFailureReason || record.checkOutFailureReason, isRtl)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  return (
    <ModernizeDataTable
      data={records}
      columns={columns}
      loading={loading}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      renderExpandedRow={renderExpandedRow}
      getRowId={(row) => row.id}
      emptyMessage={t("NoAttendanceRecordsFound")}
    />
  );
};
