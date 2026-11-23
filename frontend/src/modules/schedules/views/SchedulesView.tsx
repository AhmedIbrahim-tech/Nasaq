"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import {
  IconPlus,
  IconCalendarTime,
  IconClock,
  IconUsers,
  IconSun,
  IconMoon,
  IconCheck,
  IconX,
  IconEye,
  IconPencil,
  IconRotateDot,
  IconTrash,
  IconUserCheck,
  IconSearch,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { notify } from "@/shared/services/notification.service";
import { RoleNames } from "@/shared/constants/roles";
import PageContainer from "@/shared/components/container/PageContainer";
import Breadcrumb from "@/shared/layouts/dashboard/shared/breadcrumb/Breadcrumb";
import { ConfirmActionDialog } from "@/shared/components/dialogs/ConfirmActionDialog";
import {
  ModernizeStatsCards,
  ModernizeTableToolbar,
  ModernizeDataTable,
  ModernizeColumnDef,
  ModernizeRowAction,
} from "@/shared/components/tables/modernize";
import { useSchedules, useScheduleFilters } from "../hooks";
import { ShiftFormDialog } from "../components/ShiftFormDialog";
import { ScheduleFormDialog } from "../components/ScheduleFormDialog";
import { AssignScheduleDialog } from "../components/AssignScheduleDialog";
import { ScheduleDetailsDialog } from "../components/ScheduleDetailsDialog";
import {
  getShiftDisplayName,
  getScheduleDisplayName,
  getScheduleDisplayDescription,
} from "../utils/scheduleLocalization";
import type {
  WorkSchedule,
  WorkShift,
  EmployeeScheduleAssignment,
} from "../types";

export const SchedulesView: React.FC = () => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const {
    canManage,
    activeTab,
    setActiveTab,
    schedules,
    schedulesSummary,
    schedulesLoading,
    shifts,
    shiftsSummary,
    shiftsLoading,
    assignments,
    assignmentsLoading,
    employees,
    shiftFormOpen,
    shiftFormMode,
    selectedShift,
    scheduleFormOpen,
    scheduleFormMode,
    selectedSchedule,
    scheduleDetailsOpen,
    detailSchedule,
    assignDialogOpen,
    isSubmitting,
    deleteDialogOpen,
    itemToDelete,
    loadSchedules,
    loadShifts,
    loadAssignments,
    openCreateShift: handleCreateShift,
    openEditShift: handleEditShift,
    closeShiftForm,
    submitShift: handleSubmitShift,
    toggleShiftStatus: handleToggleShiftStatus,
    openCreateSchedule: handleCreateSchedule,
    openEditSchedule: handleEditSchedule,
    closeScheduleForm,
    openScheduleDetails: handleViewSchedule,
    closeScheduleDetails,
    submitSchedule: handleSubmitSchedule,
    toggleScheduleStatus: handleToggleScheduleStatus,
    openAssignDialog: handleOpenAssignDialog,
    closeAssignDialog,
    submitAssignment: handleSubmitAssignment,
    openDeletePrompt: handleDeletePrompt,
    closeDeletePrompt,
    confirmDelete: handleConfirmDelete,
  } = useSchedules();

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    showFilters,
    setShowFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
  } = useScheduleFilters();

  // Reset pagination on tab change or search
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    resetFilters();
  };

  // ==========================================
  // TAB 0: SCHEDULES COLUMNS & STATS
  // ==========================================
  const scheduleStats = useMemo(() => {
    return [
      {
        value: schedulesSummary?.totalSchedules ?? schedules.length,
        label: t("TotalSchedules"),
        icon: <IconCalendarTime color={theme.palette.primary.main} size={22} />,
        bgcolor: "primary.light",
        color: "primary.main",
      },
      {
        value: schedulesSummary?.activeSchedules ?? schedules.filter((s) => s.isActive).length,
        label: t("ActiveSchedules"),
        icon: <IconCheck color={theme.palette.success.main} size={22} />,
        bgcolor: "success.light",
        color: "success.main",
      },
      {
        value: schedulesSummary?.inactiveSchedules ?? schedules.filter((s) => !s.isActive).length,
        label: t("InactiveSchedules"),
        icon: <IconX color={theme.palette.error.main} size={22} />,
        bgcolor: "error.light",
        color: "error.main",
      },
      {
        value: schedulesSummary?.assignedEmployeesTotal ?? 0,
        label: t("AssignedEmployees"),
        icon: <IconUsers color={theme.palette.info.main} size={22} />,
        bgcolor: "info.light",
        color: "info.main",
      },
    ];
  }, [schedulesSummary, schedules, t, theme]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchesSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && s.isActive) ||
        (statusFilter === "inactive" && !s.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [schedules, search, statusFilter]);

  const scheduleColumns: ModernizeColumnDef<WorkSchedule>[] = useMemo(
    () => [
      {
        id: "name",
        header: t("ScheduleName"),
        cell: (s) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: "8px",
                bgcolor: s.isActive ? "primary.light" : "action.hover",
                color: s.isActive ? "primary.main" : "text.secondary",
                display: "flex",
              }}
            >
              <IconCalendarTime size={18} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" fontWeight={600}>
                  {getScheduleDisplayName(s, isRtl)}
                </Typography>
                {s.isDefault && (
                  <Chip size="small" label={t("Default")} color="info" variant="filled" />
                )}
              </Stack>
              {(() => {
                const desc = getScheduleDisplayDescription(s, isRtl);
                return desc ? (
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220 }}>
                    {desc}
                  </Typography>
                ) : null;
              })()}
            </Box>
          </Stack>
        ),
      },
      {
        id: "workingDays",
        header: t("WorkingDays"),
        cell: (s) => {
          const count = s.days?.filter((d) => d.isWorkingDay).length || 0;
          return (
            <Chip
              size="small"
              label={`${count} / 7 ${t("DaysUnit")}`}
              color={count > 0 ? "primary" : "default"}
              variant="outlined"
            />
          );
        },
      },
      {
        id: "assignedCount",
        header: t("AssignedStaff"),
        cell: (s) => (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconUsers size={16} color={theme.palette.text.secondary} />
            <Typography variant="body2" fontWeight={500}>
              {s.assignedEmployeesCount || 0}
            </Typography>
          </Stack>
        ),
      },
      {
        id: "status",
        header: t("Status"),
        cell: (s) => (
          <Chip
            size="small"
            label={s.isActive ? t("Active") : t("Inactive")}
            color={s.isActive ? "success" : "default"}
            variant="filled"
          />
        ),
      },
    ],
    [t, theme]
  );

  const scheduleActions: ModernizeRowAction<WorkSchedule>[] = useMemo(
    () => [
      {
        label: t("ViewDetails"),
        icon: <IconEye size={18} />,
        color: "info" as const,
        onClick: (s) => handleViewSchedule(s),
      },
      ...(canManage
        ? [
            {
              label: t("Edit"),
              icon: <IconPencil size={18} />,
              color: "warning" as const,
              onClick: (s: WorkSchedule) => handleEditSchedule(s),
            },
            {
              label: t("ToggleStatus"),
              icon: <IconUserCheck size={18} />,
              color: "success" as const,
              onClick: (s: WorkSchedule) => handleToggleScheduleStatus(s),
            },
            {
              label: t("Delete"),
              icon: <IconTrash size={18} />,
              color: "error" as const,
              isDanger: true,
              onClick: (s: WorkSchedule) => handleDeletePrompt(s.id, getScheduleDisplayName(s, isRtl), "schedule"),
            },
          ]
        : []),
    ],
    [canManage, t]
  );

  // ==========================================
  // TAB 1: SHIFTS COLUMNS & STATS
  // ==========================================
  const shiftStats = useMemo(() => {
    return [
      {
        value: shiftsSummary?.totalShifts ?? shifts.length,
        label: t("TotalShifts"),
        icon: <IconClock color={theme.palette.primary.main} size={22} />,
        bgcolor: "primary.light",
        color: "primary.main",
      },
      {
        value: shiftsSummary?.activeShifts ?? shifts.filter((s) => s.isActive).length,
        label: t("ActiveShifts"),
        icon: <IconCheck color={theme.palette.success.main} size={22} />,
        bgcolor: "success.light",
        color: "success.main",
      },
      {
        value: shiftsSummary?.overnightShiftsCount ?? shifts.filter((s) => s.isOvernight).length,
        label: t("OvernightShifts"),
        icon: <IconMoon color={theme.palette.secondary.main} size={22} />,
        bgcolor: "secondary.light",
        color: "secondary.main",
      },
      {
        value: shiftsSummary?.dayShiftsCount ?? shifts.filter((s) => !s.isOvernight).length,
        label: t("DaytimeShifts"),
        icon: <IconSun color={theme.palette.warning.main} size={22} />,
        bgcolor: "warning.light",
        color: "warning.main",
      },
    ];
  }, [shiftsSummary, shifts, t, theme]);

  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      const matchesSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && s.isActive) ||
        (statusFilter === "inactive" && !s.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [shifts, search, statusFilter]);

  const shiftColumns: ModernizeColumnDef<WorkShift>[] = useMemo(
    () => [
      {
        id: "name",
        header: t("ShiftName"),
        cell: (s) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: "8px",
                bgcolor: s.isOvernight ? "secondary.light" : "primary.light",
                color: s.isOvernight ? "secondary.main" : "primary.main",
                display: "flex",
              }}
            >
              {s.isOvernight ? <IconMoon size={18} /> : <IconSun size={18} />}
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {getShiftDisplayName(s, isRtl)}
              </Typography>
              {s.notes && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220 }}>
                  {s.notes}
                </Typography>
              )}
            </Box>
          </Stack>
        ),
      },
      {
        id: "hours",
        header: t("WorkingHours"),
        cell: (s) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
              {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
            </Typography>
            {s.isOvernight && (
              <Chip size="small" label={t("Overnight")} color="secondary" variant="filled" />
            )}
          </Stack>
        ),
      },
      {
        id: "duration",
        header: t("Duration"),
        cell: (s) => (
          <Chip
            size="small"
            label={`${s.durationHours} ${t("HoursUnit")}`}
            color="default"
            variant="outlined"
          />
        ),
      },
      {
        id: "status",
        header: t("Status"),
        cell: (s) => (
          <Chip
            size="small"
            label={s.isActive ? t("Active") : t("Inactive")}
            color={s.isActive ? "success" : "default"}
            variant="filled"
          />
        ),
      },
    ],
    [t]
  );

  const shiftActions: ModernizeRowAction<WorkShift>[] = useMemo(
    () =>
      canManage
        ? [
            {
              label: t("Edit"),
              icon: <IconPencil size={18} />,
              color: "warning" as const,
              onClick: (s: WorkShift) => handleEditShift(s),
            },
            {
              label: t("ToggleStatus"),
              icon: <IconUserCheck size={18} />,
              color: "success" as const,
              onClick: (s: WorkShift) => handleToggleShiftStatus(s),
            },
            {
              label: t("Delete"),
              icon: <IconTrash size={18} />,
              color: "error" as const,
              isDanger: true,
              onClick: (s: WorkShift) => handleDeletePrompt(s.id, getShiftDisplayName(s, isRtl), "shift"),
            },
          ]
        : [],
    [canManage, t]
  );

  // ==========================================
  // TAB 2: ASSIGNMENTS COLUMNS
  // ==========================================
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch =
        !search.trim() ||
        a.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        a.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
        a.scheduleName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && a.isActive) ||
        (statusFilter === "inactive" && !a.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [assignments, search, statusFilter]);

  const assignmentColumns: ModernizeColumnDef<EmployeeScheduleAssignment>[] = useMemo(
    () => [
      {
        id: "employee",
        header: t("Employee"),
        cell: (a) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: "8px",
                bgcolor: "info.light",
                color: "info.main",
                display: "flex",
              }}
            >
              <IconUserCheck size={18} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {isRtl && a.employeeNameAr ? a.employeeNameAr : a.employeeName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {a.employeeCode} {(isRtl && a.departmentAr ? a.departmentAr : a.department) ? `• ${isRtl && a.departmentAr ? a.departmentAr : a.department}` : ""}
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        id: "schedule",
        header: t("AssignedSchedule"),
        cell: (a) => (
          <Typography variant="body2" fontWeight={600} color="primary">
            {isRtl && a.scheduleNameAr ? a.scheduleNameAr : a.scheduleName}
          </Typography>
        ),
      },
      {
        id: "effectiveRange",
        header: t("EffectiveDateRange"),
        cell: (a) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              {a.effectiveFrom} → {a.effectiveTo || t("PresentOpenEnded")}
            </Typography>
          </Stack>
        ),
      },
      {
        id: "status",
        header: t("Status"),
        cell: (a) => (
          <Chip
            size="small"
            label={a.isActive ? t("Active") : t("Inactive")}
            color={a.isActive ? "success" : "default"}
            variant="filled"
          />
        ),
      },
    ],
    [t]
  );

  const assignmentStats = useMemo(() => {
    return [
      {
        value: assignments.length,
        label: t("TotalAssignments"),
        icon: <IconUsers color={theme.palette.primary.main} size={22} />,
        bgcolor: "primary.light",
        color: "primary.main",
      },
      {
        value: assignments.filter((a) => a.isActive).length,
        label: t("ActiveAssignments"),
        icon: <IconCheck color={theme.palette.success.main} size={22} />,
        bgcolor: "success.light",
        color: "success.main",
      },
      {
        value: assignments.filter((a) => !a.isActive).length,
        label: t("InactiveAssignments"),
        icon: <IconX color={theme.palette.error.main} size={22} />,
        bgcolor: "error.light",
        color: "error.main",
      },
      {
        value: new Set(assignments.map((a) => a.employeeId)).size,
        label: t("AssignedEmployees"),
        icon: <IconUserCheck color={theme.palette.info.main} size={22} />,
        bgcolor: "info.light",
        color: "info.main",
      },
    ];
  }, [assignments, t, theme]);

  const assignmentActions: ModernizeRowAction<EmployeeScheduleAssignment>[] = useMemo(
    () =>
      canManage
        ? [
            {
              label: t("RemoveAssignment"),
              icon: <IconTrash size={18} />,
              color: "error" as const,
              isDanger: true,
              onClick: (a: EmployeeScheduleAssignment) =>
                handleDeletePrompt(a.id, `${a.employeeName} (${a.scheduleName})`, "assignment"),
            },
          ]
        : [],
    [canManage, t]
  );

  return (
    <PageContainer title={t("SchedulesAndShifts")} description={t("ManageSchedulesAndShifts")}>
      <Breadcrumb
        title={t("SchedulesAndShifts")}
        items={[
          { title: t("Dashboard"), to: "/" },
          { title: t("Workforce") },
          { title: t("SchedulesAndShifts") },
        ]}
      />

      {/* Modernize Card Container */}
      <Card elevation={0} sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: "12px" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: { xs: 2, sm: 3 },
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              py: 2,
              px: 2,
              fontWeight: 600,
              minHeight: 52,
              display: "inline-flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
            },
          }}
        >
          <Tab
            icon={<IconCalendarTime size={20} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{t("WorkSchedules")}</span>
                <Chip
                  size="small"
                  label={schedules.length}
                  color={activeTab === 0 ? "primary" : "default"}
                  sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }}
                />
              </Stack>
            }
          />
          <Tab
            icon={<IconClock size={20} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{t("WorkShifts")}</span>
                <Chip
                  size="small"
                  label={shifts.length}
                  color={activeTab === 1 ? "primary" : "default"}
                  sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }}
                />
              </Stack>
            }
          />
          <Tab
            icon={<IconUserCheck size={20} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{t("EmployeeAssignments")}</span>
                <Chip
                  size="small"
                  label={assignments.length}
                  color={activeTab === 2 ? "primary" : "default"}
                  sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }}
                />
              </Stack>
            }
          />
        </Tabs>

        <Stack spacing={3} p={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* ========================================================= */}
          {/* TAB 0: WORK SCHEDULES                                     */}
          {/* ========================================================= */}
          {activeTab === 0 && (
            <>
              <ModernizeStatsCards
                title={t("WorkSchedules")}
                action={
                  canManage ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<IconPlus size={18} />}
                      onClick={handleCreateSchedule}
                      sx={{ borderRadius: "8px", fontWeight: 600, height: 38 }}
                    >
                      {t("AddNewSchedule")}
                    </Button>
                  ) : undefined
                }
                items={scheduleStats}
                loading={schedulesLoading}
              />

              <Divider />

              <ModernizeTableToolbar
                title={t("WorkSchedules")}
                search={search}
                onSearchChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters((prev) => !prev)}
                onRefresh={loadSchedules}
                isRefreshing={schedulesLoading}
                onResetFilters={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPage(1);
                }}
                hasActiveFilters={Boolean(search || statusFilter !== "all")}
                filterContent={
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={t("StatusFilter")}
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPage(1);
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

              <ModernizeDataTable
                columns={scheduleColumns}
                data={filteredSchedules.slice((page - 1) * pageSize, page * pageSize)}
                totalCount={filteredSchedules.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
                actions={scheduleActions}
                loading={schedulesLoading}
                emptyMessage={t("NoSchedulesFound")}
              />
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 1: WORK SHIFTS                                        */}
          {/* ========================================================= */}
          {activeTab === 1 && (
            <>
              <ModernizeStatsCards
                title={t("WorkShifts")}
                action={
                  canManage ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<IconPlus size={18} />}
                      onClick={handleCreateShift}
                      sx={{ borderRadius: "8px", fontWeight: 600, height: 38 }}
                    >
                      {t("AddNewShift")}
                    </Button>
                  ) : undefined
                }
                items={shiftStats}
                loading={shiftsLoading}
              />

              <Divider />

              <ModernizeTableToolbar
                title={t("WorkShifts")}
                search={search}
                onSearchChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters((prev) => !prev)}
                onRefresh={loadShifts}
                isRefreshing={shiftsLoading}
                onResetFilters={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPage(1);
                }}
                hasActiveFilters={Boolean(search || statusFilter !== "all")}
                filterContent={
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={t("StatusFilter")}
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPage(1);
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

              <ModernizeDataTable
                columns={shiftColumns}
                data={filteredShifts.slice((page - 1) * pageSize, page * pageSize)}
                totalCount={filteredShifts.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
                actions={shiftActions}
                loading={shiftsLoading}
                emptyMessage={t("NoShiftsFound")}
              />
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 2: EMPLOYEE ASSIGNMENTS                               */}
          {/* ========================================================= */}
          {activeTab === 2 && (
            <>
              <ModernizeStatsCards
                title={t("ScheduleAssignments")}
                action={
                  canManage ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<IconPlus size={18} />}
                      onClick={handleOpenAssignDialog}
                      sx={{ borderRadius: "8px", fontWeight: 600, height: 38 }}
                    >
                      {t("AssignSchedule")}
                    </Button>
                  ) : undefined
                }
                items={assignmentStats}
                loading={assignmentsLoading}
              />

              <Divider />

              <ModernizeTableToolbar
                title={t("ScheduleAssignments")}
                search={search}
                onSearchChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters((prev) => !prev)}
                onRefresh={loadAssignments}
                isRefreshing={assignmentsLoading}
                onResetFilters={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPage(1);
                }}
                hasActiveFilters={Boolean(search || statusFilter !== "all")}
                filterContent={
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={t("StatusFilter")}
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPage(1);
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

              <ModernizeDataTable
                columns={assignmentColumns}
                data={filteredAssignments.slice((page - 1) * pageSize, page * pageSize)}
                totalCount={filteredAssignments.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
                actions={assignmentActions}
                loading={assignmentsLoading}
                emptyMessage={t("NoAssignmentsFound")}
              />
            </>
          )}
        </Stack>
      </Card>

      {/* DIALOGS */}
      <ShiftFormDialog
        open={shiftFormOpen}
        mode={shiftFormMode}
        shift={selectedShift}
        isSubmitting={isSubmitting}
        onClose={closeShiftForm}
        onSubmit={handleSubmitShift}
      />

      <ScheduleFormDialog
        open={scheduleFormOpen}
        mode={scheduleFormMode}
        schedule={selectedSchedule}
        shifts={shifts.filter((s) => s.isActive)}
        isSubmitting={isSubmitting}
        onClose={closeScheduleForm}
        onSubmit={handleSubmitSchedule}
      />

      <ScheduleDetailsDialog
        open={scheduleDetailsOpen}
        schedule={detailSchedule}
        canManage={canManage}
        onClose={closeScheduleDetails}
        onEdit={() => {
          closeScheduleDetails();
          if (detailSchedule) handleEditSchedule(detailSchedule);
        }}
      />

      <AssignScheduleDialog
        open={assignDialogOpen}
        employees={employees}
        schedules={schedules.filter((s) => s.isActive)}
        isSubmitting={isSubmitting}
        onClose={closeAssignDialog}
        onSubmit={handleSubmitAssignment}
      />

      <ConfirmActionDialog
        open={deleteDialogOpen}
        title={
          itemToDelete?.type === "shift"
            ? t("DeleteShiftQuestion")
            : itemToDelete?.type === "assignment"
            ? t("DeleteAssignmentQuestion")
            : t("DeleteScheduleQuestion")
        }
        message={
          itemToDelete?.type === "shift"
            ? t("ConfirmDeleteShiftMessage", { name: itemToDelete?.name || "" })
            : itemToDelete?.type === "assignment"
            ? t("ConfirmDeleteAssignmentMessage", { name: itemToDelete?.name || "" })
            : t("ConfirmDeleteScheduleMessage", { name: itemToDelete?.name || "" })
        }
        variant="error"
        confirmColor="error"
        confirmLabel={t("Delete")}
        cancelLabel={t("Cancel")}
        isLoading={isSubmitting}
        onConfirm={handleConfirmDelete}
        onClose={closeDeletePrompt}
      />
    </PageContainer>
  );
};

export default SchedulesView;
