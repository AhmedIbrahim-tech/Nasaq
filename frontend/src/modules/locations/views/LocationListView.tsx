"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { useTheme, alpha } from "@mui/material/styles";
import {
  IconPlus,
  IconMapPin,
  IconCheck,
  IconX,
  IconUsers,
  IconRadar,
  IconTarget,
  IconPencil,
  IconEye,
  IconCalendar,
  IconRotateDot,
  IconTrash,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notify } from "@/shared/services/notification.service";
import { RoleNames } from "@/shared/constants/roles";
import PageContainer from "@/shared/components/container/PageContainer";
import Breadcrumb from "@/shared/layouts/dashboard/shared/breadcrumb/Breadcrumb";
import { ConfirmActionDialog } from "@/shared/components/dialogs/ConfirmActionDialog";
import {
  formatEmployeesCount,
  formatBulkDeleteConfirmation,
  formatDateTime,
  formatCoordinates,
} from "@/shared/utils/i18nFormatters";
import {
  ModernizeStatsCards,
  ModernizeTableToolbar,
  ModernizeDataTable,
  ModernizeColumnDef,
  ModernizeRowAction,
} from "@/shared/components/tables/modernize";
import { useLocations, useLocationFilters } from "../hooks";
import { LocationFormDialog } from "../components/LocationFormDialog";
import { LocationDetailsDialog } from "../components/LocationDetailsDialog";
import { getLocationDisplayName } from "../utils/locationLocalization";
import type { WorkLocation } from "../types";

export const LocationListView: React.FC = () => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const {
    items,
    selectedLocation,
    summary,
    summaryLoading,
    loading,
    actionLoading,
    canManage,
    formDialogOpen,
    formDialogMode,
    editingLocation,
    detailsDialogOpen,
    selectedIds,
    setSelectedIds,
    locationToDelete,
    bulkDeleteOpen,
    isDeleting,
    loadData,
    openCreate: handleOpenCreate,
    openEdit: handleOpenEdit,
    closeForm,
    openDetails: handleViewDetails,
    closeDetails,
    submitForm: handleFormSubmit,
    toggleStatus: handleToggleStatus,
    openDelete: handleOpenSingleDelete,
    closeDelete,
    confirmDelete: handleConfirmSingleDelete,
    openBulkDelete: handleOpenBulkDelete,
    closeBulkDelete,
    confirmBulkDelete: handleConfirmBulkDelete,
    exportCsv: handleExportCsv,
  } = useLocations();

  const {
    filterParams,
    page,
    pageSize,
    showFilters,
    setShowFilters,
    columnVisibility,
    toggleColumn: handleToggleColumn,
    onSearchChange: handleSearchChange,
    onIsActiveChange: handleIsActiveChange,
    onResetFilters: handleResetFilters,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
  } = useLocationFilters();

  // Meaningful 4-Card Summary Statistics (High operational utility, no empty grid gaps)
  const statsData = useMemo(() => {
    return [
      {
        value: summary?.totalLocations ?? items.length,
        label: t("TotalLocations"),
        icon: <IconMapPin color={theme.palette.primary.main} size={22} />,
        bgcolor: "primary.light",
        color: "primary.main",
      },
      {
        value: summary?.activeLocations ?? 0,
        label: t("ActiveLocations"),
        icon: <IconCheck color={theme.palette.success.main} size={22} />,
        bgcolor: "success.light",
        color: "success.main",
      },
      {
        value: summary?.inactiveLocations ?? 0,
        label: t("InactiveLocations"),
        icon: <IconX color={theme.palette.error.main} size={22} />,
        bgcolor: "error.light",
        color: "error.main",
      },
      {
        value: summary?.assignedEmployeesTotal ?? 0,
        label: t("TotalAssignedStaff"),
        icon: <IconUsers color={theme.palette.info.main} size={22} />,
        bgcolor: "info.light",
        color: "info.main",
      },
    ];
  }, [summary, items.length, t, theme]);

  // Paginated slice
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  // Concise Overview Table Columns
  const columns: ModernizeColumnDef<WorkLocation>[] = useMemo(
    () => [
      {
        id: "name",
        header: t("LocationName"),
        visible: columnVisibility.name,
        cell: (loc) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: "8px",
                bgcolor: loc.isActive ? "primary.light" : "action.hover",
                color: loc.isActive ? "primary.main" : "text.secondary",
                display: "flex",
                alignItems: "center",
              }}
            >
              <IconMapPin size={18} />
            </Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {getLocationDisplayName(loc, isRtl)}
            </Typography>
          </Stack>
        ),
      },
      {
        id: "coordinates",
        header: t("Coordinates"),
        visible: columnVisibility.coordinates,
        cell: (loc) => (
          <Typography
            variant="caption"
            sx={{
              fontFamily: "monospace",
              bgcolor: "action.hover",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              display: "inline-block",
              direction: "ltr",
            }}
          >
            {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
          </Typography>
        ),
      },
      {
        id: "radiusMeters",
        header: t("GeofenceRadius"),
        visible: columnVisibility.radiusMeters,
        cell: (loc) => (
          <Typography variant="body2" fontWeight={600}>
            {loc.radiusMeters} {t("MetersUnit")}
          </Typography>
        ),
      },
      {
        id: "accuracyThresholdMeters",
        header: t("AccuracyThreshold"),
        visible: columnVisibility.accuracyThresholdMeters,
        cell: (loc) => (
          <Typography variant="body2">
            {loc.accuracyThresholdMeters} {t("MetersUnit")}
          </Typography>
        ),
      },
      {
        id: "employeeCount",
        header: t("AssignedEmployees"),
        visible: columnVisibility.employeeCount,
        cell: (loc) => {
          const count = loc.assignedEmployeesCount ?? loc.employeeCount ?? 0;
          return (
            <Chip
              size="small"
              icon={<IconUsers size={14} />}
              label={formatEmployeesCount(count, isRtl)}
              variant="outlined"
              color={count > 0 ? "info" : "default"}
              sx={{ fontWeight: 600 }}
            />
          );
        },
      },
      {
        id: "isActive",
        header: t("Status"),
        visible: columnVisibility.isActive,
        cell: (loc) => (
          <Chip
            size="small"
            label={loc.isActive ? t("Active") : t("Inactive")}
            color={loc.isActive ? "success" : "default"}
            sx={{ fontWeight: 600, fontSize: "12px" }}
          />
        ),
      },
      {
        id: "created_Utc",
        header: t("CreatedDate"),
        visible: columnVisibility.created_Utc,
        cell: (loc) => (
          <Typography variant="body2" color="text.secondary" sx={{ direction: "ltr", display: "inline-block" }}>
            {loc.created_Utc ? new Date(loc.created_Utc).toLocaleDateString() : "-"}
          </Typography>
        ),
      },
    ],
    [columnVisibility, t]
  );

  // Modernize Row Actions Menu Items
  const rowActions: ModernizeRowAction<WorkLocation>[] = useMemo(
    () => [
      {
        label: t("ViewDetails"),
        icon: <IconEye size={18} color={theme.palette.info.main} />,
        onClick: (loc) => handleViewDetails(loc),
      },
      {
        label: t("Edit"),
        icon: <IconPencil size={18} color={theme.palette.warning.main} />,
        show: () => canManage,
        onClick: (loc) => handleOpenEdit(loc),
      },
      {
        label: t("ToggleStatus"),
        icon: <IconCheck size={18} color={theme.palette.success.main} />,
        show: () => canManage,
        onClick: (loc) => handleToggleStatus(loc),
      },
      {
        label: t("Delete"),
        icon: <IconTrash size={18} color={theme.palette.error.main} />,
        show: () => canManage,
        onClick: (loc) => handleOpenSingleDelete(loc),
      },
    ],
    [canManage, t, theme]
  );

  // Expandable row rendering with secondary details
  const renderExpandedRow = useCallback(
    (loc: WorkLocation) => (
      <Box
        sx={{
          p: 2.5,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.default, 0.6)
              : alpha(theme.palette.primary.light, 0.25),
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
          gap={1}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
              {t("LocationQuickDetails")}: {getLocationDisplayName(loc, isRtl)}
            </Typography>
          </Stack>
          <Chip
            size="small"
            label={loc.isActive ? t("Active") : t("Inactive")}
            color={loc.isActive ? "success" : "default"}
          />
        </Stack>

        <Grid container spacing={2}>
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
                  {t("GPSCoordinates")}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  component="span"
                  sx={{
                    direction: "ltr",
                    unicodeBidi: "isolate",
                    display: "inline-block",
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                  }}
                >
                  {formatCoordinates(loc.latitude, loc.longitude)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Geofence Radius */}
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
                <IconRadar size={20} stroke={1.75} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("GeofenceRadius")}
                </Typography>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {loc.radiusMeters} {t("MetersUnit")}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Accuracy Threshold */}
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
                <IconTarget size={20} stroke={1.75} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("AccuracyThreshold")}
                </Typography>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {loc.accuracyThresholdMeters} {t("MetersUnit")}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Assigned Employees */}
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
                <IconUsers size={20} stroke={1.75} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("AssignedEmployees")}
                </Typography>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {formatEmployeesCount(loc.assignedEmployeesCount ?? loc.employeeCount ?? 0, isRtl)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconCalendar size={16} color={theme.palette.text.secondary} />
            <Typography variant="caption" color="text.secondary">
              {t("CreatedDate")}:{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {formatDateTime(loc.created_Utc, isRtl)}
              </Box>
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<IconEye size={16} />}
              onClick={() => handleViewDetails(loc)}
              sx={{ borderRadius: "8px", px: 1.75 }}
            >
              {t("ViewDetails")}
            </Button>
            {canManage && (
              <Button
                size="small"
                variant="contained"
                startIcon={<IconPencil size={16} />}
                onClick={() => handleOpenEdit(loc)}
                sx={{ borderRadius: "8px", px: 1.75 }}
              >
                {t("Edit")}
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    ),
    [canManage, isRtl, t, theme]
  );

  const toolbarColumns = useMemo(
    () => [
      { id: "name", label: t("LocationName"), visible: columnVisibility.name },
      { id: "coordinates", label: t("Coordinates"), visible: columnVisibility.coordinates },
      { id: "radiusMeters", label: t("GeofenceRadius"), visible: columnVisibility.radiusMeters },
      { id: "accuracyThresholdMeters", label: t("AccuracyThreshold"), visible: columnVisibility.accuracyThresholdMeters },
      { id: "employeeCount", label: t("AssignedEmployees"), visible: columnVisibility.employeeCount },
      { id: "isActive", label: t("Status"), visible: columnVisibility.isActive },
      { id: "created_Utc", label: t("CreatedDate"), visible: columnVisibility.created_Utc },
    ],
    [columnVisibility, t]
  );

  const breadcrumbItems = [
    { title: t("Dashboard"), to: "/" },
    { title: t("Workforce"), to: "/employees" },
    { title: t("WorkLocations") },
  ];

  return (
    <PageContainer title={t("WorkLocations")}>
      {/* Modernize Page Header with Breadcrumb and illustration (Description removed as requested) */}
      <Breadcrumb
        title={t("WorkLocations")}
        items={breadcrumbItems}
      />

      {/* Modernize Card Container */}
      <Card elevation={0} sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: "12px" }}>
        <Stack spacing={3} p={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Section 1: Overview Header with Add Button on opposite side + Meaningful 4-Card Stats */}
          <ModernizeStatsCards
            title={t("LocationsOverview")}
            action={
              canManage ? (
                <Button
                  size="medium"
                  variant="contained"
                  color="primary"
                  startIcon={<IconPlus size={18} />}
                  onClick={handleOpenCreate}
                  sx={{
                    borderRadius: "8px",
                    fontWeight: 600,
                    textTransform: "none",
                    px: 2.5,
                    py: 1,
                    boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                  }}
                >
                  {t("AddWorkLocation")}
                </Button>
              ) : undefined
            }
            items={statsData}
            loading={summaryLoading}
          />

          <Divider />

          {/* Section 2: Modernize Table Toolbar with Icon-Only Refresh & Standard Spacing */}
          <ModernizeTableToolbar
            title={t("WorkLocationsTable")}
            search={filterParams.search || ""}
            onSearchChange={handleSearchChange}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters((prev) => !prev)}
            columns={toolbarColumns}
            onToggleColumn={handleToggleColumn}
            onExportCsv={handleExportCsv}
            selectedCount={selectedIds.length}
            onBulkAction={handleOpenBulkDelete}
            bulkActionTooltip={t("DeleteSelected")}
            onRefresh={loadData}
            isRefreshing={loading}
            onResetFilters={handleResetFilters}
            hasActiveFilters={Boolean(
              filterParams.search || filterParams.isActive !== undefined
            )}
            filterContent={
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={t("StatusFilter")}
                    value={
                      filterParams.isActive === undefined
                        ? "all"
                        : filterParams.isActive
                        ? "active"
                        : "inactive"
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "active") handleIsActiveChange(true);
                      else if (val === "inactive") handleIsActiveChange(false);
                      else handleIsActiveChange(undefined);
                    }}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (selected: any) =>
                        !selected || selected === "all"
                          ? t("AllStatuses")
                          : selected === "active"
                          ? t("ActiveOnly")
                          : t("InactiveOnly"),
                    }}
                  >
                    <MenuItem value="all">{t("AllStatuses")}</MenuItem>
                    <MenuItem value="active">{t("ActiveOnly")}</MenuItem>
                    <MenuItem value="inactive">{t("InactiveOnly")}</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            }
          />

          {/* Section 3: Modernize Data Table */}
          <ModernizeDataTable
            data={paginatedItems}
            columns={columns}
            loading={loading}
            totalCount={items.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            enableSelection={canManage}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            renderExpandedRow={renderExpandedRow}
            actions={rowActions}
            emptyMessage={t("NoLocationsFound")}
          />
        </Stack>
      </Card>

      {/* Create / Edit Form Dialog */}
      <LocationFormDialog
        open={formDialogOpen}
        mode={formDialogMode}
        location={editingLocation}
        isSubmitting={actionLoading}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />

      {/* Details Dialog */}
      <LocationDetailsDialog
        open={detailsDialogOpen}
        location={selectedLocation}
        canManage={canManage}
        onClose={closeDetails}
        onEdit={() => {
          if (selectedLocation) {
            handleOpenEdit(selectedLocation);
          }
        }}
      />

      {/* Single Location Delete Confirmation Dialog */}
      <ConfirmActionDialog
        open={Boolean(locationToDelete)}
        onClose={closeDelete}
        onConfirm={handleConfirmSingleDelete}
        title={t("DeleteLocationQuestion")}
        message={t("DeleteLocationConfirmMsg", { name: locationToDelete ? getLocationDisplayName(locationToDelete, isRtl) : "" })}
        variant="error"
        confirmLabel={t("Delete")}
        cancelLabel={t("Cancel")}
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirmation Dialog */}
      {(() => {
        const confirmInfo = formatBulkDeleteConfirmation(selectedIds.length, "location", isRtl);
        return (
          <ConfirmActionDialog
            open={bulkDeleteOpen}
            onClose={closeBulkDelete}
            onConfirm={handleConfirmBulkDelete}
            title={confirmInfo.title}
            message={confirmInfo.message}
            variant="error"
            confirmLabel={t("Delete")}
            cancelLabel={t("Cancel")}
            isLoading={isDeleting}
          />
        );
      })()}
    </PageContainer>
  );
};
