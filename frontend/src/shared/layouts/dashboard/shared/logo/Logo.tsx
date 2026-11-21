'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { CustomizerContext } from '@/theme/customizerContext';
import { NasaqBrand } from '@/modules/auth/components/NasaqBrand';

export interface LogoProps {
  /**
   * 'horizontal' (default): Emblem on start + NASAQ brand name on end.
   * 'compact': Compact emblem + title without tagline.
   * 'icon-only': Only the emblem.
   * 'auto': Automatically switches to 'icon-only' when sidebar is mini/collapsed.
   */
  variant?: 'auto' | 'horizontal' | 'compact' | 'icon-only';
  height?: number | string;
  href?: string;
  noLink?: boolean;
  sx?: any;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'auto',
  height,
  href = '/',
  noLink = false,
  sx,
}) => {
  const theme = useTheme();
  const { isCollapse, isSidebarHover } = useContext(CustomizerContext);
  const isMini = isCollapse === 'mini-sidebar' && !isSidebarHover;

  const activeVariant =
    variant === 'auto' ? (isMini ? 'icon-only' : 'compact') : variant;

  if (activeVariant === 'icon-only') {
    const emblem = (
      <Box
        component="img"
        src="/images/logos/logoIcon.svg"
        alt="NASAQ"
        sx={{
          height: height || 32,
          width: 'auto',
          display: 'block',
          userSelect: 'none',
        }}
      />
    );

    if (noLink) {
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...sx }}>
          {emblem}
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
          justifyContent: 'center',
          textDecoration: 'none',
          transition: 'opacity 0.2s ease',
          '&:hover': { opacity: 0.85 },
          ...sx,
        }}
      >
        {emblem}
      </Box>
    );
  }

  return (
    <NasaqBrand
      variant="compact"
      height={typeof height === 'number' ? height : 32}
      href={href}
      noLink={noLink}
      sx={sx}
    />
  );
};

export default Logo;
