'use client';

import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { IconLock, IconEye, IconEyeOff, IconCheck, IconShieldLock } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { ChangePasswordRequest } from '@/modules/auth/types';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ChangePasswordRequest) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export function ChangePasswordDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  errorMessage,
}: ChangePasswordDialogProps) {
  const t = useTranslations();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setValidationError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      setValidationError(
        t.has('Current password is required')
          ? t('Current password is required')
          : 'Current password is required.'
      );
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setValidationError(
        t.has('New password must be at least 6 characters')
          ? t('New password must be at least 6 characters')
          : 'New password must be at least 6 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError(
        t.has('New passwords do not match')
          ? t('New passwords do not match')
          : 'New passwords do not match.'
      );
      return;
    }

    setValidationError(null);

    await onSubmit({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconShieldLock size={24} color="#5D87FF" />
            <Typography variant="h5" fontWeight={600}>
              {t.has('Change Password') ? t('Change Password') : 'Change Password'}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            {errorMessage && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {validationError && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                {validationError}
              </Alert>
            )}

            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="caption" display="block">
                {t.has('Changing password invalidates other sessions')
                  ? t('Changing password invalidates other sessions')
                  : 'For security, changing your password revokes existing refresh tokens across other devices.'}
              </Typography>
            </Alert>

            <TextField
              label={t.has('Current Password') ? t('Current Password') : 'Current Password'}
              type={showCurrent ? 'text' : 'password'}
              fullWidth
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end" size="small">
                        {showCurrent ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label={t.has('New Password') ? t('New Password') : 'New Password'}
              type={showNew ? 'text' : 'password'}
              fullWidth
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNew(!showNew)} edge="end" size="small">
                        {showNew ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label={t.has('Confirm New Password') ? t('Confirm New Password') : 'Confirm New Password'}
              type={showConfirm ? 'text' : 'password'}
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small">
                        {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            {t.has('Cancel') ? t('Cancel') : 'Cancel'}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <IconCheck size={18} />}
          >
            {isLoading
              ? t.has('Updating') ? t('Updating') : 'Updating...'
              : t.has('Update Password') ? t('Update Password') : 'Update Password'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
