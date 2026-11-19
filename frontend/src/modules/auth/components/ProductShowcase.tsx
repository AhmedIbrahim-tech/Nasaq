'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import { useTheme, alpha } from '@mui/material/styles';
import { useTranslations } from 'next-intl';

// Outlined MUI Icons as strictly requested
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import PeopleOutline from '@mui/icons-material/PeopleOutline';
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import Logo from '@/shared/layouts/dashboard/shared/logo/Logo';

export default function ProductShowcase() {
  const theme = useTheme();
  const t = useTranslations();
  const isDark = theme.palette.mode === 'dark';

  const features = [
    {
      icon: <BusinessOutlined sx={{ fontSize: 20 }} />,
      title: t.has('OrganizationManagement') ? t('OrganizationManagement') : 'Enterprise Architecture',
      desc: t.has('OrganizationManagementDesc')
        ? t('OrganizationManagementDesc')
        : 'Clean Architecture with scalable domain foundations',
    },
    {
      icon: <PeopleOutline sx={{ fontSize: 20 }} />,
      title: t.has('UsersAndPermissions') ? t('UsersAndPermissions') : 'Users & Permissions',
      desc: t.has('UsersAndPermissionsDesc')
        ? t('UsersAndPermissionsDesc')
        : 'Granular role-based access control and security policies',
    },
    {
      icon: <VerifiedUserOutlined sx={{ fontSize: 20 }} />,
      title: t.has('SecureAccess') ? t('SecureAccess') : 'Secure Access',
      desc: t.has('SecureAccessDesc')
        ? t('SecureAccessDesc')
        : 'Enterprise-grade session protection and active monitoring',
    },
    {
      icon: <InsightsOutlined sx={{ fontSize: 20 }} />,
      title: t.has('BusinessInsights') ? t('BusinessInsights') : 'Business Insights',
      desc: t.has('BusinessInsightsDesc')
        ? t('BusinessInsightsDesc')
        : 'Comprehensive operational metrics and real-time oversight',
    },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: { xs: 'auto', lg: '100vh' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: { xs: 3, sm: 4, md: 5, xl: 6 },
        overflow: 'hidden',
        background: isDark
          ? `linear-gradient(145deg, #0b1329 0%, #111e38 50%, #0d162a 100%)`
          : `linear-gradient(145deg, #eff6ff 0%, #f0f7ff 45%, #e0f2fe 100%)`,
        borderRight: (th) => ({
          xs: 'none',
          lg: `1px solid ${th.palette.divider}`,
        }),
      }}
    >
      {/* Subtle Geometric Background Ornaments */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: -120,
          left: -120,
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(93, 135, 255, 0.12) 0%, rgba(93, 135, 255, 0) 70%)'
            : 'radial-gradient(circle, rgba(147, 197, 253, 0.35) 0%, rgba(147, 197, 253, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(30px)',
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(13, 148, 136, 0.1) 0%, rgba(13, 148, 136, 0) 70%)'
            : 'radial-gradient(circle, rgba(186, 230, 253, 0.45) 0%, rgba(186, 230, 253, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      {/* Decorative Subtle Grid Pattern */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: isDark ? 0.05 : 0.035,
          backgroundImage: `radial-gradient(${theme.palette.text.primary} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Branding Section */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Logo variant="horizontal" height={36} noLink />

          <Chip
            label={t.has('EnterprisePlatformBadge') ? t('EnterprisePlatformBadge') : 'ENTERPRISE CLOUD SUITE'}
            size="small"
            variant="outlined"
            sx={{
              height: 24,
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              borderColor: alpha(theme.palette.primary.main, 0.3),
              color: 'text.secondary',
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          />
        </Stack>
      </Box>

      {/* Center Section: Headline & Miniature Dashboard Preview */}
      <Box sx={{ position: 'relative', zIndex: 1, my: { xs: 3, lg: 'auto' } }}>
        {/* Main Headline */}
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.65rem', sm: '2rem', xl: '2.35rem' },
            letterSpacing: '-0.02em',
            color: 'text.primary',
            lineHeight: 1.25,
            mb: 1.5,
          }}
        >
          {t.has('RunYourBusinessWithConfidence')
            ? t('RunYourBusinessWithConfidence')
            : 'Run Your Business with Confidence'}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.875rem', sm: '0.95rem' },
            lineHeight: 1.6,
            maxWidth: 620,
            mb: 3,
          }}
        >
          {t.has('ShowcaseDescription')
            ? t('ShowcaseDescription')
            : 'Manage your organizations, users, permissions, and business operations in one secure, connected workspace.'}
        </Typography>

        {/* Miniature ERP Dashboard Preview (Non-interactive React + MUI Mockup) */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3.5,
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)'}`,
            bgcolor: isDark ? alpha(theme.palette.background.paper, 0.85) : '#ffffff',
            backdropFilter: 'blur(10px)',
            boxShadow: isDark
              ? '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
              : '0 20px 40px -15px rgba(15, 23, 42, 0.07)',
            p: 2.25,
            maxWidth: 680,
            userSelect: 'none',
          }}
        >
          {/* Mini Mockup Window Bar */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              pb: 1.5,
              mb: 1.75,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', opacity: 0.85 }} />
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b', opacity: 0.85 }} />
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', opacity: 0.85 }} />
              <Typography
                variant="caption"
                sx={{
                  ml: 1,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  letterSpacing: '0.02em',
                }}
              >
                Nasaq &bull;{' '}
                {t.has('PlatformManagement')
                  ? t('PlatformManagement')
                  : 'Attendance & Workforce Management'}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={t.has('ProductPreviewBadge') ? t('ProductPreviewBadge') : 'Product Preview • Illustrative Data'}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  color: 'text.secondary',
                  borderColor: alpha(theme.palette.divider, 0.9),
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)',
                  borderRadius: '4px',
                }}
              />
            </Stack>
          </Stack>

          {/* Mini Mockup Body: Compact Sidebar + Main Content */}
          <Stack direction="row" spacing={2}>
            {/* Miniature Navigation Strip */}
            <Stack
              spacing={1}
              sx={{
                width: 40,
                alignItems: 'center',
                py: 0.5,
                borderRight: `1px solid ${theme.palette.divider}`,
                pr: 1.5,
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DashboardOutlined sx={{ fontSize: 18 }} />
              </Box>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BusinessOutlined sx={{ fontSize: 18 }} />
              </Box>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PeopleOutline sx={{ fontSize: 18 }} />
              </Box>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AdminPanelSettingsOutlined sx={{ fontSize: 18 }} />
              </Box>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <InsightsOutlined sx={{ fontSize: 18 }} />
              </Box>
            </Stack>

            {/* Miniature Content Area */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Illustrative Preview Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                  }}
                >
                  {t.has('IllustrativePreviewNote') ? t('IllustrativePreviewNote') : 'Illustrative preview metrics'}
                </Typography>
                <Stack direction="row" spacing={0.65} alignItems="center">
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.67rem', color: 'success.main', fontWeight: 600 }}>
                    {t.has('Operational') ? t('Operational') : 'Operational'}
                  </Typography>
                </Stack>
              </Stack>

              {/* 3 KPI Summary Cards */}
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2.5,
                      bgcolor: isDark ? alpha(theme.palette.primary.main, 0.08) : '#f8faff',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem">
                        {t.has('ActiveTenants') ? t('ActiveTenants') : 'Active Tenants'}
                      </Typography>
                      <BusinessOutlined sx={{ fontSize: 15, color: 'primary.main' }} />
                    </Stack>
                    <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mt: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={800} fontSize="1.05rem">
                        128
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700, fontSize: '0.68rem' }}>
                        +12%
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2.5,
                      bgcolor: isDark ? alpha(theme.palette.secondary.main, 0.08) : '#faf8ff',
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem">
                        {t.has('SystemUsers') ? t('SystemUsers') : 'System Users'}
                      </Typography>
                      <PeopleOutline sx={{ fontSize: 15, color: 'secondary.main' }} />
                    </Stack>
                    <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mt: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={800} fontSize="1.05rem">
                        1,420
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.68rem' }}>
                        99.4%
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2.5,
                      bgcolor: isDark ? alpha(theme.palette.success.main, 0.08) : '#f6fbf8',
                      border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem">
                        {t.has('OperationalUptime') ? t('OperationalUptime') : 'Operational Uptime'}
                      </Typography>
                      <VerifiedUserOutlined sx={{ fontSize: 15, color: 'success.main' }} />
                    </Stack>
                    <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mt: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={800} fontSize="1.05rem">
                        99.98%
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700, fontSize: '0.68rem' }}>
                        {t.has('Active') ? t('Active') : 'Active'}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              {/* Mini Table & Analytics Bars Preview */}
              <Grid container spacing={1.5}>
                {/* Mini Organizations Table Preview */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Box
                    sx={{
                      borderRadius: 2.5,
                      border: `1px solid ${theme.palette.divider}`,
                      p: 1.25,
                      bgcolor: isDark ? 'background.default' : '#ffffff',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary', display: 'block', mb: 1 }}
                    >
                      {t.has('RecentOrganizations') ? t('RecentOrganizations') : 'Recent Organizations'}
                    </Typography>

                    <Stack spacing={0.9}>
                      {[
                        {
                          name: t.has('OrgAlNoor') ? t('OrgAlNoor') : 'Al-Noor Logistics',
                          code: 'ORG-101',
                          count: 420,
                        },
                        {
                          name: t.has('OrgApex') ? t('OrgApex') : 'Apex Global Trading',
                          code: 'ORG-102',
                          count: 310,
                        },
                        {
                          name: t.has('OrgDelta') ? t('OrgDelta') : 'Delta Horizon Co.',
                          code: 'ORG-103',
                          count: 185,
                        },
                      ].map((item, idx) => (
                        <Stack
                          key={idx}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{
                            py: 0.5,
                            borderBottom: idx < 2 ? `1px solid ${theme.palette.divider}` : 'none',
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                              sx={{
                                width: 22,
                                height: 22,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                              }}
                            >
                              {item.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', display: 'block', lineHeight: 1.1 }}>
                                {item.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                {item.code}
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <TaskAltOutlined sx={{ fontSize: 13, color: 'success.main' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.67rem', fontWeight: 600 }}>
                              {item.count} {t.has('users') ? t('users') : 'users'}
                            </Typography>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </Grid>

                {/* Mini Analytics Activity Preview */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box
                    sx={{
                      borderRadius: 2.5,
                      border: `1px solid ${theme.palette.divider}`,
                      p: 1.25,
                      bgcolor: isDark ? 'background.default' : '#ffffff',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary' }}>
                        {t.has('BusinessInsights') ? t('BusinessInsights') : 'Activity Volume'}
                      </Typography>
                      <InsightsOutlined sx={{ fontSize: 14, color: 'primary.main' }} />
                    </Stack>

                    {/* Stylized CSS Bar Chart Preview */}
                    <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ height: 62, px: 0.5, pt: 1 }}>
                      {[42, 68, 55, 84, 76, 96].map((h, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 14,
                            height: `${h}%`,
                            borderRadius: '4px 4px 1px 1px',
                            background:
                              i === 5
                                ? `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.4)} 100%)`
                                : alpha(theme.palette.primary.main, 0.25 + i * 0.1),
                            transition: 'height 0.3s ease',
                          }}
                        />
                      ))}
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'text.secondary' }}>
                        {t.has('Jan') ? t('Jan') : 'Jan'}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.62rem', color: 'primary.main', fontWeight: 700 }}>
                        {t.has('Current') ? t('Current') : 'Current'}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Card>
      </Box>

      {/* Bottom Feature Highlights Section */}
      <Box sx={{ position: 'relative', zIndex: 1, mt: { xs: 3, lg: 0 } }}>
        <Grid container spacing={1.75}>
          {features.map((feature, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6 }}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
                sx={{
                  p: 1.25,
                  borderRadius: 2.5,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.65)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)'}`,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {feature.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      color: 'text.primary',
                      lineHeight: 1.2,
                      mb: 0.35,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.72rem',
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {feature.desc}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
