'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import {
  IconUser,
  IconBuilding,
  IconShieldLock,
  IconCircleCheck,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { RoleNames } from '@/shared/constants/roles';
import type { CurrentUserResponse, AuthUserResponse } from '@/modules/auth/types';

interface OverviewTabProps {
  user: (CurrentUserResponse | AuthUserResponse) | null;
  roles: string[];
  selectedCompanyName?: string | null;
  selectedBranchName?: string | null;
  tenantId?: string | null;
  onNavigateToTab: (tabIndex: number) => void;
}

export function OverviewTab({
  user,
  roles,
  selectedCompanyName,
  selectedBranchName,
  tenantId,
  onNavigateToTab,
}: OverviewTabProps) {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

  const isPlatformSuperAdmin = roles.includes(RoleNames.SuperAdmin);
  const isPlatformStaff = roles.includes(RoleNames.Admin);
  const isPlatformUser = isPlatformSuperAdmin || isPlatformStaff;

  const rawRole = roles.length > 0 ? roles[0] : 'User';
  const roleLabel =
    rawRole === 'SuperAdmin'
      ? (t.has('SuperAdmin') ? t('SuperAdmin') : 'Super Admin')
      : rawRole === 'Admin'
      ? (t.has('Admin') ? t('Admin') : 'Admin')
      : (t.has(rawRole) ? t(rawRole) : rawRole);

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        {/* Account Identity Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                }}
              >
                <IconUser size={20} />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                {t('Account Identity')}
              </Typography>
            </Stack>

            <Stack spacing={2} divider={<Divider />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('Full Name')}
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.fullName || '—'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('Email Address')}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ direction: 'ltr', unicodeBidi: 'isolate' }}
                >
                  {user?.email || '—'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('Phone Number')}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ direction: 'ltr', unicodeBidi: 'isolate' }}
                >
                  {user?.phoneNumber || '—'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('Assigned Roles')}
                </Typography>
                <Chip
                  label={roleLabel}
                  size="small"
                  color={isPlatformUser ? 'secondary' : 'primary'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('Account Status')}
                </Typography>
                <Chip
                  icon={<IconCircleCheck size={14} />}
                  label={t('Active / Operational')}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Work Information Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
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
                <IconBuilding size={20} />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                {t('WorkInformation')}
              </Typography>
            </Stack>

            <Stack spacing={2} divider={<Divider />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('JobTitle')}
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.jobTitle || '—'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('Department')}
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.department || '—'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('AccountScope')}
                </Typography>
                <Chip
                  label={roleLabel}
                  size="small"
                  variant="outlined"
                  color={isPlatformUser ? 'secondary' : 'primary'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('SystemAccess')}
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  {isPlatformUser ? t('FullSystemAccess') : t('StandardWorkforceAccess')}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
