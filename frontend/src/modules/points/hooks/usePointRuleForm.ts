'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { PointRule, CreatePointRuleRequest, UpdatePointRuleRequest, PointCategory, PointEventType } from '../types';

interface UsePointRuleFormProps {
  open: boolean;
  rule: PointRule | null;
  mode: 'create' | 'edit';
  onSubmit: (data: CreatePointRuleRequest | UpdatePointRuleRequest) => Promise<void>;
}

export function usePointRuleForm({ open, rule, mode, onSubmit }: UsePointRuleFormProps) {
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
    category: PointCategory;
    eventType: PointEventType;
    points: number;
    effectiveFrom: string;
    effectiveTo: string;
  }>({
    name: '',
    nameAr: '',
    nameEn: '',
    description: '',
    descriptionAr: '',
    descriptionEn: '',
    category: 'Green',
    eventType: 'OnTimeArrival',
    points: 10,
    effectiveFrom: new Date().toISOString().substring(0, 10),
    effectiveTo: '',
  });

  const [showSecondaryLanguage, setShowSecondaryLanguage] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && rule) {
        const enName = rule.nameEn || rule.name || '';
        const arName = rule.nameAr || '';
        const enDesc = rule.descriptionEn || rule.description || '';
        const arDesc = rule.descriptionAr || '';

        setFormData({
          name: enName,
          nameAr: arName,
          nameEn: enName,
          description: enDesc,
          descriptionAr: arDesc,
          descriptionEn: enDesc,
          category: rule.category,
          eventType: rule.eventType,
          points: rule.points,
          effectiveFrom: rule.effectiveFrom,
          effectiveTo: rule.effectiveTo || '',
        });

        setShowSecondaryLanguage(isAr ? Boolean(enName || enDesc) : Boolean(arName || arDesc));
      } else {
        setFormData({
          name: '',
          nameAr: '',
          nameEn: '',
          description: '',
          descriptionAr: '',
          descriptionEn: '',
          category: 'Green',
          eventType: 'OnTimeArrival',
          points: 10,
          effectiveFrom: new Date().toISOString().substring(0, 10),
          effectiveTo: '',
        });
        setShowSecondaryLanguage(false);
      }
      setErrors({});
    }
  }, [open, mode, rule, isAr]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (isAr) {
      if (!formData.nameAr.trim()) {
        newErrors.nameAr = t('RuleNameRequired');
      }
    } else {
      if (!formData.nameEn.trim() && !formData.name.trim()) {
        newErrors.nameEn = t('RuleNameRequired');
      }
    }

    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = t('EffectiveFromRequired');
    }

    if (formData.effectiveFrom && formData.effectiveTo && formData.effectiveTo < formData.effectiveFrom) {
      newErrors.effectiveTo = t('EffectiveToMustBeAfterFrom');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isAr, t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const enName = (formData.nameEn || formData.name).trim();
    const arName = formData.nameAr.trim();
    const enDesc = (formData.descriptionEn || formData.description).trim();
    const arDesc = formData.descriptionAr.trim();

    const primaryName = enName || arName;
    const primaryDesc = enDesc || arDesc || null;

    if (mode === 'create') {
      const payload: CreatePointRuleRequest = {
        name: primaryName,
        nameAr: arName || null,
        nameEn: enName || null,
        description: primaryDesc,
        descriptionAr: arDesc || null,
        descriptionEn: enDesc || null,
        category: formData.category,
        eventType: formData.eventType,
        points: Number(formData.points),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null,
      };
      await onSubmit(payload);
    } else if (rule) {
      const payload: UpdatePointRuleRequest = {
        id: rule.id,
        name: primaryName,
        nameAr: arName || null,
        nameEn: enName || null,
        description: primaryDesc,
        descriptionAr: arDesc || null,
        descriptionEn: enDesc || null,
        category: formData.category,
        eventType: formData.eventType,
        points: Number(formData.points),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null,
      };
      await onSubmit(payload);
    }
  }, [validate, mode, formData, rule, onSubmit]);

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    formData,
    setFormData,
    showSecondaryLanguage,
    setShowSecondaryLanguage,
    isAr,
    updateField,
    errors,
    validate,
    handleSubmit,
  };
}
