'use client';

import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { IconMoon, IconSun } from '@tabler/icons-react';
import PageContainer from '@/shared/components/container/PageContainer';
import LoginForm from '../components/LoginForm';
import ProductShowcase from '../components/ProductShowcase';
import NasaqBrand from '../components/NasaqBrand';
import { useAuthSessionContext } from '../context/AuthSessionContext';
import { CustomizerContext } from '@/theme/customizerContext';
import Language from '@/shared/layouts/dashboard/vertical/header/Language';
import Loading from '@/app/loading';

export default function SideLoginView() {
  const t = useTranslations();
  const { status } = useAuthSessionContext();
  const { activeMode, setActiveMode } = useContext(CustomizerContext);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  if (status === 'authenticated') {
    return <Loading />;
  }

  return (
    <PageContainer
      title={t.has('LoginTitle') ? t('LoginTitle') : 'Login — NASAQ'}
      description={
        t.has('LoginDescription')
          ? t('LoginDescription')
          : 'NASAQ — Employee Attendance & Workforce Management'
      }
    >
      <Box
        sx={{
          minHeight: '100vh',
          height: { xs: 'auto', lg: '100vh' },
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          overflow: { xs: 'auto', lg: 'hidden' },
          bgcolor: 'background.default',
        }}
      >
        {/* Left Panel: 55% — NASAQ Workforce Attendance Showcase (Desktop only) */}
        <Box
          component="section"
          aria-label={
            t.has('WorkforceShowcaseTitle')
              ? t('WorkforceShowcaseTitle')
              : 'NASAQ Employee Attendance'
          }
          sx={{
            flex: { xs: 'none', lg: '0 0 55%' },
            width: { xs: '100%', lg: '55%' },
            height: { xs: 'auto', lg: '100vh' },
            display: { xs: 'none', lg: 'flex' },
            overflowY: { xs: 'visible', lg: 'auto' },
            position: 'relative',
          }}
        >
          <ProductShowcase />
        </Box>

        {/* Right Panel: 45% — Authentication Form */}
        <Box
          component="main"
          sx={{
            flex: { xs: '1 1 100%', lg: '0 0 45%' },
            width: { xs: '100%', lg: '45%' },
            minHeight: { xs: '100vh', lg: '100vh' },
            height: { xs: 'auto', lg: '100vh' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 2.5, sm: 4, md: 5, xl: 6 },
            overflowY: 'auto',
            position: 'relative',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc',
            backgroundImage: (theme) =>
              theme.palette.mode === 'dark'
                ? 'radial-gradient(ellipse at 85% 15%, rgba(93, 135, 255, 0.08), transparent 60%)'
                : 'radial-gradient(ellipse at 85% 15%, rgba(93, 135, 255, 0.05), transparent 60%)',
          }}
        >
          {/* Top Bar Actions: Logo (mobile) + Language Selector + Dark/Light Theme Toggle */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: { xs: 2.5, sm: 4, md: 5 },
              py: { xs: 2, sm: 2.5 },
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <Box sx={{ display: { xs: 'flex', lg: 'none' } }}>
              <NasaqBrand variant="compact" height={32} />
            </Box>
            <Box sx={{ display: { xs: 'none', lg: 'block' } }} />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.25, sm: 1.5 },
              }}
            >
              <Language />
              <Tooltip
                title={
                  activeMode === 'light'
                    ? t.has('SwitchToDarkMode')
                      ? t('SwitchToDarkMode')
                      : 'Switch to Dark mode'
                    : t.has('SwitchToLightMode')
                    ? t('SwitchToLightMode')
                    : 'Switch to Light mode'
                }
              >
                <IconButton
                  id="login-theme-toggle"
                  aria-label={
                    activeMode === 'dark'
                      ? t.has('SwitchToLightMode')
                        ? t('SwitchToLightMode')
                        : 'Switch to Light mode'
                      : t.has('SwitchToDarkMode')
                      ? t('SwitchToDarkMode')
                      : 'Switch to Dark mode'
                  }
                  size="medium"
                  color="inherit"
                  onClick={() => setActiveMode(activeMode === 'light' ? 'dark' : 'light')}
                  sx={{
                    p: 0.85,
                    width: 38,
                    height: 38,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                    },
                  }}
                >
                  {activeMode === 'light' ? (
                    <IconMoon size="19" stroke="1.5" />
                  ) : (
                    <IconSun size="19" stroke="1.5" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Form Container with responsive vertical spacing */}
          <Box sx={{ width: '100%', my: 'auto', pt: { xs: 7, lg: 4 }, pb: { xs: 4, lg: 2 } }}>
            <LoginForm />
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}
