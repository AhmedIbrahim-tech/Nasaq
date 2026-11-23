'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { WorkSchedule, AssignEmployeeScheduleRequest } from '../types';

interface UseAssignScheduleFormProps {
  open: boolean;
  schedules?: WorkSchedule[];
  onSubmit: (data: AssignEmployeeScheduleRequest) => Promise<void>;
}

export function useAssignScheduleForm({ open, schedules = [], onSubmit }: UseAssignScheduleFormProps) {
  const t = useTranslations();

  const [formData, setFormData] = useState<{
    employeeId: string;
    workScheduleId: string;
    effectiveFrom: string;
    effectiveTo: string;
    notes: string;
  }>({
    employeeId: '',
    workScheduleId: '',
    effectiveFrom: new Date().toISOString().substring(0, 10),
    effectiveTo: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        employeeId: '',
        workScheduleId: schedules.find((s) => s.isDefault)?.id || (schedules.length > 0 ? schedules[0].id : ''),
        effectiveFrom: new Date().toISOString().substring(0, 10),
        effectiveTo: '',
        notes: '',
      });
      setErrors({});
    }
  }, [open, schedules]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = t('EmployeeSelectionRequired');
    }

    if (!formData.workScheduleId) {
      newErrors.workScheduleId = t('ScheduleSelectionRequired');
    }

    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = t('EffectiveFromRequired');
    }

    if (formData.effectiveFrom && formData.effectiveTo && formData.effectiveTo < formData.effectiveFrom) {
      newErrors.effectiveTo = t('EffectiveToMustBeAfterFrom');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      employeeId: formData.employeeId,
      workScheduleId: formData.workScheduleId,
      effectiveFrom: formData.effectiveFrom,
      effectiveTo: formData.effectiveTo || undefined,
      notes: formData.notes.trim() || undefined,
    });
  }, [validate, formData, onSubmit]);

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    errors,
    validate,
    handleSubmit,
  };
}
