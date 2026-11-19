'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import {
  IconUser,
  IconShieldLock,
  IconBell,
  IconServer,
  IconBrandNextjs,
  IconCheck,
} from '@tabler/icons-react';
import Link from 'next/link';

import PageContainer from '@/shared/components/container/PageContainer';
import DashboardCard from '@/shared/components/cards/DashboardCard';
import { useAppSelector } from '@/store/hooks';

export default function DashboardView() {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);
  const roles = useAppSelector((state) => state.auth.roles) || [];

  const starterKpis = [
    {
      title: 'Authentication',
      value: 'Active',
      description: 'ASP.NET Core Identity & JWT',
      icon: <IconShieldLock size={24} color={theme.palette.success.main} />,
      color: theme.palette.success.light,
    },
    {
      title: 'Backend Core',
      value: '.NET 10',
      description: 'Clean Architecture & MediatR',
      icon: <IconServer size={24} color={theme.palette.primary.main} />,
      color: theme.palette.primary.light,
    },
    {
      title: 'Frontend Shell',
      value: 'Next.js 16',
      description: 'Modernize & Material UI',
      icon: <IconBrandNextjs size={24} color={theme.palette.info.main} />,
      color: theme.palette.info.light,
    },
    {
      title: 'SignalR Hub',
      value: 'Connected',
      description: 'Realtime Notifications',
      icon: <IconBell size={24} color={theme.palette.warning.main} />,
      color: theme.palette.warning.light,
    },
  ];

  return (
    <PageContainer
      title="Dashboard — CoreStarter"
      description="Clean Architecture & Modernize CoreStarter Template"
    >
      <Box sx={{ mt: 3 }}>
        {/* Welcome Banner */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'background.paper' : 'primary.light',
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <IconUser size={32} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Welcome back, {user?.fullName || user?.email || 'User'}!
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Your clean starter template is ready for building your new enterprise application.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              {roles.map((role) => (
                <Chip key={role} label={role} color="primary" size="small" />
              ))}
            </Stack>
          </Stack>
        </Card>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {starterKpis.map((kpi, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
              <DashboardCard>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="textSecondary">
                      {kpi.title}
                    </Typography>
                    <Avatar sx={{ bgcolor: kpi.color, width: 40, height: 40 }}>
                      {kpi.icon}
                    </Avatar>
                  </Stack>
                  <Typography variant="h4" fontWeight={700}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {kpi.description}
                  </Typography>
                </Stack>
              </DashboardCard>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions & Technical Overview */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardCard title="Template Foundation">
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  This generic starter template provides an enterprise-ready architecture:
                </Typography>
                <Stack spacing={1}>
                  {[
                    'Clean Architecture with ASP.NET Core .NET 10',
                    'ASP.NET Core Identity with JWT & Refresh Token rotation',
                    'SignalR real-time notification push pipeline',
                    'FluentValidation and MediatR pipeline behaviors',
                    'Material UI & Modernize App Router shell with RTL support',
                    'Bilingual localization engine (English / Arabic)',
                  ].map((feature, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="center">
                      <IconCheck size={18} color={theme.palette.success.main} />
                      <Typography variant="body2">{feature}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </DashboardCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardCard title="Quick Navigation">
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Explore common foundation views:
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    component={Link}
                    href="/profile"
                    variant="outlined"
                    startIcon={<IconUser size={18} />}
                  >
                    User Profile
                  </Button>
                  <Button
                    component={Link}
                    href="/notifications"
                    variant="outlined"
                    startIcon={<IconBell size={18} />}
                  >
                    Notifications
                  </Button>
                </Stack>
              </Stack>
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
