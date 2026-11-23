'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { RoleNames } from '@/shared/constants/roles';
import { leavesService } from '../services/leaves.service';
import {
  setMyRequests,
  setApprovals,
  setLeaveTypes,
  setSummary,
  addMyRequest,
  updateRequestInState,
  upsertLeaveType,
  setActionLoading,
} from '../slices/leaves.slice';
import type {
  LeaveRequest,
  LeaveType,
  SubmitLeaveRequestData,
  CreateLeaveTypeRequest,
  UpdateLeaveTypeRequest,
} from '../types';

export function useLeaves() {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const roles = useAppSelector((state) => state.auth.roles) || [];
  const authUser = useAppSelector((state) => state.auth.user);
  const currentEmployeeId = authUser?.employeeId;
  const isPrivileged = useMemo(
    () => roles.some((r) => [RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Supervisor].includes(r as any)),
    [roles]
  );
  const isAdmin = useMemo(
    () => roles.some((r) => [RoleNames.SuperAdmin, RoleNames.Admin].includes(r as any)),
    [roles]
  );

  const {
    myRequests,
    myTotalCount,
    approvals,
    approvalsTotalCount,
    leaveTypes,
    summary,
    actionLoading,
  } = useAppSelector((state) => state.leaves);

  const isMyRequest = useCallback((row: LeaveRequest): boolean => {
    if (!row) return false;
    if (row.canReview === false && row.canCancel === true) {
      return true;
    }
    if (currentEmployeeId && row.employeeId) {
      if (row.employeeId.toLowerCase() === currentEmployeeId.toLowerCase()) return true;
    }
    if (authUser?.employeeCode && row.employeeCode) {
      if (row.employeeCode.toLowerCase() === authUser.employeeCode.toLowerCase()) return true;
    }
    if (authUser?.fullName && row.employeeName) {
      if (row.employeeName.toLowerCase() === authUser.fullName.toLowerCase()) return true;
    }
    if (authUser?.fullNameAr && row.employeeNameAr) {
      if (row.employeeNameAr.toLowerCase() === authUser.fullNameAr.toLowerCase()) return true;
    }
    if (authUser?.fullName && row.employeeNameAr) {
      if (row.employeeNameAr.toLowerCase() === authUser.fullName.toLowerCase()) return true;
    }
    if (authUser?.fullNameAr && row.employeeName) {
      if (row.employeeName.toLowerCase() === authUser.fullNameAr.toLowerCase()) return true;
    }
    if (authUser?.email && row.employeeName) {
      const emailPrefix = authUser.email.split('@')[0].toLowerCase();
      const normEmpName = row.employeeName.toLowerCase();
      if (normEmpName.includes(emailPrefix) || emailPrefix.includes(normEmpName)) return true;
    }
    if (myRequests && myRequests.some((m) => m.id === row.id)) {
      return true;
    }
    if (
      row.employeeCode === 'EMP-SUPER01' &&
      roles.some((r) => r.toLowerCase().includes('superadmin'))
    ) {
      return true;
    }
    return false;
  }, [currentEmployeeId, authUser, myRequests, roles]);

  const [activeTab, setActiveTab] = useState<number>(0);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [loadingMyRequests, setLoadingMyRequests] = useState<boolean>(false);
  const [loadingApprovals, setLoadingApprovals] = useState<boolean>(false);
  const [loadingTypes, setLoadingTypes] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [myPage, setMyPage] = useState<number>(1);
  const [approvalsPage, setApprovalsPage] = useState<number>(1);
  const pageSize = 10;

  // Dialogs state
  const [requestFormOpen, setRequestFormOpen] = useState<boolean>(false);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  // Review Dialog (Approve / Reject)
  const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);
  const [reviewMode, setReviewMode] = useState<'approve' | 'reject'>('approve');
  const [requestToReview, setRequestToReview] = useState<LeaveRequest | null>(null);

  // Cancel Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [requestToCancel, setRequestToCancel] = useState<LeaveRequest | null>(null);

  // Leave Type Dialog
  const [typeFormOpen, setTypeFormOpen] = useState<boolean>(false);
  const [typeFormMode, setTypeFormMode] = useState<'create' | 'edit'>('create');
  const [selectedType, setSelectedType] = useState<LeaveType | null>(null);

  // Load Data
  const loadSummaryData = useCallback(async () => {
    try {
      const data = await leavesService.getSummary();
      dispatch(setSummary(data));
    } catch {
      // Non-blocking
    } finally {
      setLoadingSummary(false);
    }
  }, [dispatch]);

  const loadLeaveTypesData = useCallback(async () => {
    setLoadingTypes(true);
    try {
      const types = await leavesService.getLeaveTypes(false);
      dispatch(setLeaveTypes(types));
    } catch {
      // Non-blocking
    } finally {
      setLoadingTypes(false);
    }
  }, [dispatch]);

  const loadMyRequestsData = useCallback(async (page: number) => {
    setLoadingMyRequests(true);
    try {
      const result = await leavesService.getMyRequests({ page, pageSize });
      const items = result?.data || result?.items || [];
      dispatch(setMyRequests({ items, totalCount: result?.totalCount || 0 }));
    } catch {
      // Handled
    } finally {
      setLoadingMyRequests(false);
    }
  }, [dispatch, pageSize]);

  const loadApprovalsData = useCallback(async (page: number) => {
    if (!isPrivileged) return;
    setLoadingApprovals(true);
    try {
      const result = await leavesService.getRequests({ page, pageSize });
      const items = result?.data || result?.items || [];
      dispatch(setApprovals({ items, totalCount: result?.totalCount || 0 }));
    } catch {
      // Handled
    } finally {
      setLoadingApprovals(false);
    }
  }, [dispatch, isPrivileged, pageSize]);

  useEffect(() => {
    loadSummaryData();
    loadLeaveTypesData();
    loadMyRequestsData(myPage);
    if (isPrivileged) {
      loadApprovalsData(approvalsPage);
    }
  }, [loadSummaryData, loadLeaveTypesData, loadMyRequestsData, loadApprovalsData, myPage, approvalsPage, isPrivileged]);

  // Handlers for My Requests
  const handleSubmitRequest = useCallback(async (data: SubmitLeaveRequestData) => {
    dispatch(setActionLoading(true));
    try {
      const newRequest = await leavesService.submitRequest(data);
      dispatch(addMyRequest(newRequest));
      setFeedback({ type: 'success', message: t('LeaveRequestSubmittedSuccess') });
      loadSummaryData();
    } finally {
      dispatch(setActionLoading(false));
    }
  }, [dispatch, t, loadSummaryData]);

  const handleConfirmCancel = useCallback(async () => {
    if (!requestToCancel) return;
    dispatch(setActionLoading(true));
    try {
      const updated = await leavesService.cancelRequest(requestToCancel.id);
      dispatch(updateRequestInState(updated));
      setFeedback({ type: 'success', message: t('LeaveRequestCancelledSuccess') });
      loadSummaryData();
      setCancelDialogOpen(false);
      setRequestToCancel(null);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || t('ErrorCancellingLeaveRequest'),
      });
    } finally {
      dispatch(setActionLoading(false));
    }
  }, [dispatch, requestToCancel, t, loadSummaryData]);

  // Handlers for Reviews (Supervisor / Admin)
  const handleApprove = useCallback(async (id: string, notes?: string) => {
    dispatch(setActionLoading(true));
    try {
      const updated = await leavesService.approveRequest(id, notes);
      dispatch(updateRequestInState(updated));
      setFeedback({ type: 'success', message: t('LeaveRequestApprovedSuccess') });
      loadSummaryData();
    } finally {
      dispatch(setActionLoading(false));
    }
  }, [dispatch, t, loadSummaryData]);

  const handleReject = useCallback(async (id: string, reason: string) => {
    dispatch(setActionLoading(true));
    try {
      const updated = await leavesService.rejectRequest(id, reason);
      dispatch(updateRequestInState(updated));
      setFeedback({ type: 'success', message: t('LeaveRequestRejectedSuccess') });
      loadSummaryData();
    } finally {
      dispatch(setActionLoading(false));
    }
  }, [dispatch, t, loadSummaryData]);

  // Handlers for Leave Types (Admin)
  const handleCreateType = useCallback(async (data: CreateLeaveTypeRequest) => {
    dispatch(setActionLoading(true));
    try {
      const created = await leavesService.createLeaveType(data);
      dispatch(upsertLeaveType(created));
      setFeedback({ type: 'success', message: t('LeaveTypeCreatedSuccess') });
    } finally {
      dispatch(setActionLoading(false));
    }
  }, [dispatch, t]);

  const handleUpdateType = useCallback(async (id: string, data: UpdateLeaveTypeRequest) => {
    dispatch(setActionLoading(true));
    try {
      const updated = await leavesService.updateLeaveType(id, data);
      dispatch(upsertLeaveType(updated));
      setFeedback({ type: 'success', message: t('LeaveTypeUpdatedSuccess') });
    } finally {
      dispatch(setActionLoading(false));
    }
  }, [dispatch, t]);

  const handleToggleTypeStatus = useCallback(async (type: LeaveType) => {
    try {
      const updated = await leavesService.toggleLeaveTypeStatus(type.id);
      dispatch(upsertLeaveType(updated));
      setFeedback({ type: 'success', message: t('LeaveTypeStatusUpdatedSuccess') });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || t('ErrorUpdatingLeaveTypeStatus'),
      });
    }
  }, [dispatch, t]);

  // Dialog openers & closers
  const handleOpenRequestForm = useCallback(() => {
    setRequestFormOpen(true);
  }, []);

  const handleCloseRequestForm = useCallback(() => {
    setRequestFormOpen(false);
  }, []);

  const handleOpenDetails = useCallback((req: LeaveRequest) => {
    setSelectedRequest(req);
    setDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedRequest(null);
  }, []);

  const handleOpenApprove = useCallback((req: LeaveRequest) => {
    setRequestToReview(req);
    setReviewMode('approve');
    setReviewDialogOpen(true);
  }, []);

  const handleOpenReject = useCallback((req: LeaveRequest) => {
    setRequestToReview(req);
    setReviewMode('reject');
    setReviewDialogOpen(true);
  }, []);

  const handleCloseReview = useCallback(() => {
    setReviewDialogOpen(false);
    setRequestToReview(null);
  }, []);

  const handleOpenCancel = useCallback((req: LeaveRequest) => {
    setRequestToCancel(req);
    setCancelDialogOpen(true);
  }, []);

  const handleCloseCancel = useCallback(() => {
    setCancelDialogOpen(false);
    setRequestToCancel(null);
  }, []);

  const handleOpenCreateType = useCallback(() => {
    setSelectedType(null);
    setTypeFormMode('create');
    setTypeFormOpen(true);
  }, []);

  const handleOpenEditType = useCallback((lt: LeaveType) => {
    setSelectedType(lt);
    setTypeFormMode('edit');
    setTypeFormOpen(true);
  }, []);

  const handleCloseTypeForm = useCallback(() => {
    setTypeFormOpen(false);
    setSelectedType(null);
  }, []);

  return {
    isPrivileged,
    isAdmin,
    isMyRequest,
    activeTab,
    setActiveTab,
    myRequests,
    myTotalCount,
    approvals,
    approvalsTotalCount,
    leaveTypes,
    summary,
    actionLoading,
    loadingSummary,
    loadingMyRequests,
    loadingApprovals,
    loadingTypes,
    feedback,
    setFeedback,
    myPage,
    setMyPage,
    approvalsPage,
    setApprovalsPage,
    pageSize,
    requestFormOpen,
    detailsOpen,
    selectedRequest,
    reviewDialogOpen,
    reviewMode,
    requestToReview,
    cancelDialogOpen,
    requestToCancel,
    typeFormOpen,
    typeFormMode,
    selectedType,
    loadSummaryData,
    loadLeaveTypesData,
    loadMyRequestsData,
    loadApprovalsData,
    openRequestForm: handleOpenRequestForm,
    closeRequestForm: handleCloseRequestForm,
    openDetails: handleOpenDetails,
    closeDetails: handleCloseDetails,
    openApprove: handleOpenApprove,
    openReject: handleOpenReject,
    closeReview: handleCloseReview,
    openCancel: handleOpenCancel,
    closeCancel: handleCloseCancel,
    openCreateType: handleOpenCreateType,
    openEditType: handleOpenEditType,
    closeTypeForm: handleCloseTypeForm,
    submitRequest: handleSubmitRequest,
    confirmCancel: handleConfirmCancel,
    approveRequest: handleApprove,
    rejectRequest: handleReject,
    createType: handleCreateType,
    updateType: handleUpdateType,
    toggleTypeStatus: handleToggleTypeStatus,
  };
}
