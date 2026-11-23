'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { RoleNames } from '@/shared/constants/roles';
import { toDateInputValue } from '@/shared/utils/i18nFormatters';
import type { Employee } from '../types';

interface UseEmployeeFormProps {
  mode: 'create' | 'edit';
  employee: Employee | null;
  open: boolean;
  onSubmit: (data: any) => Promise<void>;
}

export function useEmployeeForm({ mode, employee, open, onSubmit }: UseEmployeeFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale.startsWith('ar');

  const [formData, setFormData] = useState<{
    employeeCode: string;
    firstName: string;
    lastName: string;
    firstNameAr: string;
    lastNameAr: string;
    firstNameEn: string;
    lastNameEn: string;
    email: string;
    phoneNumber: string;
    department: string;
    departmentAr: string;
    jobTitle: string;
    jobTitleAr: string;
    hireDate: string;
    createUserAccount: boolean;
    userRole: string;
    password: string;
    supervisorId: string | null;
    workLocationId: string | null;
  }>({
    employeeCode: '',
    firstName: '',
    lastName: '',
    firstNameAr: '',
    lastNameAr: '',
    firstNameEn: '',
    lastNameEn: '',
    email: '',
    phoneNumber: '',
    department: '',
    departmentAr: '',
    jobTitle: '',
    jobTitleAr: '',
    hireDate: toDateInputValue(new Date().toISOString()),
    createUserAccount: false,
    userRole: RoleNames.Employee,
    password: '',
    supervisorId: null,
    workLocationId: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [removePhotoRequested, setRemovePhotoRequested] = useState(false);
  const [showSecondaryLanguage, setShowSecondaryLanguage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    if (mode === 'edit' && employee) {
      // English name values
      const enFirst = employee.firstNameEn || employee.firstName || '';
      const enLast = employee.lastNameEn || employee.lastName || '';
      // Arabic name values (never fabricate Arabic from English)
      const arFirst = employee.firstNameAr || '';
      const arLast = employee.lastNameAr || '';

      setFormData({
        employeeCode: employee.employeeCode || '',
        firstName: enFirst,
        lastName: enLast,
        firstNameEn: enFirst,
        lastNameEn: enLast,
        firstNameAr: arFirst,
        lastNameAr: arLast,
        email: employee.email || '',
        phoneNumber: employee.phoneNumber || '',
        department: employee.department || '',
        departmentAr: employee.departmentAr || '',
        jobTitle: employee.jobTitle || '',
        jobTitleAr: employee.jobTitleAr || '',
        hireDate: toDateInputValue(employee.hireDate) || toDateInputValue(new Date().toISOString()),
        createUserAccount: false,
        userRole: (employee.userRole || RoleNames.Employee) as any,
        password: '',
        supervisorId: employee.supervisorId || null,
        workLocationId: employee.workLocationId || null,
      });

      // Detect whether secondary language values exist based on current UI locale:
      // In Arabic UI, secondary is English.
      // In English UI, secondary is Arabic.
      const hasSecondary = isAr
        ? Boolean(enFirst.trim() || enLast.trim())
        : Boolean(arFirst.trim() || arLast.trim());

      setShowSecondaryLanguage(hasSecondary);

      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhoto(null);
      setPhotoPreview(null);
      setPhotoError(null);
      setRemovePhotoRequested(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setFormData({
        employeeCode: '',
        firstName: '',
        lastName: '',
        firstNameAr: '',
        lastNameAr: '',
        firstNameEn: '',
        lastNameEn: '',
        email: '',
        phoneNumber: '',
        department: '',
        departmentAr: '',
        jobTitle: '',
        jobTitleAr: '',
        hireDate: toDateInputValue(new Date().toISOString()),
        createUserAccount: false,
        userRole: RoleNames.Employee,
        password: '',
        supervisorId: null,
        workLocationId: null,
      });
      // In create mode, secondary language checkbox defaults to unchecked
      setShowSecondaryLanguage(false);

      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhoto(null);
      setPhotoPreview(null);
      setPhotoError(null);
      setRemovePhotoRequested(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setErrors({});
  }, [mode, employee, open, isAr]);

  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setPhotoError(t('InvalidImageFile'));
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setPhotoError(t('ProfilePhotoHint'));
      return;
    }

    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhotoRequested(false);
  }, [photoPreview, t]);

  const handleRemovePhoto = useCallback(() => {
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
    setRemovePhotoRequested(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [photoPreview]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === 'create' && !formData.employeeCode.trim()) {
      newErrors.employeeCode = t('EmployeeCodeRequired');
    }

    if (isAr) {
      // In Arabic Create: Arabic name is required
      if (mode === 'create') {
        if (!formData.firstNameAr?.trim()) {
          newErrors.firstNameAr = t('FirstNameRequired');
        }
        if (!formData.lastNameAr?.trim()) {
          newErrors.lastNameAr = t('LastNameRequired');
        }
      } else {
        // In Arabic Edit: require at least one language variant
        const hasArabic = Boolean(formData.firstNameAr?.trim() && formData.lastNameAr?.trim());
        const hasEnglish = Boolean(
          (formData.firstNameEn?.trim() || formData.firstName?.trim()) &&
          (formData.lastNameEn?.trim() || formData.lastName?.trim())
        );
        if (!hasArabic && !hasEnglish) {
          newErrors.firstNameAr = t('FirstNameRequired');
          newErrors.lastNameAr = t('LastNameRequired');
        } else if (formData.firstNameAr?.trim() && !formData.lastNameAr?.trim()) {
          newErrors.lastNameAr = t('LastNameRequired');
        } else if (!formData.firstNameAr?.trim() && formData.lastNameAr?.trim()) {
          newErrors.firstNameAr = t('FirstNameRequired');
        }
      }
    } else {
      // In English Create: English name is required
      if (mode === 'create') {
        const enFirst = formData.firstNameEn?.trim() || formData.firstName?.trim();
        const enLast = formData.lastNameEn?.trim() || formData.lastName?.trim();
        if (!enFirst) {
          newErrors.firstNameEn = t('FirstNameRequired');
        }
        if (!enLast) {
          newErrors.lastNameEn = t('LastNameRequired');
        }
      } else {
        // In English Edit: require at least one language variant
        const hasArabic = Boolean(formData.firstNameAr?.trim() && formData.lastNameAr?.trim());
        const hasEnglish = Boolean(
          (formData.firstNameEn?.trim() || formData.firstName?.trim()) &&
          (formData.lastNameEn?.trim() || formData.lastName?.trim())
        );
        if (!hasArabic && !hasEnglish) {
          newErrors.firstNameEn = t('FirstNameRequired');
          newErrors.lastNameEn = t('LastNameRequired');
        } else if ((formData.firstNameEn?.trim() || formData.firstName?.trim()) && !(formData.lastNameEn?.trim() || formData.lastName?.trim())) {
          newErrors.lastNameEn = t('LastNameRequired');
        } else if (!(formData.firstNameEn?.trim() || formData.firstName?.trim()) && (formData.lastNameEn?.trim() || formData.lastName?.trim())) {
          newErrors.firstNameEn = t('FirstNameRequired');
        }
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = t('EmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t('InvalidEmail');
    }
    if (!formData.hireDate) {
      newErrors.hireDate = t('HireDateRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [mode, isAr, formData, t]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Harmonize names so database constraints and CQRS contracts are respected
    const effectiveFirstNameEn = formData.firstNameEn?.trim() || formData.firstName?.trim() || '';
    const effectiveLastNameEn = formData.lastNameEn?.trim() || formData.lastName?.trim() || '';
    const effectiveFirstNameAr = formData.firstNameAr?.trim() || '';
    const effectiveLastNameAr = formData.lastNameAr?.trim() || '';

    // Primary English fallback to Arabic if English not provided
    const primaryFirst = effectiveFirstNameEn || effectiveFirstNameAr;
    const primaryLast = effectiveLastNameEn || effectiveLastNameAr;

    const payload = {
      ...formData,
      firstName: primaryFirst,
      lastName: primaryLast,
      firstNameEn: effectiveFirstNameEn || undefined,
      lastNameEn: effectiveLastNameEn || undefined,
      firstNameAr: effectiveFirstNameAr || undefined,
      lastNameAr: effectiveLastNameAr || undefined,
      department: formData.department?.trim() || undefined,
      departmentAr: formData.departmentAr?.trim() || undefined,
      jobTitle: formData.jobTitle?.trim() || undefined,
      jobTitleAr: formData.jobTitleAr?.trim() || undefined,
      photo,
      ...(mode === 'edit' ? { removeProfilePhoto: removePhotoRequested } : {}),
    };

    await onSubmit(payload);
  }, [validate, mode, formData, photo, removePhotoRequested, onSubmit]);

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    errors,
    photo,
    photoPreview,
    photoError,
    removePhotoRequested,
    showSecondaryLanguage,
    setShowSecondaryLanguage,
    fileInputRef,
    onPhotoSelect: handlePhotoSelect,
    onRemovePhoto: handleRemovePhoto,
    onSubmit: handleSubmit,
    validate,
  };
}
