'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { LeaveType, CreateLeaveTypeRequest, UpdateLeaveTypeRequest } from '../types';

interface UseLeaveTypeFormProps {
  open: boolean;
  leaveType: LeaveType | null;
  mode: 'create' | 'edit';
  onSubmitCreate: (data: CreateLeaveTypeRequest) => Promise<void>;
  onSubmitUpdate: (id: string, data: UpdateLeaveTypeRequest) => Promise<void>;
  onClose: () => void;
}

export function useLeaveTypeForm({
  open,
  leaveType,
  mode,
  onSubmitCreate,
  onSubmitUpdate,
  onClose,
}: UseLeaveTypeFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale.startsWith('ar');
  const isEdit = mode === 'edit';

  const [name, setName] = useState<string>('');
  const [nameAr, setNameAr] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');
  const [descriptionEn, setDescriptionEn] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [requiresAttachment, setRequiresAttachment] = useState<boolean>(false);
  const [defaultDaysPerYear, setDefaultDaysPerYear] = useState<string>('');
  const [showSecondaryLanguage, setShowSecondaryLanguage] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (isEdit && leaveType) {
        const enName = leaveType.nameEn || leaveType.name || '';
        const arName = leaveType.nameAr || '';
        const enDesc = leaveType.descriptionEn || leaveType.description || '';
        const arDesc = leaveType.descriptionAr || '';

        setName(enName);
        setNameEn(enName);
        setNameAr(arName);
        setCode(leaveType.code || '');
        setDescription(enDesc);
        setDescriptionEn(enDesc);
        setDescriptionAr(arDesc);
        setIsPaid(leaveType.isPaid);
        setRequiresAttachment(leaveType.requiresAttachment);
        setDefaultDaysPerYear(
          leaveType.defaultDaysPerYear !== null && leaveType.defaultDaysPerYear !== undefined
            ? String(leaveType.defaultDaysPerYear)
            : ''
        );

        setShowSecondaryLanguage(isAr ? Boolean(enName || enDesc) : Boolean(arName || arDesc));
      } else {
        setName('');
        setNameAr('');
        setNameEn('');
        setCode('');
        setDescription('');
        setDescriptionAr('');
        setDescriptionEn('');
        setIsPaid(true);
        setRequiresAttachment(false);
        setDefaultDaysPerYear('');
        setShowSecondaryLanguage(false);
      }
      setErrorMsg(null);
    }
  }, [open, isEdit, leaveType, isAr]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const enName = (nameEn || name).trim();
    const arNameVal = nameAr.trim();

    if (isAr) {
      if (!arNameVal) {
        setErrorMsg(t('ArabicNameRequired') || 'اسم الإجازة بالعربية مطلوب');
        return;
      }
    } else {
      if (!enName) {
        setErrorMsg(t('NameRequired') || 'Leave type name is required');
        return;
      }
    }

    if (!isEdit && !code.trim()) {
      setErrorMsg(t('CodeRequired') || 'Code is required');
      return;
    }

    const days = defaultDaysPerYear.trim() ? parseInt(defaultDaysPerYear, 10) : null;
    const primaryName = isAr ? (arNameVal || enName) : (enName || arNameVal);
    const enDesc = (descriptionEn || description).trim();
    const arDesc = descriptionAr.trim();

    try {
      if (isEdit && leaveType) {
        await onSubmitUpdate(leaveType.id, {
          name: enName || primaryName,
          nameEn: enName || null,
          nameAr: arNameVal || null,
          description: enDesc || null,
          descriptionEn: enDesc || null,
          descriptionAr: arDesc || null,
          isPaid,
          requiresAttachment,
          defaultDaysPerYear: days,
        });
      } else {
        await onSubmitCreate({
          name: enName || primaryName,
          nameEn: enName || null,
          nameAr: arNameVal || null,
          code: code.trim().toUpperCase(),
          description: enDesc || null,
          descriptionEn: enDesc || null,
          descriptionAr: arDesc || null,
          isPaid,
          requiresAttachment,
          defaultDaysPerYear: days,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || t('ErrorSavingLeaveType'));
    }
  }, [
    name,
    nameAr,
    nameEn,
    description,
    descriptionAr,
    descriptionEn,
    isAr,
    isEdit,
    code,
    defaultDaysPerYear,
    isPaid,
    requiresAttachment,
    leaveType,
    onSubmitUpdate,
    onSubmitCreate,
    onClose,
    t,
  ]);

  return {
    name,
    setName,
    nameAr,
    setNameAr,
    nameEn,
    setNameEn,
    code,
    setCode,
    description,
    setDescription,
    descriptionAr,
    setDescriptionAr,
    descriptionEn,
    setDescriptionEn,
    isPaid,
    setIsPaid,
    requiresAttachment,
    setRequiresAttachment,
    defaultDaysPerYear,
    setDefaultDaysPerYear,
    showSecondaryLanguage,
    setShowSecondaryLanguage,
    isAr,
    errorMsg,
    setErrorMsg,
    handleSubmit,
  };
}
