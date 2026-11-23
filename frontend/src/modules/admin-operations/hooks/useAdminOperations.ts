'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { notify } from '@/shared/services/notification.service';
import { adminOperationsService } from '../services/admin-operations.service';
import { locationsService } from '@/modules/locations/services/locations.service';
import { scheduleService } from '@/modules/schedules/services/schedule.service';
import { employeeService } from '@/modules/employees/services/employee.service';
import { getPendingPasswordRequests } from '@/modules/auth/services/auth.service';
import type {
  AdminOperationsSummary,
  AttendanceRecord,
  DailyAttendanceParams,
  GpsExceptionsParams,
  IncompleteAttendanceParams,
  ManualPointAdjustmentRequest,
} from '../types';
import type { EmployeeLocationRequest } from '@/modules/locations/types';
import type { ForgotPasswordRequestDto } from '@/modules/auth/types';

export function useAdminOperations() {
  const t = useTranslations();

  // Active Tab: 0 = Daily Operations, 1 = GPS Exceptions, 2 = Incomplete Attendance, 3 = Manual Adjustments, 4 = Location Requests, 5 = Password Recovery
  const [activeTab, setActiveTab] = useState(0);

  // Summary State
  const [summary, setSummary] = useState<AdminOperationsSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Daily Attendance State
  const [dailyRecords, setDailyRecords] = useState<AttendanceRecord[]>([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyParams, setDailyParams] = useState<DailyAttendanceParams>({
    page: 1,
    pageSize: 10,
  });

  // GPS Exceptions State
  const [gpsRecords, setGpsRecords] = useState<AttendanceRecord[]>([]);
  const [gpsTotal, setGpsTotal] = useState(0);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsParams, setGpsParams] = useState<GpsExceptionsParams>({
    page: 1,
    pageSize: 10,
  });

  // Incomplete Attendance State
  const [incompleteRecords, setIncompleteRecords] = useState<AttendanceRecord[]>([]);
  const [incompleteTotal, setIncompleteTotal] = useState(0);
  const [incompleteLoading, setIncompleteLoading] = useState(false);
  const [incompleteParams, setIncompleteParams] = useState<IncompleteAttendanceParams>({
    page: 1,
    pageSize: 10,
  });

  // Location Requests State
  const [locationRequests, setLocationRequests] = useState<EmployeeLocationRequest[]>([]);
  const [locationRequestsLoading, setLocationRequestsLoading] = useState(false);

  // Password Recovery Requests State
  const [passwordRequests, setPasswordRequests] = useState<ForgotPasswordRequestDto[]>([]);
  const [passwordRequestsLoading, setPasswordRequestsLoading] = useState(false);

  // Supporting Lookups
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [shifts, setShifts] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; fullName: string; code: string }[]>([]);

  // Dialog States
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [correctDialogOpen, setCorrectDialogOpen] = useState(false);
  const [adjustPointsDialogOpen, setAdjustPointsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Load Summary
  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await adminOperationsService.getSummary();
      setSummary(res);
    } catch {
      // quiet fail
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // 2. Load Daily Attendance
  const loadDailyAttendance = useCallback(async () => {
    try {
      setDailyLoading(true);
      const res = await adminOperationsService.getDailyAttendance(dailyParams);
      setDailyRecords(res.data || res.items || []);
      setDailyTotal(res.totalCount || 0);
    } catch {
      notify.error(t('ErrorLoadingData'));
    } finally {
      setDailyLoading(false);
    }
  }, [dailyParams, t]);

  // 3. Load GPS Exceptions
  const loadGpsExceptions = useCallback(async () => {
    try {
      setGpsLoading(true);
      const res = await adminOperationsService.getGpsExceptions(gpsParams);
      setGpsRecords(res.data || res.items || []);
      setGpsTotal(res.totalCount || 0);
    } catch {
      notify.error(t('ErrorLoadingData'));
    } finally {
      setGpsLoading(false);
    }
  }, [gpsParams, t]);

  // 4. Load Incomplete Attendance
  const loadIncompleteAttendance = useCallback(async () => {
    try {
      setIncompleteLoading(true);
      const res = await adminOperationsService.getIncompleteAttendance(incompleteParams);
      setIncompleteRecords(res.data || res.items || []);
      setIncompleteTotal(res.totalCount || 0);
    } catch {
      notify.error(t('ErrorLoadingData'));
    } finally {
      setIncompleteLoading(false);
    }
  }, [incompleteParams, t]);

  // 5. Load Location Requests
  const loadLocationRequests = useCallback(async () => {
    try {
      setLocationRequestsLoading(true);
      const data = await locationsService.getPendingLocationRequests();
      setLocationRequests(data);
    } catch {
      notify.error(t('ErrorLoadingData'));
    } finally {
      setLocationRequestsLoading(false);
    }
  }, [t]);

  // 6. Load Password Recovery Requests
  const loadPasswordRequests = useCallback(async () => {
    try {
      setPasswordRequestsLoading(true);
      const data = await getPendingPasswordRequests();
      setPasswordRequests(data);
    } catch {
      notify.error(t('ErrorLoadingData'));
    } finally {
      setPasswordRequestsLoading(false);
    }
  }, [t]);

  // 7. Load Lookup Data
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [locsRes, shiftsRes, empsRes] = await Promise.all([
          locationsService.getLocations({}),
          scheduleService.getShifts({ pageSize: 100 }),
          employeeService.getEmployees({ pageSize: 200 }),
        ]);

        const locsItems = (locsRes as any)?.data || (locsRes as any)?.items || [];
        const shiftsItems = (shiftsRes as any)?.data || (shiftsRes as any)?.items || [];
        const empsItems = (empsRes as any)?.data || (empsRes as any)?.items || [];

        if (locsItems.length > 0) {
          setLocations(locsItems.map((l: any) => ({ id: l.id, name: l.name })));
        }
        if (shiftsItems.length > 0) {
          setShifts(shiftsItems.map((s: any) => ({ id: s.id, name: s.name })));
        }
        if (empsItems.length > 0) {
          setEmployees(
            empsItems.map((e: any) => ({
              id: e.id,
              fullName: `${e.firstName || ''} ${e.lastName || ''}`.trim(),
              code: e.employeeCode || '',
            }))
          );
        }
      } catch {
        // quiet lookup error
      }
    };

    fetchLookups();
    loadSummary();
    loadLocationRequests();
    loadPasswordRequests();
  }, [loadSummary, loadLocationRequests, loadPasswordRequests]);

  // Sync data on tab change or filter change
  useEffect(() => {
    if (activeTab === 0) {
      loadDailyAttendance();
    } else if (activeTab === 1) {
      loadGpsExceptions();
    } else if (activeTab === 2) {
      loadIncompleteAttendance();
    } else if (activeTab === 4) {
      loadLocationRequests();
    } else if (activeTab === 5) {
      loadPasswordRequests();
    }
  }, [activeTab, loadDailyAttendance, loadGpsExceptions, loadIncompleteAttendance, loadLocationRequests, loadPasswordRequests]);

  // Action: Approve GPS Exception
  const handleApproveGps = useCallback(async (id: string, reviewNotes?: string) => {
    try {
      setActionLoading(true);
      const updated = await adminOperationsService.approveGpsException(id, { reviewNotes });
      notify.success(t('GpsApprovalSuccess'));

      // Update in-place
      setDailyRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setGpsRecords((prev) => prev.filter((r) => r.id !== id));
      setApproveDialogOpen(false);
      setSelectedRecord(null);

      // Refresh counters
      loadSummary();
    } catch {
      notify.error(t('ErrorUpdatingRecord'));
    } finally {
      setActionLoading(false);
    }
  }, [t, loadSummary]);

  // Action: Reject GPS Exception
  const handleRejectGps = useCallback(async (id: string, reason: string) => {
    try {
      setActionLoading(true);
      const updated = await adminOperationsService.rejectGpsException(id, { reason });
      notify.success(t('GpsRejectionSuccess'));

      // Update in-place
      setDailyRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setGpsRecords((prev) => prev.filter((r) => r.id !== id));
      setRejectDialogOpen(false);
      setSelectedRecord(null);

      // Refresh counters
      loadSummary();
    } catch {
      notify.error(t('ErrorUpdatingRecord'));
    } finally {
      setActionLoading(false);
    }
  }, [t, loadSummary]);

  // Action: Correct Incomplete Attendance
  const handleCorrectIncomplete = useCallback(async (
    id: string,
    manualCheckOutTimeUtc: string,
    reason: string
  ) => {
    try {
      setActionLoading(true);
      const updated = await adminOperationsService.correctIncompleteAttendance(id, {
        manualCheckOutTimeUtc,
        reason,
      });
      notify.success(t('IncompleteCorrectionSuccess'));

      // Update in-place
      setDailyRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setIncompleteRecords((prev) => prev.filter((r) => r.id !== id));
      setCorrectDialogOpen(false);
      setSelectedRecord(null);

      // Refresh counters
      loadSummary();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      const formattedErrors = Array.isArray(serverErrors)
        ? serverErrors
            .map((e: any) =>
              typeof e === 'string' ? e : e?.description || e?.errorMessage || JSON.stringify(e)
            )
            .join(', ')
        : null;
      const msg =
        formattedErrors ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.title ||
        err.message ||
        t('ErrorUpdatingRecord');
      notify.error(msg);
    } finally {
      setActionLoading(false);
    }
  }, [t, loadSummary]);

  // Action: Manual Point Adjustment
  const handleManualPointAdjustment = useCallback(async (data: ManualPointAdjustmentRequest) => {
    try {
      setActionLoading(true);
      await adminOperationsService.manualPointAdjustment(data);
      notify.success(t('PointAdjustmentSuccess'));
      setAdjustPointsDialogOpen(false);
      loadSummary();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      const formattedErrors = Array.isArray(serverErrors)
        ? serverErrors
            .map((e: any) =>
              typeof e === 'string' ? e : e?.description || e?.errorMessage || JSON.stringify(e)
            )
            .join(', ')
        : null;
      const msg =
        formattedErrors ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.title ||
        err.message ||
        t('ErrorUpdatingRecord');
      notify.error(msg);
    } finally {
      setActionLoading(false);
    }
  }, [t, loadSummary]);

  return {
    activeTab,
    setActiveTab,
    summary,
    summaryLoading,
    dailyRecords,
    dailyTotal,
    dailyLoading,
    dailyParams,
    setDailyParams,
    gpsRecords,
    gpsTotal,
    gpsLoading,
    gpsParams,
    setGpsParams,
    incompleteRecords,
    incompleteTotal,
    incompleteLoading,
    incompleteParams,
    setIncompleteParams,
    locationRequests,
    locationRequestsLoading,
    passwordRequests,
    passwordRequestsLoading,
    locations,
    shifts,
    employees,
    approveDialogOpen,
    setApproveDialogOpen,
    rejectDialogOpen,
    setRejectDialogOpen,
    correctDialogOpen,
    setCorrectDialogOpen,
    adjustPointsDialogOpen,
    setAdjustPointsDialogOpen,
    selectedRecord,
    setSelectedRecord,
    actionLoading,
    loadSummary,
    loadDailyAttendance,
    loadGpsExceptions,
    loadIncompleteAttendance,
    loadLocationRequests,
    loadPasswordRequests,
    handleApproveGps,
    handleRejectGps,
    handleCorrectIncomplete,
    handleManualPointAdjustment,
  };
}
