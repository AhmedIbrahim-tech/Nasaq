'use client';

import React, { useContext } from 'react';
import Link from 'next/link';

// MUI imports
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme, styled, useTheme, alpha } from '@mui/material/styles';

import { useTranslations } from 'next-intl';
import { CustomizerContext } from "@/theme/customizerContext";

type NavGroup = {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: any;
  children?: NavGroup[];
  chip?: string;
  chipColor?: any;
  variant?: string | any;
  external?: boolean;
  level?: number;
  onClick?: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

interface ItemType {
  item: NavGroup;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  hideMenu?: any;
  level?: number | any;
  pathDirect: string;
}

export default function NavItem({ item, level = 1, pathDirect, hideMenu, onClick }: ItemType) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const { isBorderRadius } = useContext(CustomizerContext);

  const Icon = item?.icon;
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === 'rtl';

  const isSelected = item?.href === '/'
    ? pathDirect === '/'
    : item?.exact
    ? pathDirect === item.href
    : Boolean(item?.href && (pathDirect === item.href || pathDirect.startsWith(item.href + '/')));

  const itemIcon =
    level > 1 ? (
      Icon ? <Icon stroke={1.5} size={15} /> : null
    ) : (
      Icon ? <Icon stroke={1.75} size={20} /> : null
    );

  const localizedTitle = item?.title
    ? item.title.includes('.')
      ? item.title
      : t.has(item.title as any)
      ? t(item.title as any)
      : item.title
    : '';

  // Compact mini-sidebar styling
  if (hideMenu) {
    return (
      <List component="li" disablePadding key={item?.id || item?.title}>
        <Link href={item.href || '#'} style={{ textDecoration: 'none', display: 'block' }}>
          <Tooltip
            title={localizedTitle}
            placement={isRtl ? 'left' : 'right'}
            arrow
            enterDelay={100}
            leaveDelay={100}
          >
            <ListItemButton
              disabled={item?.disabled}
              selected={isSelected}
              aria-current={isSelected ? "page" : undefined}
              onClick={lgDown ? onClick : undefined}
              sx={{
                width: 44,
                height: 40,
                minHeight: 40,
                maxHeight: 40,
                margin: '0 auto 6px auto',
                padding: 0,
                borderRadius: `${isBorderRadius || 8}px`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                bgcolor: isSelected ? 'primary.main' : 'transparent',
                color: isSelected ? 'common.white' : 'text.secondary',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: isSelected ? 'primary.main' : 'primary.light',
                  color: isSelected ? 'common.white' : 'primary.main',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? 'white !important' : 'inherit',
                }}
              >
                {itemIcon}
              </Box>
            </ListItemButton>
          </Tooltip>
        </Link>
      </List>
    );
  }

  // Expanded Sidebar & Mobile Drawer styling (Authentic Modernize Design)
  const indentPaddingStart =
    level > 2 ? `${level * 16}px` : level > 1 ? '32px' : '14px';

  return (
    <List component="li" disablePadding key={item?.id || item?.title}>
      <Link href={item.href || '#'} style={{ textDecoration: 'none', display: 'block' }}>
        <ListItemButton
          disabled={item?.disabled}
          selected={isSelected}
          aria-current={isSelected ? "page" : undefined}
          onClick={lgDown ? onClick : undefined}
          sx={{
            whiteSpace: 'nowrap',
            minHeight: 42,
            mb: '2px',
            paddingBlock: '8px',
            paddingInlineStart: indentPaddingStart,
            paddingInlineEnd: '12px',
            borderRadius: `${isBorderRadius || 8}px`,
            transition: 'all 0.15s ease-in-out',
            bgcolor: isSelected ? 'primary.main' : 'transparent',
            color: isSelected ? 'common.white' : 'text.secondary',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: isSelected ? 'primary.main' : 'primary.light',
              color: isSelected ? 'common.white' : 'primary.main',
              '& .MuiListItemIcon-root': {
                color: isSelected ? 'white !important' : 'primary.main',
              },
            },
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'common.white',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'common.white',
              },
              '& .MuiListItemIcon-root': {
                color: 'white !important',
              },
            },
          }}
        >
          {itemIcon && (
            <ListItemIcon
              sx={{
                minWidth: level > 1 ? '24px' : '36px',
                marginInlineEnd: '8px',
                p: '3px 0',
                color: isSelected ? 'white !important' : 'inherit',
                justifyContent: 'center',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'color 0.15s ease',
              }}
            >
              {itemIcon}
            </ListItemIcon>
          )}

          <ListItemText
            sx={{
              textAlign: 'start',
              m: 0,
            }}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: isSelected ? 600 : 500,
              lineHeight: isRtl ? 1.4 : 1.3,
              textAlign: 'start',
              color: isSelected ? 'white !important' : 'inherit',
              noWrap: true,
            }}
          >
            {localizedTitle}
            {item?.subtitle ? (
              <Typography
                variant="caption"
                display="block"
                sx={{
                  fontSize: '0.72rem',
                  lineHeight: 1.1,
                  color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                  mt: 0.25,
                  textAlign: 'start',
                }}
              >
                {item.subtitle}
              </Typography>
            ) : null}
          </ListItemText>

          {item?.chip ? (
            <Chip
              color={item?.chipColor || 'primary'}
              variant={item?.variant ? item?.variant : 'filled'}
              size="small"
              label={item?.chip}
              sx={{
                height: 20,
                fontSize: '0.6875rem',
                fontWeight: 600,
                marginInlineStart: 'auto',
              }}
            />
          ) : null}
        </ListItemButton>
      </Link>
    </List>
  );
}
