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
  const isDark = theme.palette.mode === 'dark';

  const isSelected = item?.href === '/'
    ? pathDirect === '/'
    : item?.exact
    ? pathDirect === item.href
    : Boolean(item?.href && (pathDirect === item.href || pathDirect.startsWith(item.href + '/')));

  const itemIcon =
    level > 1 ? (
      Icon ? <Icon stroke={1.5} size={14} /> : null
    ) : (
      Icon ? <Icon stroke={1.6} size={19} /> : null
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
            enterDelay={0}
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
                margin: '0 auto 4px auto',
                padding: 0,
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                bgcolor: isSelected
                  ? isDark
                    ? 'rgba(93, 135, 255, 0.16)'
                    : 'rgba(93, 135, 255, 0.1)'
                  : 'transparent',
                color: isSelected
                  ? theme.palette.primary.main
                  : isDark
                  ? '#94a3b8'
                  : '#475569',
                border: isSelected
                  ? `1px solid ${alpha(theme.palette.primary.main, 0.25)}`
                  : '1px solid transparent',
                '&:hover': {
                  bgcolor: isSelected
                    ? isDark
                      ? 'rgba(93, 135, 255, 0.22)'
                      : 'rgba(93, 135, 255, 0.15)'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(15, 23, 42, 0.04)',
                  color: isDark ? '#f8fafc' : '#0f172a',
                },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: '2px',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'inherit',
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

  // Expanded Sidebar & Mobile Drawer styling
  const indentPaddingStart =
    level > 2 ? `${level * 16}px` : level > 1 ? '32px' : '10px';

  return (
    <List component="li" disablePadding key={item?.id || item?.title}>
      <Link href={item.href || '#'} style={{ textDecoration: 'none', display: 'block' }}>
        <ListItemButton
          disabled={item?.disabled}
          selected={isSelected}
          aria-current={isSelected ? "page" : undefined}
          onClick={lgDown ? onClick : undefined}
          sx={{
            position: 'relative',
            whiteSpace: 'nowrap',
            minHeight: lgDown ? 42 : 38,
            maxHeight: lgDown ? 44 : 38,
            mb: '3px',
            paddingBlock: '6px',
            paddingInlineStart: indentPaddingStart,
            paddingInlineEnd: '10px',
            borderRadius: `${isBorderRadius || 8}px`,
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            bgcolor: isSelected
              ? isDark
                ? 'rgba(93, 135, 255, 0.14)'
                : 'rgba(93, 135, 255, 0.08)'
              : 'transparent',
            color: isSelected
              ? theme.palette.primary.main
              : isDark
              ? '#94a3b8'
              : '#475569',
            fontWeight: isSelected ? 600 : 500,
            '&:hover': {
              bgcolor: isSelected
                ? isDark
                  ? 'rgba(93, 135, 255, 0.2)'
                  : 'rgba(93, 135, 255, 0.12)'
                : isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(15, 23, 42, 0.04)',
              color: isSelected
                ? theme.palette.primary.main
                : isDark
                ? '#f8fafc'
                : '#0f172a',
              '& .MuiListItemIcon-root': {
                color: isSelected
                  ? theme.palette.primary.main
                  : isDark
                  ? '#f8fafc'
                  : '#0f172a',
              },
            },
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
            },
          }}
        >
          {/* Active Linear-style indicator pill on start edge */}
          {isSelected && (
            <Box
              sx={{
                position: 'absolute',
                insetInlineStart: '2px',
                top: '9px',
                bottom: '9px',
                width: '3px',
                borderRadius: '4px',
                bgcolor: 'primary.main',
              }}
            />
          )}

          {itemIcon && (
            <ListItemIcon
              sx={{
                minWidth: level > 1 ? '20px' : '26px',
                marginInlineEnd: '10px',
                p: 0,
                color: isSelected
                  ? theme.palette.primary.main
                  : 'inherit',
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
              fontSize: level > 1 ? '0.78125rem' : '0.8125rem',
              fontWeight: isSelected ? 600 : 500,
              lineHeight: isRtl ? 1.4 : 1.25,
              letterSpacing: level > 1 ? '-0.01em' : 'normal',
              textAlign: 'start',
              noWrap: true,
            }}
          >
            {localizedTitle}
            {item?.subtitle ? (
              <Typography
                variant="caption"
                display="block"
                sx={{
                  fontSize: '0.6875rem',
                  lineHeight: 1.1,
                  color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
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
