'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CardActionArea from '@mui/material/CardActionArea';
import { useTheme } from '@mui/material/styles';
import {
  IconUser,
  IconBuilding,
  IconShieldLock,
  IconPalette,
  IconKey,
  IconArrowRight,
  IconArrowLeft,
  IconCircleCheck,
  IconFingerprint,
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

  const shortcutCards = [
    {
      title: t('Edit Personal Info'),
      desc: t('Personal Information'),
      icon: <IconUser size={22} />,
      tabIndex: 1,
      color: theme.palette.primary.main,
      bgcolor: 'primary.light',
    },
    {
      title: t('Account Security'),
      desc: t('Password & Credentials'),
      icon: <IconKey size={22} />,
      tabIndex: 2,
      color: theme.palette.warning.main,
      bgcolor: 'warning.light',
    },
    {
      title: t('Appearance & Theme'),
      desc: t('Preferences'),
      icon: <IconPalette size={22} />,
      tabIndex: 3,
      color: theme.palette.info.main,
      bgcolor: 'info.light',
    },
    {
      title: t('View Permissions'),
      desc: t('Effective Permissions'),
      icon: <IconShieldLock size={22} />,
      tabIndex: 4,
      color: theme.palette.success.main,
      bgcolor: 'success.light',
    },
  ];

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

        {/* Organizational Scope Card */}
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
                {t('Organizational Scope')}
              </Typography>
            </Stack>

            <Stack spacing={2} divider={<Divider />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('Account Scope')}
                </Typography>
                <Chip
                  label={isPlatformUser ? t('Platform Account Scope') : t('Tenant Account Scope')}
                  size="small"
                  variant="outlined"
                  color={isPlatformUser ? 'secondary' : 'primary'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {isPlatformUser ? (
                <Box sx={{ py: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('PlatformSuperAdminSecurityDesc')}
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Active Company')}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {selectedCompanyName || '—'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Active Branch')}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {selectedBranchName || '—'}
                    </Typography>
                  </Box>

                  {user?.jobTitle && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('Job Title')}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {user.jobTitle}
                      </Typography>
                    </Box>
                  )}

                  {user?.department && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('Department')}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {user.department}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Navigation Shortcuts */}
      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          {t('Quick Shortcuts')}
        </Typography>

        <Grid container spacing={2}>
          {shortcutCards.map((item) => (
            <Grid key={item.tabIndex} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => onNavigateToTab(item.tabIndex)}
                  sx={{ p: 2 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: item.bgcolor,
                        color: item.color,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {item.desc}
                      </Typography>
                    </Box>

                    <Box sx={{ color: 'text.secondary' }}>
                      {isRtl ? <IconArrowLeft size={18} /> : <IconArrowRight size={18} />}
                    </Box>
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Discreet Account Metadata for Support */}
      <Card
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: '10px',
          bgcolor: 'action.hover',
          border: `1px dashed ${theme.palette.divider}`,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconFingerprint size={18} style={{ opacity: 0.7 }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {t('Support Identifier')}:
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                direction: 'ltr',
                unicodeBidi: 'isolate',
                fontSize: '0.75rem',
                color: 'text.secondary',
              }}
            >
              {user?.id || '—'}
            </Typography>
          </Stack>

          {tenantId && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {t('Tenant ID')}:
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  direction: 'ltr',
                  unicodeBidi: 'isolate',
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                }}
              >
                {tenantId}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
