'use client';

import React, { useContext, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import {
  IconLanguage,
  IconSun,
  IconMoon,
  IconBell,
  IconCheck,
  IconDeviceFloppy,
  IconWorld,
  IconPalette,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { CustomizerContext } from '@/theme/customizerContext';
import { notify } from '@/shared/services/notification.service';

export function PreferencesTab() {
  const t = useTranslations();
  const theme = useTheme();

  const {
    isLanguage,
    setIsLanguage,
    activeMode,
    setActiveMode,
  } = useContext(CustomizerContext);

  const [inAppAlerts, setInAppAlerts] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('corestarter_inapp_alerts');
        return saved !== 'false';
      } catch {
        return true;
      }
    }
    return true;
  });

  const handleLanguageChange = (lang: string) => {
    if (lang !== isLanguage) {
      setIsLanguage(lang);
      notify.success(
        lang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language switched to English',
        { title: t('Preferences') }
      );
    }
  };

  const handleModeChange = (mode: string) => {
    if (mode !== activeMode) {
      setActiveMode(mode);
      notify.success(
        mode === 'dark' ? (t.has('Dark Mode') ? t('Dark Mode') : 'Dark Mode Enabled') : (t.has('Light Mode') ? t('Light Mode') : 'Light Mode Enabled'),
        { title: t('Preferences') }
      );
    }
  };

  const handleInAppAlertsToggle = (checked: boolean) => {
    setInAppAlerts(checked);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('corestarter_inapp_alerts', String(checked));
      } catch {
        // ignore
      }
    }
    notify.success(t('Preferences') + ' ' + (t.has('Updated') ? t('Updated') : 'updated.'));
  };

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        {/* Language Selection */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
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
                <IconLanguage size={20} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {t('Preferred Language')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.has('Choose your interface language') ? t('Choose your interface language') : 'Select interface display language'}
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={2}>
              {/* Arabic Option */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: '10px',
                    border: `1.5px solid ${isLanguage === 'ar' ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: isLanguage === 'ar' ? 'primary.light' : 'background.paper',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CardActionArea onClick={() => handleLanguageChange('ar')} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {t('Arabic')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          العربية — اليمين لليسار (RTL)
                        </Typography>
                      </Box>
                      {isLanguage === 'ar' && (
                        <Box sx={{ color: 'primary.main' }}>
                          <IconCheck size={20} />
                        </Box>
                      )}
                    </Stack>
                  </CardActionArea>
                </Card>
              </Grid>

              {/* English Option */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: '10px',
                    border: `1.5px solid ${isLanguage === 'en' ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: isLanguage === 'en' ? 'primary.light' : 'background.paper',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CardActionArea onClick={() => handleLanguageChange('en')} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {t('English')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          English — Left to Right (LTR)
                        </Typography>
                      </Box>
                      {isLanguage === 'en' && (
                        <Box sx={{ color: 'primary.main' }}>
                          <IconCheck size={20} />
                        </Box>
                      )}
                    </Stack>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Display Mode / Appearance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
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
                  bgcolor: 'warning.light',
                  color: 'warning.main',
                }}
              >
                <IconPalette size={20} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {t('Appearance & Theme')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.has('Choose display theme mode') ? t('Choose display theme mode') : 'Choose light or dark visual theme'}
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={2}>
              {/* Light Mode */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: '10px',
                    border: `1.5px solid ${activeMode === 'light' ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: activeMode === 'light' ? 'primary.light' : 'background.paper',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CardActionArea onClick={() => handleModeChange('light')} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <IconSun size={20} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {t('Light Mode')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t.has('Bright & Clear') ? t('Bright & Clear') : 'Default daytime'}
                          </Typography>
                        </Box>
                      </Stack>
                      {activeMode === 'light' && (
                        <Box sx={{ color: 'primary.main' }}>
                          <IconCheck size={20} />
                        </Box>
                      )}
                    </Stack>
                  </CardActionArea>
                </Card>
              </Grid>

              {/* Dark Mode */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: '10px',
                    border: `1.5px solid ${activeMode === 'dark' ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: activeMode === 'dark' ? 'primary.light' : 'background.paper',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CardActionArea onClick={() => handleModeChange('dark')} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <IconMoon size={20} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {t('Dark Mode')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t.has('High contrast') ? t('High contrast') : 'Night comfort'}
                          </Typography>
                        </Box>
                      </Stack>
                      {activeMode === 'dark' && (
                        <Box sx={{ color: 'primary.main' }}>
                          <IconCheck size={20} />
                        </Box>
                      )}
                    </Stack>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Notifications & In-App Alerts */}
        <Grid size={{ xs: 12 }}>
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
                <IconBell size={20} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {t('In-App Alerts')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('In-App Alerts Desc')}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={2} divider={<Divider />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {t('In-App Alerts')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('In-App Alerts Desc')}
                  </Typography>
                </Box>
                <Switch
                  checked={inAppAlerts}
                  onChange={(e) => handleInAppAlertsToggle(e.target.checked)}
                  color="primary"
                />
              </Box>

              <Box sx={{ pt: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  <IconInfoCircle size={14} style={{ verticalAlign: 'middle', marginInlineEnd: 4 }} />
                  {t('System Notifications Notice')}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
