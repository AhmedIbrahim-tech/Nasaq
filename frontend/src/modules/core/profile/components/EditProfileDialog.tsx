'use client';

import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { IconUserEdit, IconDeviceFloppy } from '@tabler/icons-react';
import DialogCloseButton from '@/shared/components/buttons/DialogCloseButton';
import { ProfilePhotoAvatar } from '@/shared/components/avatar';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';

import type { UpdateProfileRequest } from '@/modules/auth/types';

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateProfileRequest) => Promise<void>;
  initialData: {
    fullName?: string | null;
    phoneNumber?: string | null;
    jobTitle?: string | null;
    department?: string | null;
    profilePhoto?: string | null;
  };
  isLoading: boolean;
  errorMessage: string | null;
}

export function EditProfileDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  errorMessage,
}: EditProfileDialogProps) {
  const t = useTranslations();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    if (open) {
      setFullName(initialData.fullName || '');
      setPhoneNumber(initialData.phoneNumber || '');
      setJobTitle(initialData.jobTitle || '');
      setDepartment(initialData.department || '');
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      fullName: fullName.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      department: department.trim() || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
        sx: {
          maxHeight: 'calc(100% - 64px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2.5,
          flex: '0 0 auto',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconUserEdit size={24} color="#5D87FF" />
          <Typography component="div" variant="h5" fontWeight={600}>
            {t.has('Edit Profile Details') ? t('Edit Profile Details') : 'Edit Profile Details'}
          </Typography>
        </Stack>
        <DialogCloseButton onClose={onClose} disabled={isLoading} />
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2, flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
        <Stack spacing={2.5}>
          {/* User Identity Header with Avatar */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ pb: 0.5 }}>
            <ProfilePhotoAvatar
              photoId={initialData.profilePhoto}
              name={fullName || initialData.fullName}
              size={56}
              sx={{ border: (theme) => `2px solid ${theme.palette.divider}` }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {fullName || initialData.fullName || t('User')}
              </Typography>
              {(initialData.jobTitle || initialData.department) && (
                <Typography variant="caption" color="text.secondary">
                  {[initialData.jobTitle, initialData.department].filter(Boolean).join(' • ')}
                </Typography>
              )}
            </Box>
          </Stack>

          {errorMessage && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t.has('Full Name') ? t('Full Name') : 'Full Name'}
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t.has('Phone Number') ? t('Phone Number') : 'Phone Number'}
                fullWidth
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t.has('Job Title') ? t('Job Title') : 'Job Title'}
                fullWidth
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t.has('Department') ? t('Department') : 'Department'}
                fullWidth
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isLoading}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1.5, flex: '0 0 auto', borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} disabled={isLoading} variant="outlined" color="inherit">
          {t.has('Cancel') ? t('Cancel') : 'Cancel'}
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <IconDeviceFloppy size={18} />}
        >
          {isLoading
            ? t.has('Saving') ? t('Saving') : 'Saving...'
            : t.has('Save Changes') ? t('Save Changes') : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
