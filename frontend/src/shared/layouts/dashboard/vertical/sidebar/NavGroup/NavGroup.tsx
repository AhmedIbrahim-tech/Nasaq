'use client';

import React from 'react';
import Box from '@mui/material/Box';
import ListSubheader from '@mui/material/ListSubheader';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';

type NavGroupType = {
  navlabel?: boolean;
  subheader?: string;
};

interface NavGroupProps {
  item: NavGroupType;
  hideMenu: string | boolean;
}

const ListSubheaderStyle = styled(ListSubheader, {
  shouldForwardProp: (prop) => prop !== 'hideMenu' && prop !== 'isRtl',
})<{ hideMenu?: boolean | string; isRtl?: boolean }>(({ theme, hideMenu, isRtl }) => ({
  ...theme.typography.overline,
  fontWeight: 700,
  fontSize: '0.6875rem',
  letterSpacing: isRtl ? '0' : '0.075em',
  marginTop: theme.spacing(2.25),
  marginBottom: theme.spacing(0.5),
  color:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.42)'
      : 'rgba(15, 23, 42, 0.48)',
  lineHeight: '18px',
  minHeight: hideMenu ? '16px' : '26px',
  height: 'auto',
  paddingInline: hideMenu ? '0' : '10px',
  textTransform: 'uppercase',
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: hideMenu ? 'center' : 'flex-start',
  background: 'transparent',
  '&:first-of-type': {
    marginTop: theme.spacing(1),
  },
}));

const NavGroup = ({ item, hideMenu }: NavGroupProps) => {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === 'rtl';

  const subheaderTitle = item?.subheader
    ? item.subheader.includes('.')
      ? item.subheader
      : t.has(item.subheader as any)
      ? t(item.subheader as any)
      : item.subheader
    : '';

  if (hideMenu) {
    return (
      <Box
        component="li"
        sx={{
          listStyle: 'none',
          py: 0.75,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        aria-hidden="true"
      >
        <Box
          sx={{
            width: 24,
            height: '1px',
            bgcolor: 'divider',
            opacity: 0.6,
          }}
        />
      </Box>
    );
  }

  return (
    <ListSubheaderStyle disableSticky hideMenu={hideMenu} isRtl={isRtl}>
      {subheaderTitle}
    </ListSubheaderStyle>
  );
};

export default NavGroup;
