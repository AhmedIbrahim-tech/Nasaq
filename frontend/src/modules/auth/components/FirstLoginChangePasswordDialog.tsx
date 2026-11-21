'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import {
  IconLockCheck,
  IconShieldLock,
  IconEye,
  IconEyeOff,
  IconCheck,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { useAppDispatch } from '@/store/hooks';
import { notify } from '@/shared/services/notification.service';
import { firstLoginChangePassword } from '../services/auth.service';
import { setAuthenticated, clearSetupToken } from '../slices/auth.slice';
import { coordinateLogin } from '../services/sessionCoordinator';

interface FirstLoginChangePasswordDialogProps {
  open: boolean;
  setupToken: string | null;
  onClose?: () => void;
}

export function FirstLoginChangePasswordDialog({
  open,
  setupToken,
  onClose,
}: FirstLoginChangePasswordDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!open || !setupToken) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setErrorMessage(null);

    if (!newPassword) {
      setValidationError(
        t.has('NewPasswordRequired')
          ? t('NewPasswordRequired')
          : 'New password is required.'
      );
      return;
    }

    if (newPassword.length < 8) {
      setValidationError(
        t.has('PasswordLengthWarning')
          ? t('PasswordLengthWarning')
          : 'Password must be at least 8 characters long.'
      );
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setValidationError(
        t.has('PasswordUpperWarning')
          ? t('PasswordUpperWarning')
          : 'Password must contain at least one uppercase letter (A-Z).'
      );
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setValidationError(
        t.has('PasswordLowerWarning')
          ? t('PasswordLowerWarning')
          : 'Password must contain at least one lowercase letter (a-z).'
      );
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setValidationError(
        t.has('PasswordDigitWarning')
          ? t('PasswordDigitWarning')
          : 'Password must contain at least one number (0-9).'
      );
      return;
    }

    if (!/[!@#$%^&*()_\-+=\[\]{}|;:,.<>?]/.test(newPassword)) {
      setValidationError(
        t.has('PasswordSpecialWarning')
          ? t('PasswordSpecialWarning')
          : 'Password must contain at least one non-alphanumeric character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError(
        t.has('PasswordsDoNotMatch')
          ? t('PasswordsDoNotMatch')
          : 'New password and confirmation password do not match.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const authResult = await firstLoginChangePassword({
        setupToken,
        newPassword,
        confirmPassword,
      });

      // Establish authoritative session
      const coordinated = await coordinateLogin(authResult);
      dispatch(setAuthenticated(coordinated));

      // Reset local fields
      setNewPassword('');
      setConfirmPassword('');
      notify.success(
        t.has('PasswordChangedSuccess')
          ? t('PasswordChangedSuccess')
          : 'Password created successfully! Welcome to Nasaq.',
        { title: t.has('Account Setup Complete') ? t('Account Setup Complete') : 'Account Setup Complete' }
      );
      router.push('/');
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to update temporary password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    dispatch(clearSetupToken());
    setNewPassword('');
    setConfirmPassword('');
    setValidationError(null);
    setErrorMessage(null);
    if (onClose) onClose();
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      aria-labelledby="first-login-change-password-title"
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
        noValidate: true,
        sx: {
          maxHeight: 'calc(100% - 64px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle component="div" id="first-login-change-password-title" sx={{ pb: 1, flexShrink: 0 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: '50%',
                bgcolor: 'warning.light',
                color: 'warning.dark',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconLockCheck size={24} />
            </Box>
            <Box>
              <Typography component="div" variant="h6" fontWeight={700}>
                {t.has('ChangePasswordRequired')
                  ? t('ChangePasswordRequired')
                  : 'Initial Password Setup Required'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t.has('FirstLoginSetupSubtitle')
                  ? t('FirstLoginSetupSubtitle')
                  : 'Please set a permanent strong password to complete account activation.'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2.5, flex: '1 1 auto', overflowY: 'auto' }}>
          <Stack spacing={2.5}>
            <Alert
              severity="info"
              icon={<IconShieldLock size={22} />}
              sx={{ borderRadius: 2 }}
            >
              {t.has('FirstLoginInstruction')
                ? t('FirstLoginInstruction')
                : 'Because you are signing in with a temporary password, you must establish a new secure password before gaining access to Nasaq.'}
            </Alert>

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

            <TextField
              id="first-login-new-password"
              label={t.has('NewPassword') ? t('NewPassword') : 'New Password'}
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              id="first-login-confirm-password"
              label={
                t.has('ConfirmNewPassword')
                  ? t('ConfirmNewPassword')
                  : 'Confirm New Password'
              }
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom sx={{ display: 'block' }}>
                {t.has('PasswordRulesTitle') ? t('PasswordRulesTitle') : 'Password Requirements:'}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>At least 8 characters long</li>
                <li>At least one uppercase and one lowercase letter</li>
                <li>At least one numeric digit (0-9)</li>
                <li>At least one special symbol (!@#$%^&*)</li>
                <li>Cannot be identical to your temporary password</li>
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, flexShrink: 0, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleCancel} disabled={isLoading} color="inherit">
            {t.has('Cancel') ? t('Cancel') : 'Cancel'}
          </Button>
          <Button
            id="first-login-submit-btn"
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <IconCheck size={18} />
              )
            }
          >
            {isLoading
              ? t.has('Updating') ? t('Updating') : 'Updating...'
              : t.has('SetPasswordAndSignIn')
              ? t('SetPasswordAndSignIn')
              : 'Set Password & Sign In'}
          </Button>
        </DialogActions>
    </Dialog>
  );
}
