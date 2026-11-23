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
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import { useTheme, alpha } from "@mui/material/styles";
import {
  IconPlus,
  IconUsers,
  IconUserCheck,
  IconUserX,
  IconMapPin,
  IconShield,
  IconPencil,
  IconEye,
  IconPhone,
  IconMail,
  IconCalendar,
  IconRotateDot,
  IconTrash,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUserProfile } from "@/modules/auth/slices/auth.slice";
import { notify } from "@/shared/services/notification.service";
import { RoleNames } from "@/shared/constants/roles";
import { Router } from "@/lib/api/router";
import { fetchLocationsThunk } from "@/modules/locations";
import PageContainer from "@/shared/components/container/PageContainer";
import Breadcrumb from "@/shared/layouts/dashboard/shared/breadcrumb/Breadcrumb";
import { ConfirmActionDialog } from "@/shared/components/dialogs/ConfirmActionDialog";
import { ProfilePhotoAvatar } from "@/shared/components/avatar";
import { broadcastPhotoInvalidation } from "@/shared/hooks/useAuthenticatedPhotoUrl";
import { formatBulkDeleteConfirmation, formatDateOnly } from "@/shared/utils/i18nFormatters";
import {
  getEmployeeDisplayName,
  getEmployeeDepartment,
  getEmployeeJobTitle,
  getEmployeeSupervisorName,
  getEmployeeWorkLocationName,
} from "../utils/employeeLocalization";
import {
  ModernizeStatsCards,
  ModernizeTableToolbar,
  ModernizeDataTable,
  ModernizeColumnDef,
  ModernizeRowAction,
} from "@/shared/components/tables/modernize";
import { EmployeeFormDialog } from "../components/EmployeeFormDialog";
import { EmployeeDetailsDialog } from "../components/EmployeeDetailsDialog";
import { useEmployees, useEmployeeFilters } from "../hooks";
import type { Employee } from "../types";

export const EmployeeListView: React.FC = () => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const {
    items,
    supervisors,
    summary,
    summaryLoading,
    totalCount,
    currentPage,
    pageSize,
    loading,
    actionLoading,
    locations,
    departments,
    canManage,
    isSuperAdmin,
    formOpen,
    formMode,
    selectedEmployee,
    detailsOpen,
    selectedIds,
    setSelectedIds,
    employeeToDelete,
    bulkDeleteOpen,
    isDeleting,
    loadData,
    openCreate: handleOpenCreate,
    openEdit: handleOpenEdit,
    closeForm,
    openDetails: handleOpenDetails,
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
  } = useEmployees();

  const {
    filterParams,
    showFilters,
    setShowFilters,
    columnVisibility,
    toggleColumn: handleToggleColumn,
    onSearchChange: handleSearchChange,
    onDepartmentChange: handleDepartmentChange,
    onIsActiveChange: handleIsActiveChange,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    onSortChange: handleSortChange,
    onResetFilters: handleResetFilters,
  } = useEmployeeFilters();

  // Meaningful 4-Card Summary Statistics (High operational utility, no empty grid gaps)
  const statsData = useMemo(() => {
    return [
      {
        value: summary?.totalEmployees ?? totalCount,
        label: t("TotalEmployees"),
        icon: <IconUsers color={theme.palette.primary.main} size={22} />,
        bgcolor: "primary.light",
        color: "primary.main",
      },
      {
        value: summary?.activeEmployees ?? 0,
        label: t("ActiveEmployees"),
        icon: <IconUserCheck color={theme.palette.success.main} size={22} />,
        bgcolor: "success.light",
        color: "success.main",
      },
      {
        value: summary?.inactiveEmployees ?? 0,
        label: t("InactiveEmployees"),
        icon: <IconUserX color={theme.palette.error.main} size={22} />,
        bgcolor: "error.light",
        color: "error.main",
      },
      {
        value: summary?.assignedLocationCount ?? 0,
        label: t("AssignedToLocation"),
        icon: <IconMapPin color={theme.palette.info.main} size={22} />,
        bgcolor: "info.light",
        color: "info.main",
      },
    ];
  }, [summary, totalCount, t, theme]);

  // Concise Overview Table Columns
  const columns: ModernizeColumnDef<Employee>[] = useMemo(
    () => [
      {
        id: "employeeCode",
        header: t("EmployeeCode"),
        isSortable: true,
        sortKey: "EmployeeCode",
        visible: columnVisibility.employeeCode,
        cell: (emp) => (
          <Typography
            variant="body2"
            fontWeight={600}
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
            {emp.employeeCode}
          </Typography>
        ),
      },
      {
        id: "fullName",
        header: t("EmployeeName"),
        isSortable: true,
        sortKey: "LastName",
        visible: columnVisibility.fullName,
        cell: (emp) => {
          const empDisplayName = getEmployeeDisplayName(emp, isRtl);
          return (
            <Box display="flex" alignItems="center" gap={1.5}>
              <ProfilePhotoAvatar
                photoId={emp.profilePhoto}
                name={empDisplayName}
                size={38}
                colorScheme="soft"
              />
              <Box minWidth={0}>
                <Typography variant="subtitle2" fontWeight={700} noWrap>
                  {empDisplayName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", direction: "ltr", textAlign: isRtl ? "right" : "left" }}
                  noWrap
                >
                  {emp.email}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        id: "primaryWorkInfo",
        header: t("PrimaryWorkInfo"),
        visible: columnVisibility.primaryWorkInfo,
        cell: (emp) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {getEmployeeJobTitle(emp, isRtl) || "-"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getEmployeeDepartment(emp, isRtl) || "-"}
            </Typography>
          </Box>
        ),
      },
      {
        id: "department",
        header: t("Department"),
        isSortable: true,
        sortKey: "Department",
        visible: columnVisibility.department,
        cell: (emp) => (
          <Typography variant="body2">{getEmployeeDepartment(emp, isRtl) || "-"}</Typography>
        ),
      },
      {
        id: "jobTitle",
        header: t("JobTitle"),
        isSortable: true,
        sortKey: "JobTitle",
        visible: columnVisibility.jobTitle,
        cell: (emp) => (
          <Typography variant="body2">{getEmployeeJobTitle(emp, isRtl) || "-"}</Typography>
        ),
      },
      {
        id: "supervisorName",
        header: t("DirectSupervisor"),
        visible: columnVisibility.supervisorName,
        cell: (emp) => {
          const supName = getEmployeeSupervisorName(emp, isRtl);
          return supName ? (
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {supName}
              </Typography>
              {emp.supervisorCode && (
                <Typography variant="caption" color="text.secondary" sx={{ direction: "ltr", display: "inline-block" }}>
                  {emp.supervisorCode}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              {t("NoSupervisorAssigned")}
            </Typography>
          );
        },
      },
      {
        id: "workLocationName",
        header: t("WorkLocation"),
        visible: columnVisibility.workLocationName,
        cell: (emp) => {
          const locName = getEmployeeWorkLocationName(emp, isRtl);
          return locName ? (
            <Chip
              size="small"
              icon={<IconMapPin size={14} />}
              label={locName}
              variant="outlined"
            />
          ) : (
            <Typography variant="caption" color="text.secondary">
              {t("NoLocationAssigned")}
            </Typography>
          );
        },
      },
      {
        id: "userRole",
        header: t("SystemRole"),
        visible: columnVisibility.userRole,
        cell: (emp) =>
          emp.userRole ? (
            <Chip
              size="small"
              icon={<IconShield size={14} />}
              label={t(emp.userRole)}
              color={
                emp.userRole === "SuperAdmin"
                  ? "primary"
                  : emp.userRole === "Admin"
                  ? "secondary"
                  : emp.userRole === "Supervisor"
                  ? "info"
                  : "default"
              }
              variant="outlined"
            />
          ) : (
            <Typography variant="caption" color="text.secondary">
              {t("NoLinkedUser")}
            </Typography>
          ),
      },
      {
        id: "isActive",
        header: t("Status"),
        isSortable: true,
        sortKey: "IsActive",
        visible: columnVisibility.isActive,
        cell: (emp) => (
          <Chip
            size="small"
            label={emp.isActive ? t("Active") : t("Inactive")}
            color={emp.isActive ? "success" : "default"}
            sx={{ fontWeight: 600, fontSize: "12px" }}
          />
        ),
      },
      {
        id: "hireDate",
        header: t("HireDate"),
        isSortable: true,
        sortKey: "HireDate",
        visible: columnVisibility.hireDate,
        cell: (emp) => (
          <Typography variant="body2" color="text.secondary" sx={{ direction: "ltr", display: "inline-block" }}>
            {emp.hireDate ? formatDateOnly(emp.hireDate, isRtl) : "-"}
          </Typography>
        ),
      },
    ],
    [columnVisibility, isRtl, t]
  );

  // Modernize Row Actions Menu Items
  const rowActions: ModernizeRowAction<Employee>[] = useMemo(
    () => [
      {
        label: t("ViewDetails"),
        icon: <IconEye size={18} color={theme.palette.info.main} />,
        onClick: (emp) => handleOpenDetails(emp),
      },
      {
        label: t("Edit"),
        icon: <IconPencil size={18} color={theme.palette.warning.main} />,
        show: () => canManage,
        onClick: (emp) => handleOpenEdit(emp),
      },
      {
        label: t("ToggleStatus"),
        icon: <IconUserCheck size={18} color={theme.palette.success.main} />,
        show: () => canManage,
        onClick: (emp) => handleToggleStatus(emp),
      },
      {
        label: t("Delete"),
        icon: <IconTrash size={18} color={theme.palette.error.main} />,
        show: () => canManage,
        onClick: (emp) => handleOpenSingleDelete(emp),
      },
    ],
    [canManage, t, theme]
  );

  // Expandable row rendering with secondary details
  const renderExpandedRow = useCallback(
    (emp: Employee) => (
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
          gap={1.5}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ProfilePhotoAvatar
              photoId={emp.profilePhoto}
              name={getEmployeeDisplayName(emp, isRtl)}
              size={44}
              colorScheme="soft"
              sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                {t("EmployeeQuickDetails")}: {getEmployeeDisplayName(emp, isRtl)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  bgcolor: "action.hover",
                  px: 1,
                  py: 0.25,
                  borderRadius: "6px",
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  direction: "ltr",
                  display: "inline-block",
                  mt: 0.5,
                }}
              >
                {emp.employeeCode}
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            label={emp.isActive ? t("Active") : t("Inactive")}
            color={emp.isActive ? "success" : "default"}
          />
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
                  {getEmployeeWorkLocationName(emp, isRtl) || t("NoLocationAssigned")}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* System Role */}
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
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                  color: "secondary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconShield size={20} stroke={1.75} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("SystemRole")}
                </Typography>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {emp.userRole ? t(emp.userRole) : t("NoLinkedUser")}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Phone Number */}
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
                <IconPhone size={20} stroke={1.75} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("PhoneNumber")}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  component="span"
                  sx={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}
                >
                  {emp.phoneNumber || "-"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Hire Date */}
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
                <IconCalendar size={20} stroke={1.75} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("HireDate")}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  component="span"
                  sx={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}
                >
                  {formatDateOnly(emp.hireDate, isRtl)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
          <Typography variant="body2" color="text.secondary">
            {t("DirectSupervisor")}:{" "}
            <strong>
              {emp.supervisorName ? `${emp.supervisorName} (${emp.supervisorCode})` : t("NoSupervisorAssigned")}
            </strong>
          </Typography>

          <Stack direction="row" spacing={1.25}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<IconEye size={16} />}
              onClick={() => handleOpenDetails(emp)}
              sx={{ borderRadius: "8px", px: 1.75 }}
            >
              {t("ViewDetails")}
            </Button>
            {canManage && (
              <Button
                size="small"
                variant="contained"
                startIcon={<IconPencil size={16} />}
                onClick={() => handleOpenEdit(emp)}
                sx={{ borderRadius: "8px", px: 1.75 }}
              >
                {t("Edit")}
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    ),
    [canManage, isRtl, t]
  );

  const toolbarColumns = useMemo(
    () => [
      { id: "employeeCode", label: t("EmployeeCode"), visible: columnVisibility.employeeCode },
      { id: "fullName", label: t("EmployeeName"), visible: columnVisibility.fullName },
      { id: "primaryWorkInfo", label: t("PrimaryWorkInfo"), visible: columnVisibility.primaryWorkInfo },
      { id: "department", label: t("Department"), visible: columnVisibility.department },
      { id: "jobTitle", label: t("JobTitle"), visible: columnVisibility.jobTitle },
      { id: "supervisorName", label: t("DirectSupervisor"), visible: columnVisibility.supervisorName },
      { id: "workLocationName", label: t("WorkLocation"), visible: columnVisibility.workLocationName },
      { id: "userRole", label: t("SystemRole"), visible: columnVisibility.userRole },
      { id: "isActive", label: t("Status"), visible: columnVisibility.isActive },
      { id: "hireDate", label: t("HireDate"), visible: columnVisibility.hireDate },
    ],
    [columnVisibility, t]
  );

  return (
    <PageContainer title={t("EmployeeManagement")}>
      {/* Modernize Page Header with Breadcrumb and illustration (Description removed as requested) */}
      <Breadcrumb
        title={t("Employees")}
        items={[
          { title: t("Dashboard"), to: "/" },
          { title: t("Workforce"), to: "/employees" },
          { title: t("Employees") },
        ]}
      />

      {/* Modernize Card Container */}
      <Card elevation={0} sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: "12px" }}>
        <Stack spacing={3} p={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Section 1: Overview Header with Add Button on opposite side + Meaningful 4-Card Stats */}
          <ModernizeStatsCards
            title={t("EmployeesOverview")}
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
                  {t("AddNewEmployee")}
                </Button>
              ) : undefined
            }
            items={statsData}
            loading={summaryLoading}
          />

          <Divider />

          {/* Section 2: Modernize Table Toolbar with Icon-Only Refresh & Standard Spacing */}
          <ModernizeTableToolbar
            title={t("EmployeesTable")}
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
              filterParams.search ||
              (filterParams.department && filterParams.department !== "" && filterParams.department !== "all") ||
              filterParams.isActive !== undefined
            )}
            filterContent={
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={t("FilterByDepartment")}
                    value={filterParams.department || "all"}
                    onChange={(e) => handleDepartmentChange(e.target.value === "all" ? "" : e.target.value)}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (selected: any) =>
                        !selected || selected === "all" ? t("AllDepartments") : selected,
                    }}
                  >
                    <MenuItem value="all">{t("AllDepartments")}</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

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
            data={items}
            columns={columns}
            loading={loading}
            totalCount={totalCount}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            sortColumn={filterParams.sortBy}
            sortOrder={filterParams.sortDescending ? "desc" : "asc"}
            onSortChange={handleSortChange}
            enableSelection={canManage}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            renderExpandedRow={renderExpandedRow}
            actions={rowActions}
            emptyMessage={t("NoEmployeesFound")}
          />
        </Stack>
      </Card>

      {/* Create / Edit Form Dialog */}
      <EmployeeFormDialog
        open={formOpen}
        mode={formMode}
        employee={selectedEmployee}
        isSubmitting={actionLoading}
        isSuperAdmin={isSuperAdmin}
        departments={departments}
        supervisors={supervisors}
        locations={locations}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />

      {/* View Details Dialog */}
      <EmployeeDetailsDialog
        open={detailsOpen}
        employee={selectedEmployee}
        canManage={canManage}
        onClose={closeDetails}
        onEdit={() => {
          closeDetails();
          if (selectedEmployee) handleOpenEdit(selectedEmployee);
        }}
      />

      {/* Single Employee Delete Confirmation Dialog */}
      <ConfirmActionDialog
        open={Boolean(employeeToDelete)}
        onClose={closeDelete}
        onConfirm={handleConfirmSingleDelete}
        title={t("DeleteEmployeeQuestion")}
        message={t("DeleteEmployeeConfirmMsg", { name: employeeToDelete?.fullName || "" })}
        variant="error"
        confirmLabel={t("Delete")}
        cancelLabel={t("Cancel")}
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirmation Dialog */}
      {(() => {
        const confirmInfo = formatBulkDeleteConfirmation(selectedIds.length, "employee", isRtl);
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
