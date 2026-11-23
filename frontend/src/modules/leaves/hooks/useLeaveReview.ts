'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/store/hooks';
import type { LeaveRequest } from '../types';

interface UseLeaveReviewProps {
  open: boolean;
  leaveRequest: LeaveRequest | null;
  mode: 'approve' | 'reject';
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onClose: () => void;
  isRtl?: boolean;
}

export function useLeaveReview({
  open,
  leaveRequest,
  mode,
  onApprove,
  onReject,
  onClose,
  isRtl = false,
}: UseLeaveReviewProps) {
  const t = useTranslations();
  const authUser = useAppSelector((state) => state.auth.user);
  const roles = useAppSelector((state) => state.auth.roles) || [];

  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNotes('');
      setErrorMsg(null);
    }
  }, [open]);

  const isOwnRequest = useMemo(() => {
    if (!leaveRequest) return false;
    return Boolean(
      leaveRequest.canReview === false ||
        (authUser &&
          ((authUser.employeeId &&
            leaveRequest.employeeId &&
            authUser.employeeId.toLowerCase() === leaveRequest.employeeId.toLowerCase()) ||
            (authUser.employeeCode &&
              leaveRequest.employeeCode &&
              authUser.employeeCode.toLowerCase() === leaveRequest.employeeCode.toLowerCase()) ||
            (authUser.fullName &&
              leaveRequest.employeeName &&
              authUser.fullName.toLowerCase() === leaveRequest.employeeName.toLowerCase()) ||
            (authUser.fullNameAr &&
              leaveRequest.employeeNameAr &&
              authUser.fullNameAr.toLowerCase() === leaveRequest.employeeNameAr.toLowerCase()) ||
            (authUser.fullName &&
              leaveRequest.employeeNameAr &&
              authUser.fullName.toLowerCase() === leaveRequest.employeeNameAr.toLowerCase()) ||
            (authUser.fullNameAr &&
              leaveRequest.employeeName &&
              authUser.fullNameAr.toLowerCase() === leaveRequest.employeeName.toLowerCase()) ||
            (authUser.email &&
              leaveRequest.employeeName &&
              authUser.email.toLowerCase().includes(leaveRequest.employeeName.toLowerCase())) ||
            (authUser.email &&
              authUser.email.split('@')[0].toLowerCase() === leaveRequest.employeeName.toLowerCase()) ||
            (leaveRequest.employeeCode === 'EMP-SUPER01' &&
              (roles.some((r) => r.toLowerCase().includes('superadmin')) ||
                authUser.email?.includes('superadmin')))))
    );
  }, [leaveRequest, authUser, roles]);

  const localizeErrorMessage = useCallback((msg: string | null | undefined): string => {
    if (!msg) return t('ErrorReviewingLeaveRequest');
    const lower = msg.toLowerCase();
    if (
      lower.includes('cannot reject your own leave request') ||
      lower.includes('reject your own') ||
      lower.includes('cannot reject own') ||
      lower.includes('لا يمكنك رفض طلب الإجازة') ||
      msg.includes('لا يمكنك رفض طلب الإجازة')
    ) {
      return isRtl
        ? 'لا يمكنك رفض طلب الإجازة الخاص بك. يرجى استخدام خيار الإلغاء بدلاً من ذلك.'
        : 'You cannot reject your own leave request. Use cancel instead.';
    }
    if (
      lower.includes('cannot approve your own leave request') ||
      lower.includes('approve your own') ||
      lower.includes('cannot approve own') ||
      lower.includes('لا يمكنك اعتماد طلب الإجازة') ||
      msg.includes('لا يمكنك اعتماد طلب الإجازة')
    ) {
      return isRtl
        ? 'لا يمكنك اعتماد طلب الإجازة الخاص بك.'
        : 'You cannot approve your own leave request.';
    }
    if (lower.includes('not found') || msg.includes('غير موجود')) {
      return isRtl ? 'طلب الإجازة غير موجود.' : 'Leave request not found.';
    }
    if (
      lower.includes('only pending requests can be rejected') ||
      lower.includes('only pending requests') ||
      lower.includes('cannot reject a request with status') ||
      lower.includes('cannot approve a request with status')
    ) {
      return isRtl
        ? 'لا يمكن مراجعة هذا الطلب لأنه ليس في حالة قيد الانتظار.'
        : 'This request cannot be reviewed because it is not in pending status.';
    }
    return msg;
  }, [isRtl, t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!leaveRequest) return;

    if (mode === 'reject' && !notes.trim()) {
      setErrorMsg(t('RejectionReasonRequired'));
      return;
    }

    try {
      if (mode === 'approve') {
        await onApprove(leaveRequest.id, notes.trim() || undefined);
      } else {
        await onReject(leaveRequest.id, notes.trim());
      }
      onClose();
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.message;
      setErrorMsg(localizeErrorMessage(serverMessage));
    }
  }, [leaveRequest, mode, notes, onApprove, onReject, onClose, localizeErrorMessage, t]);

  return {
    notes,
    setNotes,
    errorMsg,
    setErrorMsg,
    isOwnRequest,
    localizeErrorMessage,
    handleSubmit,
  };
}
