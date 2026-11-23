'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { changePassword } from '@/modules/auth/services/auth.service';
import { notify } from '@/shared/services/notification.service';

interface UseChangePasswordParams {
  accessToken: string | null;
  isPreviewActive: boolean;
}

export function useChangePassword({ accessToken, isPreviewActive }: UseChangePasswordParams) {
  const t = useTranslations();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChangePassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isPreviewActive) {
        notify.warning(
          t.has('ActionDisabledInPreview')
            ? t('ActionDisabledInPreview')
            : 'Action disabled in preview mode'
        );
        return;
      }

      if (!currentPassword) {
        setErrorMessage(
          t.has('Current password is required')
            ? t('Current password is required')
            : 'Current password is required.'
        );
        return;
      }

      if (!newPassword || newPassword.length < 6) {
        setErrorMessage(
          t.has('New password must be at least 6 characters')
            ? t('New password must be at least 6 characters')
            : 'New password must be at least 6 characters.'
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        setErrorMessage(
          t.has('New passwords do not match')
            ? t('New passwords do not match')
            : 'New passwords do not match.'
        );
        return;
      }

      if (currentPassword === newPassword) {
        setErrorMessage(
          t.has('New password cannot be the same as the current password.')
            ? t('New password cannot be the same as the current password.')
            : 'New password cannot be the same as the current password.'
        );
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        await changePassword({ currentPassword, newPassword, confirmPassword }, accessToken);

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);

        notify.success(t('PasswordChangedSuccess'));
      } catch (err: any) {
        setErrorMessage(err.message || t('Error'));
      } finally {
        setIsLoading(false);
      }
    },
    [currentPassword, newPassword, confirmPassword, isPreviewActive, accessToken, t]
  );

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrent,
    setShowCurrent,
    showNew,
    setShowNew,
    showConfirm,
    setShowConfirm,
    isLoading,
    errorMessage,
    setErrorMessage,
    handleChangePassword,
  };
}
