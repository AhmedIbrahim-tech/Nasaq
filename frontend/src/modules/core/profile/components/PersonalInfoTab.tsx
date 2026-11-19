'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconDeviceFloppy,
  IconRefresh,
  IconInfoCircle,
  IconLock,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { useAppDispatch } from '@/store/hooks';
import { updateUserProfile } from '@/modules/auth/slices/auth.slice';
import { updateProfile } from '@/modules/auth/services/auth.service';
import { notify } from '@/shared/services/notification.service';
import type { CurrentUserResponse, AuthUserResponse } from '@/modules/auth/types';

interface PersonalInfoTabProps {
  user: (CurrentUserResponse | AuthUserResponse) | null;
  accessToken: string | null;
  isPreviewActive: boolean;
}

export function PersonalInfoTab({
  user,
  accessToken,
  isPreviewActive,
}: PersonalInfoTabProps) {
  const t = useTranslations();
  const theme = useTheme();
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

  const handleReset = () => {
    setFullName(originalFullName);
    setPhoneNumber(originalPhoneNumber);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || isLoading) return;

    if (isPreviewActive) {
      notify.warning(t.has('ActionDisabledInPreview') ? t('ActionDisabledInPreview') : 'Action disabled in preview mode');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage(t('Full Name') + ' ' + (t.has('is required') ? t('is required') : 'is required.'));
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
  };

  const initial = (fullName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <form onSubmit={handleSave}>
        <Stack spacing={3}>
          {/* Section Title */}
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {t('Personal Information')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t.has('Manage your personal account settings, contact information, and security preferences.')
                ? t('Manage your personal account settings, contact information, and security preferences.')
                : 'Manage your personal account details and public identity.'}
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ borderRadius: '8px' }}>
              {errorMessage}
            </Alert>
          )}

          {hasChanges && (
            <Alert severity="info" icon={<IconInfoCircle size={20} />} sx={{ borderRadius: '8px' }}>
              {t('Unsaved Changes')}
            </Alert>
          )}

          {/* Profile Identity Card */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '8px',
              bgcolor: 'action.hover',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2.5}
              alignItems={{ xs: 'center', sm: 'center' }}
            >
              <Avatar
                alt={fullName || user?.email || 'User'}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '2rem',
                  fontWeight: 600,
                }}
              >
                {initial}
              </Avatar>

              <Box sx={{ textAlign: { xs: 'center', sm: 'start' } }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {fullName || user?.email || t('User Profile')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {user?.email || '—'}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Form Fields Grid */}
          <Grid container spacing={2.5}>
            {/* Full Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('Full Name')}
                fullWidth
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconUser size={18} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            {/* Phone Number */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('Phone Number')}
                fullWidth
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
                placeholder="+20 100 000 0000"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconPhone size={18} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            {/* Email (Read-Only) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('Email Address')}
                fullWidth
                value={user?.email || ''}
                disabled
                helperText={t('Login Email Notice')}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconLock size={18} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            {/* Job Title (Organization Managed) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('Job Title')}
                fullWidth
                value={user?.jobTitle || '—'}
                disabled
                helperText={t('Organization Managed')}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconBriefcase size={18} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Chip label={t('Organization Managed')} size="small" variant="outlined" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            {/* Department (Organization Managed) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('Department')}
                fullWidth
                value={user?.department || '—'}
                disabled
                helperText={t('Organization Managed')}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconBuildingSkyscraper size={18} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Chip label={t('Organization Managed')} size="small" variant="outlined" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleReset}
              disabled={!hasChanges || isLoading}
              startIcon={<IconRefresh size={18} />}
              sx={{ borderRadius: '7px', textTransform: 'none', fontWeight: 600 }}
            >
              {t('Discard Changes')}
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!hasChanges || isLoading || isPreviewActive}
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <IconDeviceFloppy size={18} />
                )
              }
              sx={{ borderRadius: '7px', textTransform: 'none', fontWeight: 600, px: 3 }}
            >
              {t('Save Changes')}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}
