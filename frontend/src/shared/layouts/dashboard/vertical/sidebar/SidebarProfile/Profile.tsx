'use client';

import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, alpha } from '@mui/material/styles';
import { IconPower, IconMoon, IconSun } from '@tabler/icons-react';
import { CustomizerContext } from "@/theme/customizerContext";
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { useAppSelector } from '@/store/hooks';
import { useTranslations } from 'next-intl';
import { formatUserRole } from '@/shared/utils/format.utils';

export const Profile = () => {
  const t = useTranslations();
  const theme = useTheme();
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const isRtl = theme.direction === 'rtl';
  const isDark = theme.palette.mode === 'dark';

  const { logout, isLoggingOut } = useLogout();
  const user = useAppSelector((state) => state.auth.user);
  const roles = useAppSelector((state) => state.auth.roles) || [];

  const { isSidebarHover, isCollapse, activeMode, setActiveMode } = useContext(CustomizerContext);
  const isMini = lgUp ? isCollapse === 'mini-sidebar' && !isSidebarHover : false;

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const rawRole = roles.length > 0 ? roles[0] : 'User';
  const displayRole = formatUserRole(rawRole, t);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent={isMini ? "center" : "flex-start"}
      gap={1}
      sx={{
        m: isMini ? '8px auto' : '8px 10px 10px 10px',
        p: isMini ? '6px 4px' : '7px 9px',
        borderRadius: '10px',
        bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.025)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)'}`,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        width: isMini ? 44 : 'auto',
      }}
    >
      <Tooltip
        title={isMini ? `${displayName} (${displayRole})` : ''}
        placement={isRtl ? 'left' : 'right'}
        arrow
        enterDelay={150}
      >
        <Avatar
          alt={displayName}
          sx={{
            height: 34,
            width: 34,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '0.8125rem',
            fontWeight: 700,
            flexShrink: 0,
            boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.25)}`,
            border: `1.5px solid ${theme.palette.background.paper}`,
          }}
        >
          {initial}
        </Avatar>
      </Tooltip>

      {!isMini && (
        <>
          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <Tooltip title={`${displayName} — ${displayRole}`} placement="top" arrow enterDelay={250}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{
                  color: 'text.primary',
                  fontSize: '0.8125rem',
                  lineHeight: isRtl ? 1.35 : 1.25,
                  cursor: 'default',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {displayName}
              </Typography>
            </Tooltip>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                fontSize: '0.6875rem',
                lineHeight: 1.15,
                mt: 0.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayRole}
            </Typography>
          </Box>

          <Box sx={{ marginInlineStart: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip
              title={
                activeMode === 'dark'
                  ? (t.has('Light Mode') ? t('Light Mode') : 'Light Mode')
                  : (t.has('Dark Mode') ? t('Dark Mode') : 'Dark Mode')
              }
              placement="top"
              arrow
            >
              <IconButton
                id="sidebar-theme-toggle"
                color="inherit"
                aria-label={activeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                size="small"
                onClick={() => setActiveMode(activeMode === 'dark' ? 'light' : 'dark')}
                sx={{
                  width: 28,
                  height: 28,
                  p: 0,
                  borderRadius: '6px',
                  color: 'text.secondary',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(93, 135, 255, 0.2)' : 'rgba(93, 135, 255, 0.12)',
                    color: 'primary.main',
                  },
                }}
              >
                {activeMode === 'dark' ? <IconSun size={15} stroke={1.75} /> : <IconMoon size={15} stroke={1.75} />}
              </IconButton>
            </Tooltip>

            <Tooltip title={t.has('Logout') ? t('Logout') : 'Logout'} placement="top" arrow>
              <IconButton
                color="inherit"
                aria-label="logout"
                size="small"
                onClick={logout}
                disabled={isLoggingOut}
                sx={{
                  width: 28,
                  height: 28,
                  p: 0,
                  borderRadius: '6px',
                  color: 'text.secondary',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.1)',
                    color: 'error.main',
                  },
                }}
              >
                <IconPower size={15} stroke={1.75} />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  );
};
