'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { LeaveType, SubmitLeaveRequestData } from '../types';

interface UseLeaveRequestFormProps {
  open: boolean;
  leaveTypes: LeaveType[];
  onSubmit: (data: SubmitLeaveRequestData) => Promise<void>;
  onClose: () => void;
}

export function useLeaveRequestForm({ open, leaveTypes, onSubmit, onClose }: UseLeaveRequestFormProps) {
  const t = useTranslations();

  const [leaveTypeId, setLeaveTypeId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedType = leaveTypes.find((lt) => lt.id === leaveTypeId);

  useEffect(() => {
    if (open) {
      setLeaveTypeId(leaveTypes[0]?.id || '');
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
      setReason('');
      setAttachment(null);
      setErrorMsg(null);
    }
  }, [open, leaveTypes]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(t('FileSizeLimit10MB'));
        return;
      }
      setAttachment(file);
      setErrorMsg(null);
    }
  }, [t]);

  const handleRemoveFile = useCallback(() => {
    setAttachment(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!leaveTypeId) {
      setErrorMsg(t('LeaveTypeRequired'));
      return;
    }

    if (!startDate) {
      setErrorMsg(t('StartDateRequired'));
      return;
    }

    if (!endDate) {
      setErrorMsg(t('EndDateRequired'));
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMsg(t('InvalidDateRange'));
      return;
    }

    if (selectedType?.requiresAttachment && !attachment) {
      setErrorMsg(t('AttachmentRequired'));
      return;
    }

    try {
      await onSubmit({
        leaveTypeId,
        startDate,
        endDate,
        reason: reason.trim() || undefined,
        attachment,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || t('ErrorSubmittingLeaveRequest'));
    }
  }, [leaveTypeId, startDate, endDate, reason, attachment, selectedType, onSubmit, onClose, t]);

  return {
    leaveTypeId,
    setLeaveTypeId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    reason,
    setReason,
    attachment,
    errorMsg,
    setErrorMsg,
    selectedType,
    handleFileChange,
    handleRemoveFile,
    handleSubmit,
  };
}
