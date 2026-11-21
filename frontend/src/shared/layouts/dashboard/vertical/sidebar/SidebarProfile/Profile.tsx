'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, alpha } from '@mui/material/styles';
import { IconPower } from '@tabler/icons-react';
import { CustomizerContext } from "@/theme/customizerContext";
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { useAppSelector } from '@/store/hooks';
import { useTranslations } from 'next-intl';
import { formatUserRole } from '@/shared/utils/format.utils';
import { ProfilePhotoAvatar } from '@/shared/components/avatar';

export const Profile = () => {
  const t = useTranslations();
  const theme = useTheme();
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const isRtl = theme.direction === 'rtl';
  const isDark = theme.palette.mode === 'dark';

  const { logout, isLoggingOut } = useLogout();
  const user = useAppSelector((state) => state.auth.user);
  const roles = useAppSelector((state) => state.auth.roles) || [];

  const { isSidebarHover, isCollapse, isBorderRadius } = useContext(CustomizerContext);
  const isMini = lgUp ? isCollapse === 'mini-sidebar' && !isSidebarHover : false;

  const displayName = user?.fullName || user?.email?.split('@')[0] || t('User');
  const rawRole = roles.length > 0 ? roles[0] : 'User';
  const displayRole = formatUserRole(rawRole, t);

  if (isMini) {
    return (
      <Box sx={{ m: '12px auto', display: 'flex', justifyContent: 'center' }}>
        <Tooltip
          title={`${displayName} (${displayRole})`}
          placement={isRtl ? 'left' : 'right'}
          arrow
          enterDelay={150}
        >
          <Box component={Link} href="/profile" sx={{ textDecoration: 'none', display: 'inline-block' }}>
            <ProfilePhotoAvatar
              photoId={user?.profilePhoto}
              name={displayName}
              size={40}
              sx={{
                boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.25)}`,
                border: `2px solid ${theme.palette.background.paper}`,
                transition: 'transform 0.15s ease',
                '&:hover': {
                  transform: 'scale(1.06)',
                },
              }}
            />
          </Box>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      sx={{
        mx: 1.5,
        my: 1.5,
        p: 1.25,
        borderRadius: `${isBorderRadius || 8}px`,
        bgcolor: 'secondary.light',
        transition: 'all 0.2s ease',
      }}
    >
      <Box
        component={Link}
        href="/profile"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          minWidth: 0,
          flex: 1,
          textDecoration: 'none',
          color: 'inherit',
          '&:hover': {
            '& .profile-name': {
              color: 'primary.main',
            },
          },
        }}
      >
        <ProfilePhotoAvatar
          photoId={user?.profilePhoto}
          name={displayName}
          size={38}
          sx={{
            border: `2px solid ${theme.palette.background.paper}`,
          }}
        />

        <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <Tooltip title={displayName} placement="top" arrow enterDelay={300}>
            <Typography
              className="profile-name"
              variant="subtitle2"
              fontWeight={600}
              sx={{
                color: 'text.primary',
                fontSize: '0.85rem',
                lineHeight: 1.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                transition: 'color 0.15s ease',
              }}
            >
              {displayName}
            </Typography>
          </Tooltip>
          <Tooltip title={user?.jobTitle || displayRole} placement="bottom" arrow enterDelay={400}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                fontSize: '0.75rem',
                lineHeight: 1.15,
                mt: 0.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.jobTitle || displayRole}
            </Typography>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ marginInlineStart: 'auto', flexShrink: 0 }}>
        <Tooltip title={t.has('Logout') ? t('Logout') : 'Logout'} placement="top" arrow>
          <IconButton
            color="primary"
            aria-label="logout"
            size="small"
            onClick={logout}
            disabled={isLoggingOut}
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: 'error.main',
                color: 'white',
              },
            }}
          >
            <IconPower size={17} stroke={2} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
