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
import { scheduleService } from "../services/schedule.service";
import { employeeService } from "@/modules/employees/services/employee.service";
import { ShiftFormDialog } from "../components/ShiftFormDialog";
import { ScheduleFormDialog } from "../components/ScheduleFormDialog";
import { AssignScheduleDialog } from "../components/AssignScheduleDialog";
import { ScheduleDetailsDialog } from "../components/ScheduleDetailsDialog";
import type {
  WorkSchedule,
  WorkShift,
  EmployeeScheduleAssignment,
  SchedulesSummary,
  ShiftsSummary,
  CreateShiftRequest,
  UpdateShiftRequest,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  AssignEmployeeScheduleRequest,
} from "../types";
import type { Employee } from "@/modules/employees/types";

export const SchedulesView: React.FC = () => {
  const t = useTranslations();
  const theme = useTheme();
  const userRoles = useAppSelector((state) => state.auth.roles) || [];

  const canManage = useMemo(() => {
    return userRoles.includes(RoleNames.SuperAdmin) || userRoles.includes(RoleNames.Admin);
  }, [userRoles]);

  // Active Tab: 0 = Schedules, 1 = Shifts, 2 = Assignments
  const [activeTab, setActiveTab] = useState<number>(0);

  // --- DATA STATES ---
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [schedulesSummary, setSchedulesSummary] = useState<SchedulesSummary | null>(null);
  const [schedulesLoading, setSchedulesLoading] = useState<boolean>(true);

  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [shiftsSummary, setShiftsSummary] = useState<ShiftsSummary | null>(null);
  const [shiftsLoading, setShiftsLoading] = useState<boolean>(true);

  const [assignments, setAssignments] = useState<EmployeeScheduleAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState<boolean>(true);

  const [employees, setEmployees] = useState<Employee[]>([]);

  // Filter & Search states
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Dialog States
  const [shiftFormOpen, setShiftFormOpen] = useState<boolean>(false);
  const [shiftFormMode, setShiftFormMode] = useState<"create" | "edit">("create");
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);

  const [scheduleFormOpen, setScheduleFormOpen] = useState<boolean>(false);
  const [scheduleFormMode, setScheduleFormMode] = useState<"create" | "edit">("create");
  const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);

  const [scheduleDetailsOpen, setScheduleDetailsOpen] = useState<boolean>(false);
  const [detailSchedule, setDetailSchedule] = useState<WorkSchedule | null>(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Deletion confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: "schedule" | "shift" | "assignment";
  } | null>(null);

  // --- DATA FETCHING ---
  const loadSchedules = useCallback(async () => {
    try {
      setSchedulesLoading(true);
      const [resList, resSummary] = await Promise.all([
        scheduleService.getSchedules({ page: 1, pageSize: 100 }),
        scheduleService.getSchedulesSummary(),
      ]);
      setSchedules(resList.data);
      setSchedulesSummary(resSummary);
    } catch (err: any) {
      notify.error(err.message || t("ErrorOccurred"));
    } finally {
      setSchedulesLoading(false);
    }
  }, [t]);

  const loadShifts = useCallback(async () => {
    try {
      setShiftsLoading(true);
      const [resList, resSummary] = await Promise.all([
        scheduleService.getShifts({ page: 1, pageSize: 100 }),
        scheduleService.getShiftsSummary(),
      ]);
      setShifts(resList.data);
      setShiftsSummary(resSummary);
    } catch (err: any) {
      notify.error(err.message || t("ErrorOccurred"));
    } finally {
      setShiftsLoading(false);
    }
  }, [t]);

  const loadAssignments = useCallback(async () => {
    try {
      setAssignmentsLoading(true);
      const res = await scheduleService.getAssignments({ page: 1, pageSize: 100 });
      setAssignments(res.data);
    } catch (err: any) {
      notify.error(err.message || t("ErrorOccurred"));
    } finally {
      setAssignmentsLoading(false);
    }
  }, [t]);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await employeeService.getEmployees({ page: 1, pageSize: 200, isActive: true });
      setEmployees(res.data);
    } catch {
      // Non-blocking
    }
  }, []);

  useEffect(() => {
    loadSchedules();
    loadShifts();
    loadAssignments();
    loadEmployees();
  }, [loadSchedules, loadShifts, loadAssignments, loadEmployees]);

  // Reset pagination on tab change or search
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  // --- ACTIONS: SHIFTS ---
  const handleCreateShift = () => {
    setSelectedShift(null);
    setShiftFormMode("create");
    setShiftFormOpen(true);
  };

  const handleEditShift = (shift: WorkShift) => {
    setSelectedShift(shift);
    setShiftFormMode("edit");
    setShiftFormOpen(true);
  };

  const handleSubmitShift = async (data: CreateShiftRequest | UpdateShiftRequest) => {
    try {
      setIsSubmitting(true);
      if (shiftFormMode === "create") {
        await scheduleService.createShift(data as CreateShiftRequest);
        notify.success(t("ShiftCreatedSuccess"));
      } else if (selectedShift) {
        await scheduleService.updateShift(selectedShift.id, {
          ...(data as UpdateShiftRequest),
          id: selectedShift.id,
        });
        notify.success(t("ShiftUpdatedSuccess"));
      }
      setShiftFormOpen(false);
      loadShifts();
    } catch (err: any) {
      notify.error(err.message || t("ErrorOccurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleShiftStatus = async (shift: WorkShift) => {
    try {
      await scheduleService.toggleShiftStatus(shift.id);
      notify.success(
        shift.isActive ? t("ShiftDeactivatedSuccess") : t("ShiftActivatedSuccess")
      );
      loadShifts();
    } catch (err: any) {
      notify.error(err.message || t("ErrorOccurred"));
    }
  };

  // --- ACTIONS: SCHEDULES ---
  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setScheduleFormMode("create");
    setScheduleFormOpen(true);
  };

  const handleEditSchedule = (schedule: WorkSchedule) => {
    setSelectedSchedule(schedule);
    setScheduleFormMode("edit");
    setScheduleFormOpen(true);
  };

  const handleViewSchedule = (schedule: WorkSchedule) => {
    setDetailSchedule(schedule);
    setScheduleDetailsOpen(true);
  };

  const handleSubmitSchedule = async (data: CreateScheduleRequest | UpdateScheduleRequest) => {
    try {
      setIsSubmitting(true);
      if (scheduleFormMode === "create") {
        await scheduleService.createSchedule(data as CreateScheduleRequest);
        notify.success(t("ScheduleCreatedSuccess"));
      } else if (selectedSchedule) {
        await scheduleService.updateSchedule(selectedSchedule.id, {
          ...(data as UpdateScheduleRequest),
          id: selectedSchedule.id,
        });
        notify.success(t("ScheduleUpdatedSuccess"));
      }
      setScheduleFormOpen(false);
      loadSchedules();
    } catch (err: any) {
      notify.error(err.message || t("ErrorOccurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleScheduleStatus = async (schedule: WorkSchedule) => {
    try {
      await scheduleService.toggleScheduleStatus(schedule.id);
      notify.success(
        schedule.isActive ? t("ScheduleDeactivatedSuccess") : t("ScheduleActivatedSuccess")
      );
      loadSchedules();
    } catch (err: any) {
      notify.error(err.message || t("ErrorOccurred"));
    }
  };

  // --- ACTIONS: ASSIGNMENTS ---
  const handleOpenAssignDialog = () => {
    setAssignDialogOpen(true);
  };

  const handleSubmitAssignment = async (data: AssignEmployeeScheduleRequest) => {
    try {
      setIsSubmitting(true);
      await scheduleService.assignSchedule(data);
      notify.success(t("ScheduleAssignedSuccess"));
      setAssignDialogOpen(false);
      loadAssignments();
      loadSchedules();
    } catch (err: any) {
      notify.error(err.message || t("ErrorOccurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- GENERIC DELETION ---
  const handleDeletePrompt = (id: string, name: string, type: "schedule" | "shift" | "assignment") => {
    setItemToDelete({ id, name, type });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsSubmitting(true);
      if (itemToDelete.type === "schedule") {
        await scheduleService.deleteSchedule(itemToDelete.id);
        notify.success(t("ScheduleDeletedSuccess"));
        loadSchedules();
      } else if (itemToDelete.type === "shift") {
        await scheduleService.deleteShift(itemToDelete.id);
        notify.success(t("ShiftDeletedSuccess"));
        loadShifts();
      } else if (itemToDelete.type === "assignment") {
        await scheduleService.deleteAssignment(itemToDelete.id);
        notify.success(t("AssignmentDeletedSuccess"));
        loadAssignments();
        loadSchedules();
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      notify.error(err.message || t("ErrorOccurred"));
    } finally {
      setIsSubmitting(false);
    }
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
                  {theme.direction === "rtl" && s.nameAr ? s.nameAr : s.name}
                </Typography>
                {s.isDefault && (
                  <Chip size="small" label={t("Default")} color="info" variant="filled" />
                )}
              </Stack>
              {s.description && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220 }}>
                  {s.description}
                </Typography>
              )}
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
              onClick: (s: WorkSchedule) => handleDeletePrompt(s.id, s.name, "schedule"),
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
                {theme.direction === "rtl" && s.nameAr ? s.nameAr : s.name}
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
              onClick: (s: WorkShift) => handleDeletePrompt(s.id, s.name, "shift"),
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
                {a.employeeName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {a.employeeCode} {a.department ? `• ${a.department}` : ""}
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
            {a.scheduleName}
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
        onClose={() => setShiftFormOpen(false)}
        onSubmit={handleSubmitShift}
      />

      <ScheduleFormDialog
        open={scheduleFormOpen}
        mode={scheduleFormMode}
        schedule={selectedSchedule}
        shifts={shifts.filter((s) => s.isActive)}
        isSubmitting={isSubmitting}
        onClose={() => setScheduleFormOpen(false)}
        onSubmit={handleSubmitSchedule}
      />

      <ScheduleDetailsDialog
        open={scheduleDetailsOpen}
        schedule={detailSchedule}
        canManage={canManage}
        onClose={() => setScheduleDetailsOpen(false)}
        onEdit={() => {
          setScheduleDetailsOpen(false);
          if (detailSchedule) handleEditSchedule(detailSchedule);
        }}
      />

      <AssignScheduleDialog
        open={assignDialogOpen}
        employees={employees}
        schedules={schedules.filter((s) => s.isActive)}
        isSubmitting={isSubmitting}
        onClose={() => setAssignDialogOpen(false)}
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
        onClose={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
      />
    </PageContainer>
  );
};

export default SchedulesView;
