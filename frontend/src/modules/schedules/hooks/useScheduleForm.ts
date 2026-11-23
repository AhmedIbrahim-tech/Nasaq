'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type {
  WorkSchedule,
  WorkShift,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleDayInput,
} from '../types';

const DAYS_OF_WEEK = [
  { day: 0, key: 'Sunday' },
  { day: 1, key: 'Monday' },
  { day: 2, key: 'Tuesday' },
  { day: 3, key: 'Wednesday' },
  { day: 4, key: 'Thursday' },
  { day: 5, key: 'Friday' },
  { day: 6, key: 'Saturday' },
];

interface UseScheduleFormProps {
  mode: 'create' | 'edit';
  schedule: WorkSchedule | null;
  shifts: WorkShift[];
  open: boolean;
  onSubmit: (data: CreateScheduleRequest | UpdateScheduleRequest) => Promise<void>;
}

export function useScheduleForm({ mode, schedule, shifts, open, onSubmit }: UseScheduleFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale.startsWith('ar');

  const [formData, setFormData] = useState<{
    name: string;
    nameAr: string;
    nameEn: string;
    description: string;
    descriptionAr: string;
    descriptionEn: string;
    isDefault: boolean;
    isActive: boolean;
    days: Record<number, { isWorkingDay: boolean; workShiftId: string }>;
  }>({
    name: '',
    nameAr: '',
    nameEn: '',
    description: '',
    descriptionAr: '',
    descriptionEn: '',
    isDefault: false,
    isActive: true,
    days: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSecondaryLanguage, setShowSecondaryLanguage] = useState(false);

  useEffect(() => {
    const defaultShiftId = shifts.length > 0 ? shifts[0].id : '';

    if (mode === 'edit' && schedule) {
      const enName = schedule.nameEn || schedule.name || '';
      const arName = schedule.nameAr || '';
      const enDesc = schedule.descriptionEn || schedule.description || '';
      const arDesc = schedule.descriptionAr || '';

      const daysMap: Record<number, { isWorkingDay: boolean; workShiftId: string }> = {};
      schedule.days.forEach((d) => {
        daysMap[d.dayOfWeek] = {
          isWorkingDay: d.isWorkingDay,
          workShiftId: d.workShiftId || defaultShiftId,
        };
      });

      setFormData({
        name: enName,
        nameEn: enName,
        nameAr: arName,
        description: enDesc,
        descriptionEn: enDesc,
        descriptionAr: arDesc,
        isDefault: schedule.isDefault ?? false,
        isActive: schedule.isActive ?? true,
        days: daysMap,
      });

      setShowSecondaryLanguage(isAr ? Boolean(enName || enDesc) : Boolean(arName || arDesc));
    } else {
      const initialDays: Record<number, { isWorkingDay: boolean; workShiftId: string }> = {};
      DAYS_OF_WEEK.forEach(({ day }) => {
        const isWork = day !== 5 && day !== 6;
        initialDays[day] = {
          isWorkingDay: isWork,
          workShiftId: isWork ? defaultShiftId : '',
        };
      });

      setFormData({
        name: '',
        nameAr: '',
        nameEn: '',
        description: '',
        descriptionAr: '',
        descriptionEn: '',
        isDefault: false,
        isActive: true,
        days: initialDays,
      });
      setShowSecondaryLanguage(false);
    }
    setErrors({});
  }, [mode, schedule, open, shifts, isAr]);

  const handleDayToggle = useCallback((day: number) => {
    setFormData((prev) => {
      const current = prev.days[day] || { isWorkingDay: false, workShiftId: '' };
      const nextWorking = !current.isWorkingDay;
      const defaultShiftId = shifts.length > 0 ? shifts[0].id : '';
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            isWorkingDay: nextWorking,
            workShiftId: nextWorking ? (current.workShiftId || defaultShiftId) : '',
          },
        },
      };
    });
  }, [shifts]);

  const handleShiftChange = useCallback((day: number, shiftId: string) => {
    setFormData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          workShiftId: shiftId,
        },
      },
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (isAr) {
      if (!formData.nameAr.trim()) {
        newErrors.nameAr = t('ScheduleNameRequired');
      } else if (formData.nameAr.length > 150) {
        newErrors.nameAr = t('ScheduleNameMaxLength');
      }
    } else {
      const en = (formData.nameEn || formData.name).trim();
      if (!en) {
        newErrors.nameEn = t('ScheduleNameRequired');
      } else if (en.length > 150) {
        newErrors.nameEn = t('ScheduleNameMaxLength');
      }
    }

    const workingDays = Object.entries(formData.days).filter(([_, d]) => d.isWorkingDay);
    if (workingDays.length === 0) {
      newErrors.days = t('AtLeastOneWorkingDay');
    } else {
      const missingShift = workingDays.some(([_, d]) => !d.workShiftId);
      if (missingShift) {
        newErrors.days = t('AllWorkingDaysMustHaveShift');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isAr, t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const daysPayload: ScheduleDayInput[] = DAYS_OF_WEEK.map(({ day }) => {
      const dayData = formData.days[day] || { isWorkingDay: false, workShiftId: '' };
      return {
        dayOfWeek: day,
        isWorkingDay: dayData.isWorkingDay,
        workShiftId: dayData.isWorkingDay ? dayData.workShiftId : null,
      };
    });

    const enName = formData.nameEn.trim() || formData.name.trim();
    const arName = formData.nameAr.trim();
    const primaryName = isAr ? (arName || enName) : (enName || arName);

    const enDesc = formData.descriptionEn.trim() || formData.description.trim();
    const arDesc = formData.descriptionAr.trim();

    const payload: CreateScheduleRequest | UpdateScheduleRequest = {
      ...(mode === 'edit' && schedule ? { id: schedule.id } : {}),
      name: enName || primaryName,
      nameEn: enName || null,
      nameAr: arName || null,
      description: enDesc || null,
      descriptionEn: enDesc || null,
      descriptionAr: arDesc || null,
      isDefault: formData.isDefault,
      isActive: formData.isActive,
      days: daysPayload,
    };

    await onSubmit(payload);
  }, [validate, formData, isAr, mode, schedule, onSubmit]);

  return {
    formData,
    setFormData,
    errors,
    showSecondaryLanguage,
    setShowSecondaryLanguage,
    isAr,
    handleDayToggle,
    handleShiftChange,
    validate,
    handleSubmit,
    daysOfWeek: DAYS_OF_WEEK,
  };
}
