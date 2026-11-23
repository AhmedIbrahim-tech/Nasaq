'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { WorkShift, CreateShiftRequest, UpdateShiftRequest } from '../types';

interface UseShiftFormProps {
  mode: 'create' | 'edit';
  shift: WorkShift | null;
  open: boolean;
  onSubmit: (data: CreateShiftRequest | UpdateShiftRequest) => Promise<void>;
}

export function useShiftForm({ mode, shift, open, onSubmit }: UseShiftFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale.startsWith('ar');

  const [formData, setFormData] = useState<{
    name: string;
    nameAr: string;
    nameEn: string;
    startTime: string;
    endTime: string;
    isOvernight: boolean;
    earlyStartTime: string;
    onTimeStartTime: string;
    lateStartTime: string;
    cutoffTime: string;
    notes: string;
    isActive: boolean;
  }>({
    name: '',
    nameAr: '',
    nameEn: '',
    startTime: '09:00',
    endTime: '17:00',
    isOvernight: false,
    earlyStartTime: '07:30',
    onTimeStartTime: '09:00',
    lateStartTime: '09:30',
    cutoffTime: '12:00',
    notes: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSecondaryLanguage, setShowSecondaryLanguage] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && shift) {
      const enName = shift.nameEn || shift.name || '';
      const arName = shift.nameAr || '';

      setFormData({
        name: enName,
        nameEn: enName,
        nameAr: arName,
        startTime: shift.startTime?.substring(0, 5) || '09:00',
        endTime: shift.endTime?.substring(0, 5) || '17:00',
        isOvernight: shift.isOvernight ?? false,
        earlyStartTime: shift.earlyStartTime?.substring(0, 5) || '',
        onTimeStartTime: shift.onTimeStartTime?.substring(0, 5) || '',
        lateStartTime: shift.lateStartTime?.substring(0, 5) || '',
        cutoffTime: shift.cutoffTime?.substring(0, 5) || '',
        notes: shift.notes || '',
        isActive: shift.isActive ?? true,
      });

      setShowSecondaryLanguage(isAr ? Boolean(enName) : Boolean(arName));
    } else {
      setFormData({
        name: '',
        nameAr: '',
        nameEn: '',
        startTime: '09:00',
        endTime: '17:00',
        isOvernight: false,
        earlyStartTime: '07:30',
        onTimeStartTime: '09:00',
        lateStartTime: '09:30',
        cutoffTime: '12:00',
        notes: '',
        isActive: true,
      });
      setShowSecondaryLanguage(false);
    }
    setErrors({});
  }, [mode, shift, open, isAr]);

  // Compute overnight state & estimated duration
  const isAutoOvernight = useMemo(
    () => formData.endTime <= formData.startTime && formData.startTime !== '' && formData.endTime !== '',
    [formData.startTime, formData.endTime]
  );

  const effectiveOvernight = useMemo(
    () => formData.isOvernight || isAutoOvernight,
    [formData.isOvernight, isAutoOvernight]
  );

  const durationHours = useMemo((): number => {
    if (!formData.startTime || !formData.endTime || formData.startTime === formData.endTime) return 0;
    const [sH, sM] = formData.startTime.split(':').map(Number);
    const [eH, eM] = formData.endTime.split(':').map(Number);
    const startMins = sH * 60 + sM;
    const endMins = eH * 60 + eM;

    if (effectiveOvernight) {
      return (24 * 60 - startMins + endMins) / 60;
    }
    return (endMins - startMins) / 60;
  }, [formData.startTime, formData.endTime, effectiveOvernight]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (isAr) {
      if (!formData.nameAr.trim()) {
        newErrors.nameAr = t('ShiftNameRequired');
      } else if (formData.nameAr.length > 150) {
        newErrors.nameAr = t('ShiftNameMaxLength');
      }
    } else {
      const en = (formData.nameEn || formData.name).trim();
      if (!en) {
        newErrors.nameEn = t('ShiftNameRequired');
      } else if (en.length > 150) {
        newErrors.nameEn = t('ShiftNameMaxLength');
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = t('StartTimeRequired');
    }

    if (!formData.endTime) {
      newErrors.endTime = t('EndTimeRequired');
    }

    if (formData.startTime && formData.endTime && formData.startTime === formData.endTime) {
      newErrors.endTime = t('StartAndEndSameError');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isAr, t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const enName = formData.nameEn.trim() || formData.name.trim();
    const arName = formData.nameAr.trim();
    const primaryName = isAr ? (arName || enName) : (enName || arName);

    const payload: CreateShiftRequest | UpdateShiftRequest = {
      ...(mode === 'edit' && shift ? { id: shift.id } : {}),
      name: enName || primaryName,
      nameEn: enName || null,
      nameAr: arName || null,
      startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
      endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
      isOvernight: effectiveOvernight,
      earlyStartTime: formData.earlyStartTime
        ? formData.earlyStartTime.length === 5
          ? `${formData.earlyStartTime}:00`
          : formData.earlyStartTime
        : undefined,
      onTimeStartTime: formData.onTimeStartTime
        ? formData.onTimeStartTime.length === 5
          ? `${formData.onTimeStartTime}:00`
          : formData.onTimeStartTime
        : undefined,
      lateStartTime: formData.lateStartTime
        ? formData.lateStartTime.length === 5
          ? `${formData.lateStartTime}:00`
          : formData.lateStartTime
        : undefined,
      cutoffTime: formData.cutoffTime
        ? formData.cutoffTime.length === 5
          ? `${formData.cutoffTime}:00`
          : formData.cutoffTime
        : undefined,
      notes: formData.notes.trim() || undefined,
      isActive: formData.isActive,
    };

    await onSubmit(payload);
  }, [validate, formData, effectiveOvernight, isAr, mode, shift, onSubmit]);

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    errors,
    showSecondaryLanguage,
    setShowSecondaryLanguage,
    isAr,
    isAutoOvernight,
    effectiveOvernight,
    durationHours,
    validate,
    handleSubmit,
  };
}
