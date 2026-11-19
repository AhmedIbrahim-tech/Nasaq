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
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconUserEdit size={24} color="#5D87FF" />
            <Typography variant="h5" fontWeight={600}>
              {t.has('Edit Profile Details') ? t('Edit Profile Details') : 'Edit Profile Details'}
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

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isLoading} color="inherit">
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
      </form>
    </Dialog>
  );
}
