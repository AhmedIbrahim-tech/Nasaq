'use client';

import React, { useContext, useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { IconCheck, IconLanguage, IconWorld } from '@tabler/icons-react';
import { CustomizerContext } from '@/theme/customizerContext';

interface LanguageOption {
  value: string;
  nativeName: string;
  subName: string;
  badge: string;
  icon: string;
  dir: 'rtl' | 'ltr';
}

const LANGUAGES: LanguageOption[] = [
  {
    value: 'ar',
    nativeName: 'العربية',
    subName: 'Arabic',
    badge: 'SA',
    icon: '/images/flag/icon-flag-sa.svg',
    dir: 'rtl',
  },
  {
    value: 'en',
    nativeName: 'English',
    subName: 'English',
    badge: 'UK',
    icon: '/images/flag/icon-flag-en.svg',
    dir: 'ltr',
  },
];

const Language = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { isLanguage, setIsLanguage, activeDir } = useContext(CustomizerContext);

  const currentLang =
    LANGUAGES.find((lang) => lang.value === isLanguage) || LANGUAGES[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (langValue: string) => {
    setIsLanguage(langValue);
    handleClose();
  };

  return (
    <>
      <Tooltip
        title={isLanguage === 'ar' ? 'تغيير لغة العرض (Language)' : 'Change Language (اللغة)'}
        arrow
        enterDelay={300}
      >
        <IconButton
          id="language-dropdown-button"
          aria-label="Change Language"
          aria-controls={open ? 'language-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          size="medium"
          sx={{
            p: 0.85,
            width: 38,
            height: 38,
            borderRadius: 2,
            border: '1px solid',
            borderColor: open ? 'primary.main' : 'divider',
            bgcolor: (theme) =>
              open
                ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08)
                : theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
            },
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 16,
              borderRadius: '3px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
              border: '1px solid',
              borderColor:
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
              bgcolor: 'background.paper',
            }}
          >
            <Box
              component="img"
              src={currentLang.icon}
              alt={currentLang.value}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Box>
        </IconButton>
      </Tooltip>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: activeDir === 'rtl' ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: activeDir === 'rtl' ? 'left' : 'right',
        }}
        sx={{
          '& .MuiMenu-paper': {
            width: 290,
            maxWidth: 'calc(100vw - 32px)',
            borderRadius: '16px',
            p: 1.25,
            mt: 1.25,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff'),
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 36px -4px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08)'
                : '0 12px 32px -4px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          },
        }}
      >
        {/* Menu Header */}
        <Box sx={{ px: 1.5, pt: 1, pb: 1.25 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                }}
              >
                <IconLanguage size={18} stroke={2} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                  {isLanguage === 'ar' ? 'لغة الواجهة' : 'Display Language'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                  {isLanguage === 'ar' ? 'اختر لغة النظام' : 'Select interface language'}
                </Typography>
              </Box>
            </Stack>
            <Chip
              label={currentLang.badge}
              size="small"
              color="primary"
              variant="filled"
              sx={{
                fontWeight: 700,
                fontSize: '0.6875rem',
                height: 22,
                borderRadius: '6px',
                letterSpacing: 0.5,
              }}
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 0.5, borderColor: 'divider' }} />

        {/* Language Options */}
        {LANGUAGES.map((option) => {
          const isSelected = option.value === isLanguage;
          return (
            <MenuItem
              key={option.value}
              selected={isSelected}
              onClick={() => handleSelect(option.value)}
              sx={{
                borderRadius: '10px',
                py: 1.25,
                px: 1.5,
                my: 0.5,
                transition: 'all 0.18s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid',
                borderColor: isSelected
                  ? alpha(theme.palette.primary.main, 0.35)
                  : 'transparent',
                bgcolor: isSelected
                  ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08)
                  : 'transparent',
                '&:hover': {
                  bgcolor: isSelected
                    ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.13)
                    : 'action.hover',
                  transform: activeDir === 'rtl' ? 'translateX(-2px)' : 'translateX(2px)',
                },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                {/* Crisp Rectangular Flag */}
                <Box
                  sx={{
                    width: 34,
                    height: 24,
                    borderRadius: '5px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
                    border: '1px solid',
                    borderColor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box
                    component="img"
                    src={option.icon}
                    alt={option.nativeName}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>

                {/* Text Details */}
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Typography
                      variant="body2"
                      fontWeight={isSelected ? 700 : 600}
                      color={isSelected ? 'primary.main' : 'text.primary'}
                      sx={{ fontSize: '0.9rem', lineHeight: 1.25 }}
                    >
                      {option.nativeName}
                    </Typography>
                    <Chip
                      label={option.badge}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        bgcolor: isSelected
                          ? alpha(theme.palette.primary.main, 0.15)
                          : theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                        color: isSelected ? 'primary.main' : 'text.secondary',
                      }}
                    />
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                      mt: 0.25,
                    }}
                  >
                    {option.subName}
                  </Typography>
                </Box>
              </Stack>

              {/* Selected Indicator */}
              {isSelected && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    flexShrink: 0,
                    boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }}
                >
                  <IconCheck size={14} stroke={3} />
                </Box>
              )}
            </MenuItem>
          );
        })}

        {/* Footer Informational Notice */}
        <Divider sx={{ my: 0.75, borderColor: 'divider' }} />
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            borderRadius: '8px',
            bgcolor:
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <IconWorld size={14} stroke={1.75} style={{ opacity: 0.6, flexShrink: 0 }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: '0.7rem',
              lineHeight: 1.3,
            }}
          >
            {isLanguage === 'ar'
              ? 'يدعم التبديل الفوري لاتجاه الواجهة (RTL/LTR)'
              : 'Instant RTL/LTR layout direction switching'}
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default Language;
