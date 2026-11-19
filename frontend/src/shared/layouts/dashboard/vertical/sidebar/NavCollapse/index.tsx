'use client';

import React, { useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { usePathname } from "next/navigation";

// MUI imports
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import { Theme, useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Custom imports
import NavItem from '../NavItem';
import { IconChevronDown } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { CustomizerContext } from "@/theme/customizerContext";

type NavGroupProps = {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: any;
  children?: any[];
};

interface NavCollapseProps {
  menu: NavGroupProps;
  level: number;
  pathWithoutLastPart: any;
  pathDirect: any;
  hideMenu: any;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function NavCollapse({
  menu,
  level,
  pathWithoutLastPart,
  pathDirect,
  hideMenu,
  onClick
}: NavCollapseProps) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const { isBorderRadius } = useContext(CustomizerContext);

  const Icon = menu?.icon;
  const theme = useTheme();
  const pathname = usePathname();
  const t = useTranslations();
  const isRtl = theme.direction === 'rtl';
  const isDark = theme.palette.mode === 'dark';

  const isChildActive = useCallback((children: any[]): boolean => {
    return children?.some((item: any) => {
      if (item?.href && (item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href)))) {
        return true;
      }
      if (item?.children) {
        return isChildActive(item.children);
      }
      return false;
    });
  }, [pathname]);

  const hasActiveChild = useMemo(
    () => isChildActive(menu?.children || []),
    [isChildActive, menu?.children]
  );

  const [open, setOpen] = useState(hasActiveChild);

  const menuIcon =
    level > 1 ? (
      Icon ? <Icon stroke={1.5} size={14} /> : null
    ) : (
      Icon ? <Icon stroke={1.6} size={19} /> : null
    );

  const handleClick = () => {
    setOpen(!open);
  };

  // Automatically expand parent when a child route is active
  useEffect(() => {
    if (hasActiveChild) {
      setOpen(true);
    }
  }, [hasActiveChild]);

  const localizedTitle = menu?.title
    ? menu.title.includes('.')
      ? menu.title
      : t.has(menu.title as any)
      ? t(menu.title as any)
      : menu.title
    : '';

  // In mini-sidebar mode
  if (hideMenu) {
    return (
      <Tooltip
        title={localizedTitle}
        placement={isRtl ? 'left' : 'right'}
        arrow
        enterDelay={150}
      >
        <ListItemButton
          onClick={handleClick}
          selected={hasActiveChild}
          key={menu?.id || menu?.title}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={localizedTitle}
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
            bgcolor: hasActiveChild
              ? isDark
                ? 'rgba(93, 135, 255, 0.16)'
                : 'rgba(93, 135, 255, 0.1)'
              : 'transparent',
            color: hasActiveChild
              ? theme.palette.primary.main
              : isDark
              ? '#94a3b8'
              : '#475569',
            border: hasActiveChild
              ? `1px solid ${alpha(theme.palette.primary.main, 0.25)}`
              : '1px solid transparent',
            '&:hover': {
              bgcolor: hasActiveChild
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
            {menuIcon}
          </Box>
        </ListItemButton>
      </Tooltip>
    );
  }

  // Expanded Sidebar & Mobile Drawer styling
  const indentPaddingStart =
    level > 2 ? `${level * 16}px` : level > 1 ? '32px' : '10px';

  // Render Submenu items
  const submenus = menu.children?.map((item: any) => {
    if (item.children) {
      return (
        <NavCollapse
          key={item?.id || item?.title}
          menu={item}
          level={level + 1}
          pathWithoutLastPart={pathWithoutLastPart}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={onClick}
        />
      );
    } else {
      return (
        <NavItem
          key={item?.id || item?.title}
          item={item}
          level={level + 1}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={onClick}
        />
      );
    }
  });

  return (
    <>
      <ListItemButton
        component="button"
        type="button"
        onClick={handleClick}
        selected={hasActiveChild}
        key={menu?.id || menu?.title}
        aria-expanded={open}
        aria-haspopup="true"
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
          bgcolor: hasActiveChild
            ? isDark
              ? 'rgba(93, 135, 255, 0.12)'
              : 'rgba(93, 135, 255, 0.06)'
            : open
            ? isDark
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(15, 23, 42, 0.025)'
            : 'transparent',
          color: hasActiveChild
            ? theme.palette.primary.main
            : open
            ? isDark
              ? '#f8fafc'
              : '#0f172a'
            : isDark
            ? '#94a3b8'
            : '#475569',
          fontWeight: hasActiveChild ? 600 : 500,
          '&:hover': {
            bgcolor: hasActiveChild
              ? isDark
                ? 'rgba(93, 135, 255, 0.18)'
                : 'rgba(93, 135, 255, 0.1)'
              : isDark
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(15, 23, 42, 0.04)',
            color: isDark ? '#f8fafc' : '#0f172a',
            '& .MuiListItemIcon-root': {
              color: hasActiveChild
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
        {/* Active subtle indicator for parent group */}
        {hasActiveChild && (
          <Box
            sx={{
              position: 'absolute',
              insetInlineStart: '2px',
              top: '9px',
              bottom: '9px',
              width: '3px',
              borderRadius: '4px',
              bgcolor: 'primary.main',
              opacity: 0.75,
            }}
          />
        )}

        {menuIcon && (
          <ListItemIcon
            sx={{
              minWidth: level > 1 ? '20px' : '26px',
              marginInlineEnd: '10px',
              p: 0,
              color: hasActiveChild ? theme.palette.primary.main : 'inherit',
              justifyContent: 'center',
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'color 0.15s ease',
            }}
          >
            {menuIcon}
          </ListItemIcon>
        )}

        <ListItemText
          sx={{
            textAlign: 'start',
            m: 0,
          }}
          primaryTypographyProps={{
            fontSize: level > 1 ? '0.78125rem' : '0.8125rem',
            fontWeight: hasActiveChild ? 600 : 500,
            lineHeight: isRtl ? 1.4 : 1.25,
            textAlign: 'start',
            noWrap: true,
          }}
        >
          {localizedTitle}
        </ListItemText>

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginInlineStart: 'auto',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 0.65,
            color: 'inherit',
          }}
        >
          <IconChevronDown size={15} stroke={1.75} />
        </Box>
      </ListItemButton>

      <Collapse in={open} timeout={200} unmountOnExit={false}>
        <Box sx={{ position: 'relative' }}>
          {/* Subtle guide line for nested items */}
          <Box
            sx={{
              position: 'absolute',
              insetInlineStart: '22px',
              top: 2,
              bottom: 6,
              width: '1px',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            }}
          />
          {submenus}
        </Box>
      </Collapse>
    </>
  );
}
