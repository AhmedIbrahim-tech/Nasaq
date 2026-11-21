'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

export interface NasaqBrandProps {
  /**
   * 'horizontal' (default): Emblem on start + Brand title and tagline on end.
   * 'vertical': Emblem centered on top + Brand title and tagline below.
   * 'compact': Emblem + Brand title only (no tagline).
   */
  variant?: 'horizontal' | 'vertical' | 'compact';
  /**
   * Height in pixels for the emblem (default: 36).
   */
  height?: number;
  /**
   * Optional custom link href (default: '/').
   */
  href?: string;
  /**
   * When true, renders a non-clickable Box container instead of Next.js Link.
   */
  noLink?: boolean;
  /**
   * Custom sx props applied to the wrapper.
   */
  sx?: any;
}

export const NasaqBrand: React.FC<NasaqBrandProps> = ({
  variant = 'horizontal',
  height = 36,
  href = '/',
  noLink = false,
  sx,
}) => {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === 'rtl';

  const brandName = isRtl ? 'نَسَق' : 'NASAQ';
  const brandTagline = isRtl
    ? 'إدارة الحضور والانصراف والقوى العاملة'
    : 'Employee Attendance & Workforce';

  const emblem = (
    <Box
      component="img"
      src="/images/logos/logoIcon.svg"
      alt="NASAQ Emblem"
      sx={{
        height,
        width: height,
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'block',
        userSelect: 'none',
        flexShrink: 0,
      }}
    />
  );

  const brandText = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: variant === 'vertical' ? 'center' : 'flex-start',
        gap: variant === 'vertical' ? 0.5 : 0.2,
        minWidth: 0,
        textAlign: variant === 'vertical' ? 'center' : 'start',
      }}
    >
      <Typography
        component="span"
        sx={{
          fontWeight: 800,
          fontSize: variant === 'compact' ? '1.15rem' : '1.35rem',
          letterSpacing: isRtl ? '0' : '-0.02em',
          color: 'text.primary',
          lineHeight: 1.2,
          display: 'block',
          whiteSpace: 'nowrap',
          textAlign: variant === 'vertical' ? 'center' : 'start',
        }}
      >
        {brandName}
      </Typography>

      {variant !== 'compact' && (
        <Typography
          component="span"
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: '0.72rem',
            letterSpacing: isRtl ? '0' : '0.02em',
            color: 'text.secondary',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            display: 'block',
            textAlign: variant === 'vertical' ? 'center' : 'start',
          }}
        >
          {brandTagline}
        </Typography>
      )}
    </Box>
  );

  const innerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: variant === 'vertical' ? 'column' : 'row',
        alignItems: 'center',
        gap: variant === 'vertical' ? 1.25 : 1.5,
        minWidth: 0,
      }}
    >
      {emblem}
      {brandText}
    </Box>
  );

  if (noLink) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          minWidth: 0,
          ...sx,
        }}
      >
        {innerContent}
      </Box>
    );
  }

  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
        minWidth: 0,
        transition: 'opacity 0.2s ease',
        '&:hover': {
          opacity: 0.9,
        },
        ...sx,
      }}
    >
      {innerContent}
    </Box>
  );
};

export default NasaqBrand;
