'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/store/hooks';
import { RoleNames } from '@/shared/constants/roles';
import { attendanceService } from '../services/attendance.service';
import type { CurrentAttendanceStatus, AttendanceRecord, CheckInRequest, CheckOutRequest } from '../types';

export function useAttendance() {
  const t = useTranslations();
  const roles = useAppSelector((state) => state.auth.roles) || [];
  const isPrivileged = roles.some((r) =>
    [RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Supervisor].includes(r as any)
  );

  const [activeTab, setActiveTab] = useState<number>(0);
  const [status, setStatus] = useState<CurrentAttendanceStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(true);

  // My History state
  const [myRecords, setMyRecords] = useState<AttendanceRecord[]>([]);
  const [myTotalCount, setMyTotalCount] = useState<number>(0);
  const [myPage, setMyPage] = useState<number>(1);
  const [myPageSize] = useState<number>(10);
  const [myLoading, setMyLoading] = useState<boolean>(false);

  // Org/Team Records state
  const [orgRecords, setOrgRecords] = useState<AttendanceRecord[]>([]);
  const [orgTotalCount, setOrgTotalCount] = useState<number>(0);
  const [orgPage, setOrgPage] = useState<number>(1);
  const [orgPageSize] = useState<number>(10);
  const [orgLoading, setOrgLoading] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await attendanceService.getStatus();
      setStatus(res);
    } catch {
      // Ignore initial error
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const loadMyHistory = useCallback(async (p: number) => {
    setMyLoading(true);
    try {
      const res = await attendanceService.getMyHistory({ page: p, pageSize: myPageSize });
      setMyRecords(res.data ?? []);
      setMyTotalCount(res.totalCount ?? 0);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || t('ErrorLoadingAttendanceHistory') });
    } finally {
      setMyLoading(false);
    }
  }, [myPageSize, t]);

  const loadOrgRecords = useCallback(async (p: number) => {
    setOrgLoading(true);
    try {
      const res = await attendanceService.getRecords({ page: p, pageSize: orgPageSize });
      setOrgRecords(res.data ?? []);
      setOrgTotalCount(res.totalCount ?? 0);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || t('ErrorLoadingAttendanceRecords') });
    } finally {
      setOrgLoading(false);
    }
  }, [orgPageSize, t]);

  useEffect(() => {
    loadStatus();
    loadMyHistory(1);
    if (isPrivileged) {
      loadOrgRecords(1);
    }
  }, [loadStatus, loadMyHistory, loadOrgRecords, isPrivileged]);

  const handlePageChangeMy = useCallback((p: number) => {
    setMyPage(p);
    loadMyHistory(p);
  }, [loadMyHistory]);

  const handlePageChangeOrg = useCallback((p: number) => {
    setOrgPage(p);
    loadOrgRecords(p);
  }, [loadOrgRecords]);

  const handleCheckIn = useCallback(async (req: CheckInRequest) => {
    setFeedback(null);
    const rec = await attendanceService.checkIn(req);
    setFeedback({
      type: 'success',
      message: rec.checkInStatus === 'Verified'
        ? t('CheckInSuccessVerified')
        : t('CheckInSuccessPendingReview'),
    });
    await loadStatus();
    await loadMyHistory(1);
    if (isPrivileged) await loadOrgRecords(1);
  }, [t, loadStatus, loadMyHistory, loadOrgRecords, isPrivileged]);

  const handleCheckOut = useCallback(async (req: CheckOutRequest) => {
    setFeedback(null);
    const rec = await attendanceService.checkOut(req);
    setFeedback({
      type: 'success',
      message: `${t('CheckOutSuccess')}${rec?.durationHours != null ? ` (${rec.durationHours.toFixed(1)} ${t('HoursAbbr')})` : ''}`,
    });
    await loadStatus();
    await loadMyHistory(1);
    if (isPrivileged) await loadOrgRecords(1);
  }, [t, loadStatus, loadMyHistory, loadOrgRecords, isPrivileged]);

  return {
    isPrivileged,
    activeTab,
    setActiveTab,
    status,
    statusLoading,
    myRecords,
    myTotalCount,
    myPage,
    myPageSize,
    myLoading,
    orgRecords,
    orgTotalCount,
    orgPage,
    orgPageSize,
    orgLoading,
    feedback,
    setFeedback,
    loadStatus,
    loadMyHistory: handlePageChangeMy,
    loadOrgRecords: handlePageChangeOrg,
    handleCheckIn,
    handleCheckOut,
  };
}
