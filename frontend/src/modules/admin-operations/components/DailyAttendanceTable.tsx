"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { alpha, useTheme } from "@mui/material/styles";
import {
  IconCheck,
  IconX,
  IconClockCheck,
  IconMapPin,
  IconClock,
  IconFileDescription,
  IconCurrentLocation,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  ModernizeDataTable,
  ModernizeColumnDef,
  ModernizeRowAction,
} from "@/shared/components/tables/modernize/ModernizeDataTable";
import { ModernizeTableToolbar } from "@/shared/components/tables/modernize/ModernizeTableToolbar";
import { ProfilePhotoAvatar } from "@/shared/components/avatar/ProfilePhotoAvatar";
import {
  formatDateOnly,
  formatTimeOnly,
  formatDistance,
  formatCoordinates,
  formatGeofenceFailureReason,
} from "@/shared/utils/i18nFormatters";
import type { AttendanceRecord, DailyAttendanceParams } from "../types";

interface DailyAttendanceTableProps {
  records: AttendanceRecord[];
  totalCount: number;
  loading: boolean;
  params: DailyAttendanceParams;
  locations: { id: string; name: string }[];
  shifts: { id: string; name: string }[];
  onParamsChange: (newParams: Partial<DailyAttendanceParams>) => void;
  onRefresh: () => void;
  onApproveGps: (record: AttendanceRecord) => void;
  onRejectGps: (record: AttendanceRecord) => void;
  onCorrectIncomplete: (record: AttendanceRecord) => void;
}

export const DailyAttendanceTable: React.FC<DailyAttendanceTableProps> = ({
  records,
  totalCount,
  loading,
  params,
  locations,
  shifts,
  onParamsChange,
  onRefresh,
  onApproveGps,
  onRejectGps,
  onCorrectIncomplete,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [showFilters, setShowFilters] = useState(false);

  const getStatusChip = (status: string) => {
    switch (status) {
      case "Completed":
        return <Chip label={t("Completed")} color="success" size="small" sx={{ fontWeight: 600 }} />;
      case "Present":
        return <Chip label={t("Present")} color="primary" size="small" sx={{ fontWeight: 600 }} />;
      case "PendingReview":
        return <Chip label={t("PendingReview")} color="warning" size="small" sx={{ fontWeight: 600 }} />;
      case "Rejected":
        return <Chip label={t("Rejected")} color="error" size="small" sx={{ fontWeight: 600 }} />;
      case "Incomplete":
        return <Chip label={t("Incomplete")} color="secondary" size="small" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={t.has(status) ? t(status) : status} size="small" sx={{ fontWeight: 600 }} />;
    }
  };

  const getVerificationChip = (status: string) => {
    switch (status) {
      case "Verified":
        return <Chip label={t("Verified")} color="success" variant="outlined" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600 }} />;
      case "PendingReview":
        return <Chip label={t("PendingReview")} color="warning" variant="outlined" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600 }} />;
      case "Rejected":
        return <Chip label={t("Rejected")} color="error" variant="outlined" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600 }} />;
      default:
        return <Chip label={t("NotRecorded")} variant="outlined" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 500 }} />;
    }
  };

  const columns: ModernizeColumnDef<AttendanceRecord>[] = [
    {
      id: "employee",
      header: t("Employee"),
      cell: (row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            {isRtl && row.employeeNameAr ? row.employeeNameAr : row.employeeName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.employeeCode} {(isRtl && row.departmentAr ? row.departmentAr : row.department) ? `• ${isRtl && row.departmentAr ? row.departmentAr : row.department}` : ""}
          </Typography>
        </Box>
      ),
    },
    {
      id: "date",
      header: t("Date"),
      cell: (row) => (
        <Typography variant="body2" sx={{ direction: "ltr", display: "inline-block", fontFamily: "monospace" }}>
          {row.date ? formatDateOnly(row.date, isRtl) : "-"}
        </Typography>
      ),
    },
    {
      id: "checkIn",
      header: t("CheckIn"),
      cell: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {formatTimeOnly(row.checkInTimeUtc, isRtl)}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.75} mt={0.5} flexWrap="wrap">
            {getVerificationChip(row.checkInStatus)}
            {row.checkInDistanceMeters != null && (
              <Chip
                size="small"
                variant="outlined"
                color={row.checkInDistanceMeters > 50 ? "warning" : "default"}
                label={formatDistance(row.checkInDistanceMeters, isRtl)}
                sx={{ height: 20, fontSize: 11, fontWeight: 500 }}
              />
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: "checkOut",
      header: t("CheckOut"),
      cell: (row) =>
        row.checkOutTimeUtc ? (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {formatTimeOnly(row.checkOutTimeUtc, isRtl)}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.75} mt={0.5} flexWrap="wrap">
              {getVerificationChip(row.checkOutStatus)}
              {row.isManuallyAdjusted && (
                <Chip label={t("Manual")} size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: 11, fontWeight: 500 }} />
              )}
            </Box>
          </Box>
        ) : (
          <Chip
            label={t("NotCheckedOut")}
            size="small"
            variant="outlined"
            sx={{
              color: "text.disabled",
              borderColor: "divider",
              fontSize: 12,
              fontWeight: 500,
            }}
          />
        ),
    },
    {
      id: "duration",
      header: t("Duration"),
      cell: (row) =>
        row.durationHours != null && row.durationHours > 0
          ? `${row.durationHours.toFixed(1)} ${t("HoursAbbr") || "h"}`
          : "—",
    },
    {
      id: "status",
      header: t("Status"),
      cell: (row) => getStatusChip(row.status),
    },
  ];

  const rowActions: ModernizeRowAction<AttendanceRecord>[] = [
    {
      label: t("ApproveGps"),
      icon: <IconCheck size={16} color="green" />,
      onClick: (row) => onApproveGps(row),
      show: (row) => row.checkInStatus === "PendingReview" || row.checkOutStatus === "PendingReview",
    },
    {
      label: t("RejectGps"),
      icon: <IconX size={16} color="red" />,
      onClick: (row) => onRejectGps(row),
      show: (row) => row.checkInStatus === "PendingReview" || row.checkOutStatus === "PendingReview",
    },
    {
      label: t("CorrectIncomplete"),
      icon: <IconClockCheck size={16} />,
      onClick: (row) => onCorrectIncomplete(row),
      show: (row) => !row.checkOutTimeUtc,
    },
  ];

  const renderExpandedRow = (record: AttendanceRecord) => (
    <Box
      sx={{
        p: 2,
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.default, 0.6)
            : alpha(theme.palette.primary.light, 0.15),
        borderRadius: "10px",
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Grid container spacing={1.5}>
        {/* Work Location */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: "8px",
              bgcolor: "background.paper",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "6px",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconMapPin size={18} stroke={1.75} />
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
              p: 1.25,
              borderRadius: "8px",
              bgcolor: "background.paper",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "6px",
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                color: "warning.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconClock size={18} stroke={1.75} />
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
              p: 1.25,
              borderRadius: "8px",
              bgcolor: "background.paper",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "6px",
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                color: "info.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconCurrentLocation size={18} stroke={1.75} />
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
                  fontSize: "0.8rem",
                }}
              >
                {formatCoordinates(record.checkInLatitude, record.checkInLongitude)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Review Notes */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: "8px",
              bgcolor: "background.paper",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "6px",
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                color: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconFileDescription size={18} stroke={1.75} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("ReviewNotes")}
              </Typography>
              <Typography variant="body2" noWrap>
                {record.reviewNotes || record.notes || "—"}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Exception Reason Box */}
        {(record.checkInFailureReason || record.checkOutFailureReason) && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 1.25,
                borderRadius: "8px",
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <IconAlertTriangle size={18} color={theme.palette.error.main} style={{ flexShrink: 0 }} />
              <Box>
                <Typography variant="caption" color="error.main" fontWeight={700} sx={{ display: "block" }}>
                  {t("FailureReason")}:
                </Typography>
                <Typography variant="body2" color="error.dark" fontWeight={500} sx={{ fontSize: "0.825rem" }}>
                  {formatGeofenceFailureReason(record.checkInFailureReason || record.checkOutFailureReason, isRtl)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const hasActiveFilters = Boolean(
    params.search ||
      params.date ||
      (params.workLocationId && params.workLocationId !== "all") ||
      (params.workShiftId && params.workShiftId !== "all") ||
      (params.status && params.status !== ("all" as any)) ||
      params.missingCheckOutOnly ||
      params.pendingReviewOnly
  );

  const handleResetFilters = () => {
    onParamsChange({
      search: "",
      date: undefined,
      workLocationId: undefined,
      workShiftId: undefined,
      status: undefined,
      missingCheckOutOnly: false,
      pendingReviewOnly: false,
      page: 1,
    });
  };

  return (
    <Stack spacing={2.5}>
      <ModernizeTableToolbar
        title={t("DailyAttendanceMonitoring")}
        search={params.search || ""}
        onSearchChange={(search) => onParamsChange({ search, page: 1 })}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        onRefresh={onRefresh}
        isRefreshing={loading}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        filterContent={
          <Grid container spacing={2} alignItems="center">
            {/* Date filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={t("Date")}
                value={params.date || ""}
                onChange={(e) => onParamsChange({ date: e.target.value || undefined, page: 1 })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Work Location Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={t("WorkLocation")}
                value={params.workLocationId || "all"}
                onChange={(e) =>
                  onParamsChange({
                    workLocationId: e.target.value === "all" ? undefined : e.target.value,
                    page: 1,
                  })
                }
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected: any) =>
                    !selected || selected === "all"
                      ? t("AllLocations")
                      : locations.find((l) => l.id === selected)?.name || selected,
                }}
              >
                <MenuItem value="all">{t("AllLocations")}</MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Work Shift Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={t("WorkShift")}
                value={params.workShiftId || "all"}
                onChange={(e) =>
                  onParamsChange({
                    workShiftId: e.target.value === "all" ? undefined : e.target.value,
                    page: 1,
                  })
                }
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected: any) =>
                    !selected || selected === "all"
                      ? t("AllShifts")
                      : shifts.find((s) => s.id === selected)?.name || selected,
                }}
              >
                <MenuItem value="all">{t("AllShifts")}</MenuItem>
                {shifts.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Status Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label={t("Status")}
                value={params.status || "all"}
                onChange={(e) =>
                  onParamsChange({
                    status: e.target.value === "all" ? undefined : (e.target.value as any),
                    page: 1,
                  })
                }
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected: any) =>
                    !selected || selected === "all" ? t("AllStatuses") : t(selected),
                }}
              >
                <MenuItem value="all">{t("AllStatuses")}</MenuItem>
                <MenuItem value="Completed">{t("Completed")}</MenuItem>
                <MenuItem value="Present">{t("Present")}</MenuItem>
                <MenuItem value="PendingReview">{t("PendingReview")}</MenuItem>
                <MenuItem value="Rejected">{t("Rejected")}</MenuItem>
                <MenuItem value="Incomplete">{t("Incomplete")}</MenuItem>
              </TextField>
            </Grid>

            {/* Quick switches */}
            <Grid size={{ xs: 12, md: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={Boolean(params.missingCheckOutOnly)}
                      onChange={(e) =>
                        onParamsChange({ missingCheckOutOnly: e.target.checked, page: 1 })
                      }
                    />
                  }
                  label={<Typography variant="caption">{t("MissingCheckOutOnly")}</Typography>}
                />
              </Stack>
            </Grid>
          </Grid>
        }
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
        renderExpandedRow={renderExpandedRow}
        actions={rowActions}
        emptyMessage={t("NoDailyAttendance")}
      />
    </Stack>
  );
};
