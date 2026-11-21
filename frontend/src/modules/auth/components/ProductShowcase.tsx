'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import { useTheme, alpha } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import {
  IconMapPin,
  IconClockCheck,
  IconShieldCheck,
  IconCurrentLocation,
  IconCalendarTime,
  IconUsers,
} from '@tabler/icons-react';
import NasaqBrand from './NasaqBrand';

export default function ProductShowcase() {
  const theme = useTheme();
  const t = useTranslations();
  const isDark = theme.palette.mode === 'dark';
  const isRtl = theme.direction === 'rtl';

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
        bgcolor: isDark ? '#0b1329' : '#f0f5fb',
        backgroundImage: isDark
          ? 'linear-gradient(145deg, #0b1329 0%, #111e38 50%, #0d162a 100%)'
          : 'linear-gradient(145deg, #f0f7ff 0%, #eff6ff 45%, #e2effd 100%)',
        borderInlineEnd: (th) => ({
          xs: 'none',
          lg: `1px solid ${th.palette.divider}`,
        }),
        '&:before': {
          content: '""',
          background: isDark
            ? 'radial-gradient(circle at 50% 50%, rgba(93, 135, 255, 0.12), rgba(19, 222, 185, 0.05) 50%, transparent 80%)'
            : 'radial-gradient(circle at 50% 50%, #d2f1df, #d3d7fa, #bad8f4)',
          position: 'absolute',
          inset: 0,
          opacity: isDark ? 0.6 : 0.45,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Decorative Radial Lighting Glows */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: -100,
          insetInlineStart: -100,
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(93, 135, 255, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(147, 197, 253, 0.45) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(35px)',
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          bottom: -80,
          insetInlineEnd: -80,
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(19, 222, 185, 0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(186, 230, 253, 0.5) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      {/* Top Header: NASAQ Brand + Workforce Tag */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            width: '100%',
          }}
        >
          <NasaqBrand noLink variant="horizontal" height={38} />

          {/* Top Platform Badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              height: 30,
              px: 1.5,
              borderRadius: '15px',
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.25),
              color: 'text.secondary',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#13DEB9',
                boxShadow: '0 0 6px #13DEB9',
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: isRtl ? '0' : '0.02em',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {t.has('NasaqWorkforcePlatform')
                ? t('NasaqWorkforcePlatform')
                : 'NASAQ Workforce Platform'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Center Section: Headline & Modernize Illustration with Attendance Badges */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          my: 'auto',
          py: { xs: 2, lg: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Title and Short Attendance Description */}
        <Box sx={{ maxWidth: 620, mx: 'auto', mb: 3 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.65rem', sm: '1.95rem', xl: '2.25rem' },
              letterSpacing: isRtl ? '0' : '-0.025em',
              color: 'text.primary',
              lineHeight: 1.25,
              mb: 1.25,
            }}
          >
            {t.has('WorkforceShowcaseTitle')
              ? t('WorkforceShowcaseTitle')
              : 'Employee Attendance & Workforce Management'}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.875rem', sm: '0.95rem' },
              lineHeight: 1.6,
              maxWidth: 560,
              mx: 'auto',
            }}
          >
            {t.has('WorkforceShowcaseSubtitle')
              ? t('WorkforceShowcaseSubtitle')
              : 'Smart attendance verification, geofenced work locations, and flexible shift scheduling in one unified workspace.'}
          </Typography>
        </Box>

        {/* Central Illustration Area with Floating Attendance Badges */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            my: 1,
          }}
        >
          {/* Official Modernize Auth Illustration */}
          <Box
            component="img"
            src="/images/backgrounds/login-bg.svg"
            alt="NASAQ Workforce Attendance Illustration"
            sx={{
              width: '100%',
              maxWidth: { xs: 320, sm: 380, xl: 430 },
              height: 'auto',
              maxHeight: 380,
              objectFit: 'contain',
              display: 'block',
              filter: isDark ? 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))' : 'drop-shadow(0 10px 20px rgba(93,135,255,0.12))',
              transition: 'transform 0.3s ease',
            }}
          />

          {/* Floating Badge 1: Geofence Verified */}
          <Card
            elevation={0}
            sx={{
              position: 'absolute',
              top: { xs: -10, sm: 10 },
              insetInlineStart: { xs: -10, sm: 10, xl: 20 },
              p: 1.5,
              borderRadius: 3,
              bgcolor: isDark ? 'rgba(17, 30, 56, 0.88)' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(93, 135, 255, 0.15)'}`,
              boxShadow: isDark
                ? '0 12px 24px -4px rgba(0, 0, 0, 0.6)'
                : '0 12px 28px -6px rgba(15, 23, 42, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              userSelect: 'none',
              zIndex: 3,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: alpha('#5D87FF', 0.12),
                color: '#5D87FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconMapPin size={22} stroke={2} />
            </Box>
            <Box sx={{ minWidth: 0, textAlign: 'start' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#13DEB9',
                    boxShadow: '0 0 6px #13DEB9',
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2, whiteSpace: 'nowrap' }}
                >
                  {t.has('BadgeGeofenceVerified')
                    ? t('BadgeGeofenceVerified')
                    : 'Geofence Verified'}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500, display: 'block', whiteSpace: 'nowrap' }}
              >
                {t.has('BadgeGeofenceDesc')
                  ? t('BadgeGeofenceDesc')
                  : 'Active Worksite GPS'}
              </Typography>
            </Box>
          </Card>

          {/* Floating Badge 2: Shift Active */}
          <Card
            elevation={0}
            sx={{
              position: 'absolute',
              bottom: { xs: 10, sm: 25 },
              insetInlineEnd: { xs: -10, sm: 10, xl: 15 },
              p: 1.5,
              borderRadius: 3,
              bgcolor: isDark ? 'rgba(17, 30, 56, 0.88)' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(19, 222, 185, 0.2)'}`,
              boxShadow: isDark
                ? '0 12px 24px -4px rgba(0, 0, 0, 0.6)'
                : '0 12px 28px -6px rgba(15, 23, 42, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              userSelect: 'none',
              zIndex: 3,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: alpha('#13DEB9', 0.12),
                color: '#13DEB9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconClockCheck size={22} stroke={2} />
            </Box>
            <Box sx={{ minWidth: 0, textAlign: 'start' }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2, mb: 0.25, whiteSpace: 'nowrap' }}
              >
                {t.has('BadgeShiftActive') ? t('BadgeShiftActive') : 'Shift Active'}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500, display: 'block', whiteSpace: 'nowrap' }}
              >
                {t.has('BadgeShiftDesc') ? t('BadgeShiftDesc') : 'On-Time Attendance'}
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Bottom Feature Cards: 3 Attendance Capabilities */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={2}>
          {/* Capability 1: Geofenced Locations */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                height: '100%',
                borderRadius: 3,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(93, 135, 255, 0.12)'}`,
                boxShadow: isDark
                  ? '0 4px 16px rgba(0,0,0,0.3)'
                  : '0 4px 16px rgba(93, 135, 255, 0.05)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#5D87FF',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    bgcolor: alpha('#5D87FF', 0.12),
                    color: '#5D87FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconCurrentLocation size={22} stroke={2} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      lineHeight: 1.3,
                      color: 'text.primary',
                      mb: 0.5,
                      wordBreak: 'break-word',
                    }}
                  >
                    {t.has('FeatureGeofenceTitle')
                      ? t('FeatureGeofenceTitle')
                      : 'Geofenced Locations'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.74rem',
                      lineHeight: 1.45,
                      display: 'block',
                      wordBreak: 'break-word',
                    }}
                  >
                    {t.has('FeatureGeofenceDesc')
                      ? t('FeatureGeofenceDesc')
                      : 'GPS boundary validation for authorized employee check-ins.'}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Capability 2: Flexible Shifts */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                height: '100%',
                borderRadius: 3,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(19, 222, 185, 0.15)'}`,
                boxShadow: isDark
                  ? '0 4px 16px rgba(0,0,0,0.3)'
                  : '0 4px 16px rgba(19, 222, 185, 0.05)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#13DEB9',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    bgcolor: alpha('#13DEB9', 0.12),
                    color: '#13DEB9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconCalendarTime size={22} stroke={2} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      lineHeight: 1.3,
                      color: 'text.primary',
                      mb: 0.5,
                      wordBreak: 'break-word',
                    }}
                  >
                    {t.has('FeatureShiftsTitle')
                      ? t('FeatureShiftsTitle')
                      : 'Flexible Shifts'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.74rem',
                      lineHeight: 1.45,
                      display: 'block',
                      wordBreak: 'break-word',
                    }}
                  >
                    {t.has('FeatureShiftsDesc')
                      ? t('FeatureShiftsDesc')
                      : 'Automated work hour calculation and shift compliance.'}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Capability 3: Workforce Oversight */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                height: '100%',
                borderRadius: 3,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 174, 31, 0.15)'}`,
                boxShadow: isDark
                  ? '0 4px 16px rgba(0,0,0,0.3)'
                  : '0 4px 16px rgba(255, 174, 31, 0.05)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: '#FFAE1F',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    bgcolor: alpha('#FFAE1F', 0.12),
                    color: '#FFAE1F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconUsers size={22} stroke={2} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      lineHeight: 1.3,
                      color: 'text.primary',
                      mb: 0.5,
                      wordBreak: 'break-word',
                    }}
                  >
                    {t.has('FeaturePresenceTitle')
                      ? t('FeaturePresenceTitle')
                      : 'Workforce Oversight'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.74rem',
                      lineHeight: 1.45,
                      display: 'block',
                      wordBreak: 'break-word',
                    }}
                  >
                    {t.has('FeaturePresenceDesc')
                      ? t('FeaturePresenceDesc')
                      : 'Real-time employee presence and supervisor tracking.'}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
