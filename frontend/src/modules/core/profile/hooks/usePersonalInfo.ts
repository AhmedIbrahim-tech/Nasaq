'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch } from '@/store/hooks';
import { updateUserProfile } from '@/modules/auth/slices/auth.slice';
import { updateProfile } from '@/modules/auth/services/auth.service';
import { notify } from '@/shared/services/notification.service';
import type { CurrentUserResponse, AuthUserResponse } from '@/modules/auth/types';

interface UsePersonalInfoParams {
  user: (CurrentUserResponse | AuthUserResponse) | null;
  accessToken: string | null;
  isPreviewActive: boolean;
}

export function usePersonalInfo({ user, accessToken, isPreviewActive }: UsePersonalInfoParams) {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setFullName(user?.fullName || '');
    setPhoneNumber(user?.phoneNumber || '');
  }, [user]);

  const originalFullName = user?.fullName || '';
  const originalPhoneNumber = user?.phoneNumber || '';

  const hasChanges =
    fullName.trim() !== originalFullName.trim() ||
    phoneNumber.trim() !== originalPhoneNumber.trim();

  const handleReset = useCallback(() => {
    setFullName(originalFullName);
    setPhoneNumber(originalPhoneNumber);
    setErrorMessage(null);
  }, [originalFullName, originalPhoneNumber]);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!hasChanges || isLoading) return;

      if (isPreviewActive) {
        notify.warning(
          t.has('ActionDisabledInPreview')
            ? t('ActionDisabledInPreview')
            : 'Action disabled in preview mode'
        );
        return;
      }

      if (!fullName.trim()) {
        setErrorMessage(
          t('Full Name') + ' ' + (t.has('is required') ? t('is required') : 'is required.')
        );
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const updatedUser = await updateProfile(
          {
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim() || undefined,
          },
          accessToken
        );

        dispatch(updateUserProfile(updatedUser));
        notify.success(t('ProfileUpdatedSuccess'));
      } catch (err: any) {
        setErrorMessage(err.message || t('Error'));
      } finally {
        setIsLoading(false);
      }
    },
    [hasChanges, isLoading, isPreviewActive, fullName, phoneNumber, accessToken, dispatch, t]
  );

  return {
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    isLoading,
    errorMessage,
    setErrorMessage,
    hasChanges,
    handleReset,
    handleSave,
  };
}
