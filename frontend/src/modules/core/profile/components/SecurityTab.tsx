'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import {
  IconLock,
  IconEye,
  IconEyeOff,
  IconKey,
  IconShieldLock,
  IconInfoCircle,
  IconDeviceLaptop,
  IconRefresh,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useChangePassword } from '../hooks';

interface SecurityTabProps {
  accessToken: string | null;
  accessTokenExpiresAtUtc?: string | null;
  isPreviewActive: boolean;
}

export function SecurityTab({
  accessToken,
  accessTokenExpiresAtUtc,
  isPreviewActive,
}: SecurityTabProps) {
  const t = useTranslations();
  const theme = useTheme();

  const {
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
  } = useChangePassword({ accessToken, isPreviewActive });

  const formattedExpiry = accessTokenExpiresAtUtc
    ? new Date(accessTokenExpiresAtUtc).toLocaleTimeString()
    : t.has('Active / Operational')
    ? t('Active / Operational')
    : 'Active';

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        {/* Change Password Card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <form onSubmit={handleChangePassword}>
              <Stack spacing={2.5}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'warning.light',
                      color: 'warning.main',
                    }}
                  >
                    <IconKey size={20} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {t('Change Password')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.has('Manage your secret credentials securely')
                        ? t('Manage your secret credentials securely')
                        : 'Update your account login password'}
                    </Typography>
                  </Box>
                </Stack>

                {errorMessage && (
                  <Alert severity="error" sx={{ borderRadius: '8px' }}>
                    {errorMessage}
                  </Alert>
                )}

                <TextField
                  label={t.has('Current password') ? t('Current password') : 'Current Password'}
                  type={showCurrent ? 'text' : 'password'}
                  fullWidth
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconLock size={18} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrent((prev) => !prev)}
                            edge="end"
                            size="small"
                          >
                            {showCurrent ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label={t.has('New password') ? t('New password') : 'New Password'}
                  type={showNew ? 'text' : 'password'}
                  fullWidth
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  helperText={t('Password Policy Hint')}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconKey size={18} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNew((prev) => !prev)}
                            edge="end"
                            size="small"
                          >
                            {showNew ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label={t.has('Confirm new password') ? t('Confirm new password') : 'Confirm New Password'}
                  type={showConfirm ? 'text' : 'password'}
                  fullWidth
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconShieldLock size={18} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirm((prev) => !prev)}
                            edge="end"
                            size="small"
                          >
                            {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading || isPreviewActive || !currentPassword || !newPassword || !confirmPassword}
                    startIcon={
                      isLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <IconKey size={18} />
                      )
                    }
                    sx={{ borderRadius: '7px', textTransform: 'none', fontWeight: 600, px: 3 }}
                  >
                    {t('Change Password')}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Card>
        </Grid>

        {/* Current Session & Security Details */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            {/* Current Session Card */}
            <Card
              variant="outlined"
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '12px',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'info.light',
                    color: 'info.main',
                  }}
                >
                  <IconDeviceLaptop size={20} />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {t('Current Session')}
                </Typography>
              </Stack>

              <Stack spacing={1.75} divider={<Divider />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('Session Type')}
                  </Typography>
                  <Chip label={t('Active')} size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('Session Expiry')}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {formattedExpiry}
                  </Typography>
                </Box>

                <Box sx={{ pt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('Active Session Note')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    {t('Session Revocation Note')}
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* Enterprise Security Advisory Card */}
            <Card
              variant="outlined"
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '12px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'action.hover',
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                <IconAlertTriangle size={22} color={theme.palette.warning.main} style={{ marginTop: 2, flexShrink: 0 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {t('Future Security Features')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.5 }}>
                    {t('Future Security Features Desc')}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
