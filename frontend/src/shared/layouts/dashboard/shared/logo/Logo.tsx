'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { CustomizerContext } from '@/theme/customizerContext';

export interface LogoProps {
  /**
   * 'horizontal' (default): Emblem on start + wordmark on end.
   * 'vertical': Emblem centered on top + wordmark centered below.
   * 'icon-only': Only the 3D ribbon S emblem.
   * 'auto': Automatically switches to 'icon-only' when sidebar is mini/collapsed.
   */
  variant?: 'auto' | 'horizontal' | 'vertical' | 'icon-only';
  /**
   * Explicit theme mode ('light' | 'dark'). If omitted, uses active theme mode.
   */
  mode?: 'light' | 'dark';
  /**
   * Height in pixels or CSS string.
   */
  height?: number | string;
  /**
   * Optional custom link href (default: '/')
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

const LinkStyled = styled(Link)(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  textDecoration: 'none',
  transition: 'opacity 0.2s ease-in-out',
  '&:hover': {
    opacity: 0.88,
  },
}));

export const Logo: React.FC<LogoProps> = ({
  variant = 'auto',
  mode,
  height,
  href = '/',
  noLink = false,
  sx,
}) => {
  const theme = useTheme();
  const { isCollapse, isSidebarHover } = useContext(CustomizerContext);
  const isDark = (mode || theme.palette.mode) === 'dark';
  const isRtl = theme.direction === 'rtl';

  const isMini = isCollapse === 'mini-sidebar' && !isSidebarHover;
  const activeVariant =
    variant === 'auto' ? (isMini ? 'icon-only' : 'horizontal') : variant;

  let logoSrc = '';
  let defaultHeight = 36;

  if (activeVariant === 'icon-only') {
    logoSrc = '/images/logos/logoIcon.svg';
    defaultHeight = 34;
  } else if (activeVariant === 'vertical') {
    logoSrc = isDark
      ? '/images/logos/dark-logo.svg'
      : '/images/logos/light-logo.svg';
    defaultHeight = 40;
  } else {
    // horizontal
    if (isRtl) {
      logoSrc = isDark
        ? '/images/logos/dark-rtl-logo.svg'
        : '/images/logos/light-logo-rtl.svg';
    } else {
      logoSrc = isDark
        ? '/images/logos/dark-logo.svg'
        : '/images/logos/light-logo.svg';
    }
    defaultHeight = 36;
  }

  const finalHeight = height || defaultHeight;

  const content = (
    <Box
      component="img"
      src={logoSrc}
      alt="Nasaq Logo"
      sx={{
        height: finalHeight,
        width: 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'block',
        userSelect: 'none',
      }}
    />
  );

  if (noLink) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: activeVariant === 'icon-only' ? 'center' : 'flex-start',
          ...sx,
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <LinkStyled
      href={href}
      sx={{
        height: '100%',
        width: isMini && variant === 'auto' ? '100%' : 'auto',
        justifyContent: isMini && variant === 'auto' ? 'center' : 'flex-start',
        ...sx,
      }}
    >
      {content}
    </LinkStyled>
  );
};

export default Logo;
