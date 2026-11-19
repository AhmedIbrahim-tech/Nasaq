'use client';

import React, { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import { DataTableKpiCard } from '@/shared/components/tables/types';

export interface DataTableKpiCardsProps {
  title?: ReactNode;
  action?: ReactNode;
  cards: DataTableKpiCard[];
  isLoading?: boolean;
}

const PASTEL_BG_DEFAULTS = [
  'primary.light',
  'success.light',
  'warning.light',
  'secondary.light',
  'error.light',
  'info.light',
];

const ACCENT_COLOR_DEFAULTS = [
  'primary.main',
  'success.main',
  'warning.main',
  'secondary.main',
  'error.main',
  'info.main',
];

export function DataTableKpiCards({ title, action, cards, isLoading = false }: DataTableKpiCardsProps) {
  const theme = useTheme();
  if (!cards || cards.length === 0) return null;

  return (
    <Stack spacing={1.75} width="100%">
      {(title || action) && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1.5}
          width="100%"
        >
          {title ? (
            <Box sx={{ minWidth: 0 }}>
              {typeof title === 'string' ? (
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    fontSize: '1.125rem',
                    color: 'text.primary',
                    letterSpacing: '-0.2px',
                  }}
                >
                  {title}
                </Typography>
              ) : (
                title
              )}
            </Box>
          ) : (
            <Box />
          )}
          {action && (
            <Box
              sx={{
                marginInlineStart: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '12px !important',
                flexWrap: 'wrap',
                '& > :not(style)': { m: '0 !important' },
              }}
            >
              {action}
            </Box>
          )}
        </Box>
      )}

      <Box display="flex" gap={2} flexWrap="wrap" width="100%">
        {cards.map((stat, index) => {
          const fallbackBg = PASTEL_BG_DEFAULTS[index % PASTEL_BG_DEFAULTS.length];
          const fallbackColor = ACCENT_COLOR_DEFAULTS[index % ACCENT_COLOR_DEFAULTS.length];

          return (
            <Card
              key={index}
              elevation={0}
              sx={{
                backgroundColor: stat.bgcolor || fallbackBg,
                p: { xs: 1.5, sm: 1.75 },
                borderRadius: '10px',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                flex: {
                  xs: '1 1 calc(50% - 8px)',
                  sm: '1 1 calc(33.33% - 8px)',
                  md: '1 1 0',
                },
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  {isLoading ? (
                    <>
                      <Skeleton variant="text" width={48} height={28} animation="wave" />
                      <Skeleton variant="text" width={72} height={18} animation="wave" />
                    </>
                  ) : (
                    <>
                      <Typography
                        fontSize={{ xs: 18, sm: 20, md: 22 }}
                        fontWeight={700}
                        noWrap
                        sx={{ color: 'text.primary', lineHeight: 1.2, letterSpacing: '-0.3px' }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        fontSize={{ xs: 11.5, sm: 12.5 }}
                        fontWeight={500}
                        color="text.secondary"
                        noWrap
                        sx={{ mt: 0.5, lineHeight: 1.25 }}
                      >
                        {stat.label}
                      </Typography>
                    </>
                  )}
                </Box>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color || fallbackColor,
                    flexShrink: 0,
                    marginInlineStart: 1.5,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    '& svg': { width: 22, height: 22 },
                  }}
                >
                  {isLoading ? (
                    <Skeleton variant="circular" width={24} height={24} />
                  ) : (
                    stat.icon
                  )}
                </Box>
              </Stack>
            </Card>
          );
        })}
      </Box>
    </Stack>
  );
}

export default DataTableKpiCards;
