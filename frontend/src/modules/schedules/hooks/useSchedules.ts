'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/store/hooks';
import { notify } from '@/shared/services/notification.service';
import { RoleNames } from '@/shared/constants/roles';
import { scheduleService } from '../services/schedule.service';
import { employeeService } from '@/modules/employees/services/employee.service';
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
} from '../types';
import type { Employee } from '@/modules/employees/types';

export function useSchedules() {
  const t = useTranslations();
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

  // Dialog States
  const [shiftFormOpen, setShiftFormOpen] = useState<boolean>(false);
  const [shiftFormMode, setShiftFormMode] = useState<'create' | 'edit'>('create');
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);

  const [scheduleFormOpen, setScheduleFormOpen] = useState<boolean>(false);
  const [scheduleFormMode, setScheduleFormMode] = useState<'create' | 'edit'>('create');
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
    type: 'schedule' | 'shift' | 'assignment';
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
      notify.error(err.message || t('ErrorOccurred'));
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
      notify.error(err.message || t('ErrorOccurred'));
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
      notify.error(err.message || t('ErrorOccurred'));
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

  const loadAll = useCallback(() => {
    loadSchedules();
    loadShifts();
    loadAssignments();
    loadEmployees();
  }, [loadSchedules, loadShifts, loadAssignments, loadEmployees]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // --- ACTIONS: SHIFTS ---
  const handleOpenCreateShift = useCallback(() => {
    setSelectedShift(null);
    setShiftFormMode('create');
    setShiftFormOpen(true);
  }, []);

  const handleOpenEditShift = useCallback((shift: WorkShift) => {
    setSelectedShift(shift);
    setShiftFormMode('edit');
    setShiftFormOpen(true);
  }, []);

  const handleCloseShiftForm = useCallback(() => {
    setShiftFormOpen(false);
    setSelectedShift(null);
  }, []);

  const handleSubmitShift = useCallback(async (data: CreateShiftRequest | UpdateShiftRequest) => {
    try {
      setIsSubmitting(true);
      if (shiftFormMode === 'create') {
        await scheduleService.createShift(data as CreateShiftRequest);
        notify.success(t('ShiftCreatedSuccess'));
      } else if (selectedShift) {
        await scheduleService.updateShift(selectedShift.id, {
          ...(data as UpdateShiftRequest),
          id: selectedShift.id,
        });
        notify.success(t('ShiftUpdatedSuccess'));
      }
      setShiftFormOpen(false);
      loadShifts();
    } catch (err: any) {
      notify.error(err.message || t('ErrorOccurred'));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [shiftFormMode, selectedShift, t, loadShifts]);

  const handleToggleShiftStatus = useCallback(async (shift: WorkShift) => {
    try {
      await scheduleService.toggleShiftStatus(shift.id);
      notify.success(
        shift.isActive ? t('ShiftDeactivatedSuccess') : t('ShiftActivatedSuccess')
      );
      loadShifts();
    } catch (err: any) {
      notify.error(err.message || t('ErrorOccurred'));
    }
  }, [t, loadShifts]);

  // --- ACTIONS: SCHEDULES ---
  const handleOpenCreateSchedule = useCallback(() => {
    setSelectedSchedule(null);
    setScheduleFormMode('create');
    setScheduleFormOpen(true);
  }, []);

  const handleOpenEditSchedule = useCallback((schedule: WorkSchedule) => {
    setSelectedSchedule(schedule);
    setScheduleFormMode('edit');
    setScheduleFormOpen(true);
  }, []);

  const handleCloseScheduleForm = useCallback(() => {
    setScheduleFormOpen(false);
    setSelectedSchedule(null);
  }, []);

  const handleOpenScheduleDetails = useCallback((schedule: WorkSchedule) => {
    setDetailSchedule(schedule);
    setScheduleDetailsOpen(true);
  }, []);

  const handleCloseScheduleDetails = useCallback(() => {
    setScheduleDetailsOpen(false);
    setDetailSchedule(null);
  }, []);

  const handleSubmitSchedule = useCallback(async (data: CreateScheduleRequest | UpdateScheduleRequest) => {
    try {
      setIsSubmitting(true);
      if (scheduleFormMode === 'create') {
        await scheduleService.createSchedule(data as CreateScheduleRequest);
        notify.success(t('ScheduleCreatedSuccess'));
      } else if (selectedSchedule) {
        await scheduleService.updateSchedule(selectedSchedule.id, {
          ...(data as UpdateScheduleRequest),
          id: selectedSchedule.id,
        });
        notify.success(t('ScheduleUpdatedSuccess'));
      }
      setScheduleFormOpen(false);
      loadSchedules();
    } catch (err: any) {
      notify.error(err.message || t('ErrorOccurred'));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [scheduleFormMode, selectedSchedule, t, loadSchedules]);

  const handleToggleScheduleStatus = useCallback(async (schedule: WorkSchedule) => {
    try {
      await scheduleService.toggleScheduleStatus(schedule.id);
      notify.success(
        schedule.isActive ? t('ScheduleDeactivatedSuccess') : t('ScheduleActivatedSuccess')
      );
      loadSchedules();
    } catch (err: any) {
      notify.error(err.message || t('ErrorOccurred'));
    }
  }, [t, loadSchedules]);

  // --- ACTIONS: ASSIGNMENTS ---
  const handleOpenAssignDialog = useCallback(() => {
    setAssignDialogOpen(true);
  }, []);

  const handleCloseAssignDialog = useCallback(() => {
    setAssignDialogOpen(false);
  }, []);

  const handleSubmitAssignment = useCallback(async (data: AssignEmployeeScheduleRequest) => {
    try {
      setIsSubmitting(true);
      await scheduleService.assignSchedule(data);
      notify.success(t('ScheduleAssignedSuccess'));
      setAssignDialogOpen(false);
      loadAssignments();
      loadSchedules();
    } catch (err: any) {
      notify.error(err.message || t('ErrorOccurred'));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [t, loadAssignments, loadSchedules]);

  // --- GENERIC DELETION ---
  const handleOpenDeletePrompt = useCallback((id: string, name: string, type: 'schedule' | 'shift' | 'assignment') => {
    setItemToDelete({ id, name, type });
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDeletePrompt = useCallback(() => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      setIsSubmitting(true);
      if (itemToDelete.type === 'schedule') {
        await scheduleService.deleteSchedule(itemToDelete.id);
        notify.success(t('ScheduleDeletedSuccess'));
        loadSchedules();
      } else if (itemToDelete.type === 'shift') {
        await scheduleService.deleteShift(itemToDelete.id);
        notify.success(t('ShiftDeletedSuccess'));
        loadShifts();
      } else if (itemToDelete.type === 'assignment') {
        await scheduleService.deleteAssignment(itemToDelete.id);
        notify.success(t('AssignmentDeletedSuccess'));
        loadAssignments();
        loadSchedules();
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      notify.error(err.message || t('ErrorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  }, [itemToDelete, t, loadSchedules, loadShifts, loadAssignments]);

  return {
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
    loadEmployees,
    loadAll,
    openCreateShift: handleOpenCreateShift,
    openEditShift: handleOpenEditShift,
    closeShiftForm: handleCloseShiftForm,
    submitShift: handleSubmitShift,
    toggleShiftStatus: handleToggleShiftStatus,
    openCreateSchedule: handleOpenCreateSchedule,
    openEditSchedule: handleOpenEditSchedule,
    closeScheduleForm: handleCloseScheduleForm,
    openScheduleDetails: handleOpenScheduleDetails,
    closeScheduleDetails: handleCloseScheduleDetails,
    submitSchedule: handleSubmitSchedule,
    toggleScheduleStatus: handleToggleScheduleStatus,
    openAssignDialog: handleOpenAssignDialog,
    closeAssignDialog: handleCloseAssignDialog,
    submitAssignment: handleSubmitAssignment,
    openDeletePrompt: handleOpenDeletePrompt,
    closeDeletePrompt: handleCloseDeletePrompt,
    confirmDelete: handleConfirmDelete,
  };
}
