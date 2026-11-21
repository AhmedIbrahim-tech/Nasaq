'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { useTheme, alpha } from '@mui/material/styles';
import {
  IconUsers,
  IconMapPin,
  IconUserCircle,
  IconBell,
  IconShieldLock,
  IconCertificate,
  IconLanguage,
  IconServer,
  IconCheck,
  IconChevronRight,
  IconChevronLeft,
  IconCalendar,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import PageContainer from '@/shared/components/container/PageContainer';
import DashboardCard from '@/shared/components/cards/DashboardCard';
import BlankCard from '@/shared/components/cards/BlankCard';
import { useAppSelector } from '@/store/hooks';
import { formatUserRole } from '@/shared/utils/format.utils';
import { ProfilePhotoAvatar } from '@/shared/components/avatar';
import { CustomizerContext } from '@/theme/customizerContext';

export default function DashboardView() {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === 'rtl';
  const isDark = theme.palette.mode === 'dark';
  const { isLanguage, activeMode } = useContext(CustomizerContext);

  const user = useAppSelector((state) => state.auth.user);
  const roles = useAppSelector((state) => state.auth.roles) || [];

  const displayName = user?.fullName || user?.email?.split('@')[0] || t('User');
  const rawRole = roles.length > 0 ? roles[0] : 'User';
  const displayRole = formatUserRole(rawRole, t);

  // Formatted date string for the banner
  const todayFormatted = new Intl.DateTimeFormat(isLanguage === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  // 1. Primary Operational Modules
  const operationalModules = [
    {
      title: t('DashboardEmployeesTitle'),
      description: t('DashboardEmployeesDesc'),
      href: '/employees',
      icon: <IconUsers size={24} stroke={1.75} />,
      color: theme.palette.primary.main,
      bgcolor: isDark ? alpha(theme.palette.primary.main, 0.15) : theme.palette.primary.light,
      actionText: t('ViewAll') || 'View',
    },
    {
      title: t('DashboardLocationsTitle'),
      description: t('DashboardLocationsDesc'),
      href: '/locations',
      icon: <IconMapPin size={24} stroke={1.75} />,
      color: theme.palette.info.main,
      bgcolor: isDark ? alpha(theme.palette.info.main, 0.15) : theme.palette.info.light,
      actionText: t('ViewAll') || 'View',
    },
    {
      title: t('DashboardProfileTitle'),
      description: t('DashboardProfileDesc'),
      href: '/profile',
      icon: <IconUserCircle size={24} stroke={1.75} />,
      color: theme.palette.success.main,
      bgcolor: isDark ? alpha(theme.palette.success.main, 0.15) : theme.palette.success.light,
      actionText: t('Manage') || 'Manage',
    },
    {
      title: t('DashboardNotificationsTitle'),
      description: t('DashboardNotificationsDesc'),
      href: '/notifications',
      icon: <IconBell size={24} stroke={1.75} />,
      color: theme.palette.warning.main,
      bgcolor: isDark ? alpha(theme.palette.warning.main, 0.15) : theme.palette.warning.light,
      actionText: t('ViewAll') || 'View',
    },
  ];

  // 2. Genuine System Status & Security KPIs
  const systemStatusKpis = [
    {
      title: t('DashboardKpiSecurityTitle'),
      value: t('DashboardKpiSecurityValue'),
      description: t('DashboardKpiSecurityDesc'),
      icon: <IconShieldLock size={22} stroke={1.75} color={theme.palette.success.main} />,
      color: isDark ? alpha(theme.palette.success.main, 0.15) : theme.palette.success.light,
    },
    {
      title: t('DashboardKpiRoleTitle'),
      value: displayRole,
      description: t('DashboardKpiRoleDesc'),
      icon: <IconCertificate size={22} stroke={1.75} color={theme.palette.primary.main} />,
      color: isDark ? alpha(theme.palette.primary.main, 0.15) : theme.palette.primary.light,
    },
    {
      title: t('DashboardKpiLocaleTitle'),
      value: isLanguage === 'ar' ? 'العربية (RTL)' : 'English (LTR)',
      description: isDark ? 'Dark Theme' : 'Light Theme',
      icon: <IconLanguage size={22} stroke={1.75} color={theme.palette.info.main} />,
      color: isDark ? alpha(theme.palette.info.main, 0.15) : theme.palette.info.light,
    },
    {
      title: t('DashboardKpiRealtimeTitle'),
      value: t('DashboardKpiRealtimeValue'),
      description: t('DashboardKpiRealtimeDesc'),
      icon: <IconServer size={22} stroke={1.75} color={theme.palette.warning.main} />,
      color: isDark ? alpha(theme.palette.warning.main, 0.15) : theme.palette.warning.light,
    },
  ];

  // 3. System Guidelines
  const platformGuidelines = [
    t('DashboardSystemGuideline1'),
    t('DashboardSystemGuideline2'),
    t('DashboardSystemGuideline3'),
    t('DashboardSystemGuideline4'),
  ];

  return (
    <PageContainer
      title={`${t('DashboardTitle')} — NASAQ`}
      description={t('DashboardSubtitle')}
    >
      <Box sx={{ mt: 1 }}>
        {/* ======================================================== */}
        {/* 1. Welcome Banner Card                                    */}
        {/* ======================================================== */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 3,
            backgroundColor: isDark ? 'background.paper' : 'primary.light',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2.5}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <ProfilePhotoAvatar
                photoId={user?.profilePhoto}
                name={displayName}
                size={60}
                sx={{
                  boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                  border: `3px solid ${theme.palette.background.paper}`,
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 0.5 }}>
                  {t('DashboardWelcomeBack', { name: displayName })}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1, maxWidth: 680 }}>
                  {t('DashboardWelcomeDesc')}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconCalendar size={15} stroke={1.5} color={theme.palette.text.secondary} />
                  <Typography variant="caption" color="textSecondary" fontWeight={500}>
                    {todayFormatted}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
              sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
            >
              {roles.map((role) => (
                <Chip
                  key={role}
                  label={formatUserRole(role, t)}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: isDark ? alpha(theme.palette.primary.main, 0.15) : 'background.paper',
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Card>

        {/* ======================================================== */}
        {/* 2. Primary Operational Feature Modules                    */}
        {/* ======================================================== */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          {t('DashboardQuickNavigation')}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {operationalModules.map((module, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
              <BlankCard
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme: any) =>
                      isDark
                        ? `0 6px 20px ${alpha(theme.palette.common.black, 0.4)}`
                        : theme.shadows[10],
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: module.bgcolor,
                        color: module.color,
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                      }}
                    >
                      {module.icon}
                    </Avatar>
                  </Stack>

                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {module.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      mb: 2.5,
                      flex: 1,
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {module.description}
                  </Typography>

                  <Button
                    component={Link}
                    href={module.href}
                    variant="outlined"
                    size="small"
                    fullWidth
                    endIcon={isRtl ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />}
                    sx={{
                      justifyContent: 'space-between',
                      borderRadius: '8px',
                      fontWeight: 600,
                      borderColor: theme.palette.divider,
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    {module.title}
                  </Button>
                </CardContent>
              </BlankCard>
            </Grid>
          ))}
        </Grid>

        {/* ======================================================== */}
        {/* 3. System Status & Security KPIs                          */}
        {/* ======================================================== */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {systemStatusKpis.map((kpi, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
              <DashboardCard>
                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="textSecondary" fontWeight={600}>
                      {kpi.title}
                    </Typography>
                    <Avatar sx={{ bgcolor: kpi.color, width: 38, height: 38, borderRadius: '10px' }}>
                      {kpi.icon}
                    </Avatar>
                  </Stack>
                  <Typography variant="h5" fontWeight={700}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ lineHeight: 1.4 }}>
                    {kpi.description}
                  </Typography>
                </Stack>
              </DashboardCard>
            </Grid>
          ))}
        </Grid>

        {/* ======================================================== */}
        {/* 4. Operational Guidelines & Quick Navigation Details     */}
        {/* ======================================================== */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardCard title={t('DashboardSystemGuidelines')}>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {t('DashboardWelcomeDesc')}
                </Typography>
                <Stack spacing={1.5}>
                  {platformGuidelines.map((guideline, i) => (
                    <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: isDark ? alpha(theme.palette.success.main, 0.2) : theme.palette.success.light,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          mt: 0.2,
                        }}
                      >
                        <IconCheck size={14} color={theme.palette.success.main} stroke={2.5} />
                      </Box>
                      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                        {guideline}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </DashboardCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardCard title={t('DashboardQuickNavigation')}>
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {t('DashboardQuickNavigationDesc')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      component={Link}
                      href="/employees"
                      variant="outlined"
                      fullWidth
                      startIcon={<IconUsers size={18} />}
                      sx={{
                        py: 1.25,
                        justifyContent: 'flex-start',
                        borderRadius: '8px',
                        fontWeight: 600,
                        textAlign: 'start',
                      }}
                    >
                      {t('DashboardEmployeesTitle')}
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      component={Link}
                      href="/locations"
                      variant="outlined"
                      fullWidth
                      startIcon={<IconMapPin size={18} />}
                      sx={{
                        py: 1.25,
                        justifyContent: 'flex-start',
                        borderRadius: '8px',
                        fontWeight: 600,
                        textAlign: 'start',
                      }}
                    >
                      {t('DashboardLocationsTitle')}
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      component={Link}
                      href="/profile"
                      variant="outlined"
                      fullWidth
                      startIcon={<IconUserCircle size={18} />}
                      sx={{
                        py: 1.25,
                        justifyContent: 'flex-start',
                        borderRadius: '8px',
                        fontWeight: 600,
                        textAlign: 'start',
                      }}
                    >
                      {t('DashboardProfileTitle')}
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      component={Link}
                      href="/notifications"
                      variant="outlined"
                      fullWidth
                      startIcon={<IconBell size={18} />}
                      sx={{
                        py: 1.25,
                        justifyContent: 'flex-start',
                        borderRadius: '8px',
                        fontWeight: 600,
                        textAlign: 'start',
                      }}
                    >
                      {t('DashboardNotificationsTitle')}
                    </Button>
                  </Grid>
                </Grid>
              </Stack>
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
