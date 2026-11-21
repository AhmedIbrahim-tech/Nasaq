'use client';

import React, { useContext, useState } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { IconCheck } from '@tabler/icons-react';
import { CustomizerContext } from '@/theme/customizerContext';

interface LanguageOption {
  value: 'ar' | 'en';
  title: string;
  nativeTitle: string;
  flagIcon: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    value: 'ar',
    title: 'Arabic',
    nativeTitle: 'العربية',
    flagIcon: '/images/flag/icon-flag-sa.svg',
  },
  {
    value: 'en',
    title: 'English',
    nativeTitle: 'English',
    flagIcon: '/images/flag/icon-flag-en.svg',
  },
];

const Language = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { isLanguage, setIsLanguage, activeDir } = useContext(CustomizerContext);
  const isRtl = activeDir === 'rtl';

  const currentLang =
    LANGUAGES.find((lang) => lang.value === isLanguage) || LANGUAGES[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (langValue: 'ar' | 'en') => {
    setIsLanguage(langValue);
    handleClose();
  };

  return (
    <>
      <Tooltip
        title={isLanguage === 'ar' ? 'تغيير اللغة (Language)' : 'Change Language (تغيير اللغة)'}
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
            borderRadius: '8px',
            border: '1px solid',
            borderColor: open ? 'primary.main' : 'divider',
            bgcolor: (theme) =>
              open
                ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08)
                : 'transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            },
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={currentLang.flagIcon}
              alt={currentLang.title}
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
          horizontal: isRtl ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: isRtl ? 'left' : 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 220,
              borderRadius: '12px',
              p: 1,
              mt: 1,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(0,0,0,0.5)'
                  : '0 8px 24px rgba(0,0,0,0.1)',
            },
          },
        }}
      >
        {LANGUAGES.map((option) => {
          const isSelected = option.value === isLanguage;
          return (
            <MenuItem
              key={option.value}
              selected={isSelected}
              onClick={() => handleSelect(option.value)}
              sx={{
                borderRadius: '8px',
                py: 1,
                px: 1.5,
                my: 0.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: isSelected
                  ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.08)
                  : 'transparent',
                '&:hover': {
                  bgcolor: isSelected
                    ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12)
                    : 'action.hover',
                },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  }}
                >
                  <Box
                    component="img"
                    src={option.flagIcon}
                    alt={option.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight={isSelected ? 700 : 500}
                    color={isSelected ? 'primary.main' : 'text.primary'}
                    sx={{ fontSize: '0.875rem', lineHeight: 1.25 }}
                  >
                    {option.nativeTitle}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: '0.75rem', lineHeight: 1 }}
                  >
                    {option.title}
                  </Typography>
                </Box>
              </Stack>

              {isSelected && (
                <IconCheck
                  size={16}
                  stroke={2.5}
                  color={theme.palette.primary.main}
                />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default Language;
