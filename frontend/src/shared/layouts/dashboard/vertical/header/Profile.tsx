'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import {
  IconMail,
  IconShield,
  IconLogout,
} from '@tabler/icons-react';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { useAppSelector } from '@/store/hooks';
import { useTranslations } from 'next-intl';

const Profile = () => {
  const t = useTranslations();
  const { logout, isLoggingOut } = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const user = useAppSelector((state) => state.auth.user);
  const roles = useAppSelector((state) => state.auth.roles) || [];

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '—';
  const rawRole = roles.length > 0 ? roles[0] : 'User';
  const displayRole =
    rawRole === 'PlatformSuperAdmin'
      ? (t.has('Platform Admin') ? t('Platform Admin') : 'Platform Admin')
      : rawRole === 'TenantAdmin'
      ? (t.has('Tenant Admin') ? t('Tenant Admin') : 'Tenant Admin')
      : (t.has(rawRole) ? t(rawRole) : rawRole);
  const initial = displayName.charAt(0).toUpperCase();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    {
      href: '/profile',
      title: t.has('My Profile') ? t('My Profile') : 'My Profile',
      subtitle: t.has('Account Settings') ? t('Account Settings') : 'Account Settings',
      icon: '/images/svgs/icon-account.svg',
      isLink: true,
      isPlaceholder: false,
    },
    {
      href: '#inbox',
      title: t.has('My Inbox') ? t('My Inbox') : 'My Inbox',
      subtitle: t.has('Messages & Emails') ? t('Messages & Emails') : 'Messages & Emails',
      icon: '/images/svgs/icon-inbox.svg',
      isLink: true,
      isPlaceholder: true,
    },
    {
      href: '#tasks',
      title: t.has('My Tasks') ? t('My Tasks') : 'My Tasks',
      subtitle: t.has('To-do and Daily Tasks') ? t('To-do and Daily Tasks') : 'To-do and Daily Tasks',
      icon: '/images/svgs/icon-tasks.svg',
      isLink: true,
      isPlaceholder: true,
    },
  ];

  return (
    <Box>
      <IconButton
        id="header-user-profile-button"
        size="large"
        aria-label={t.has('User Profile') ? t('User Profile') : 'User Profile'}
        color="inherit"
        aria-controls="profile-menu"
        aria-haspopup="true"
        sx={{
          ...(Boolean(anchorEl) && {
            color: 'primary.main',
          }),
        }}
        onClick={handleOpen}
      >
        <Avatar
          alt={displayName}
          sx={{
            width: 35,
            height: 35,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {initial}
        </Avatar>
      </IconButton>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: { xs: 'calc(100vw - 32px)', sm: '420px', md: '440px' },
            maxWidth: '440px',
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 3,
            boxShadow: (theme) => theme.shadows[9],
          },
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          {t.has('User Profile') ? t('User Profile') : 'User Profile'}
        </Typography>

        <Stack direction="row" py={3} spacing={2} alignItems="center">
          <Avatar
            alt={displayName}
            sx={{
              width: 90,
              height: 90,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '2rem',
              fontWeight: 700,
              flexShrink: 0,
              border: (theme) => `2px solid ${theme.palette.divider}`,
            }}
          >
            {initial}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <Tooltip title={displayName} placement="top" arrow enterDelay={300}>
              <Typography
                variant="subtitle2"
                color="textPrimary"
                fontWeight={600}
                noWrap
                sx={{ cursor: 'default' }}
              >
                {displayName}
              </Typography>
            </Tooltip>
            <Typography variant="subtitle2" color="textSecondary" noWrap sx={{ mt: 0.25 }}>
              {user?.jobTitle || displayRole}
            </Typography>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={0.75}
              sx={{ mt: 0.5, minWidth: 0 }}
              noWrap
            >
              <IconMail size={15} style={{ flexShrink: 0 }} />
              <Box
                component="span"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {displayEmail}
              </Box>
            </Typography>
            {user?.jobTitle && (
              <Box sx={{ mt: 0.75 }}>
                <Chip
                  icon={<IconShield size={12} />}
                  label={displayRole}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '0.72rem', height: 20 }}
                />
              </Box>
            )}
          </Box>
        </Stack>

        <Divider />

        {menuItems.map((item) => (
          <Box key={item.title}>
            <Box
              className="hover-text-primary"
              sx={{
                py: 1.5,
                px: 1,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={(e) => {
                if (item.isPlaceholder) {
                  e.preventDefault();
                }
                handleClose();
              }}
            >
              <Link
                href={item.href}
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={(e) => {
                  if (item.isPlaceholder) {
                    e.preventDefault();
                  }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    width="45px"
                    height="45px"
                    bgcolor="primary.light"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink="0"
                    borderRadius="8px"
                  >
                    <Avatar
                      src={item.icon}
                      alt={item.title}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 0,
                      }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="textPrimary"
                      className="text-hover"
                      noWrap
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      fontSize="12px"
                      noWrap
                    >
                      {item.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              </Link>
            </Box>
          </Box>
        ))}

        <Box mt={2}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={logout}
            disabled={isLoggingOut}
            startIcon={
              isLoggingOut ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <IconLogout size={18} />
              )
            }
            sx={{
              borderRadius: 2,
              py: 1.25,
              fontWeight: 600,
            }}
          >
            {isLoggingOut
              ? (t.has('Logging out') ? t('Logging out') : 'Logging out...')
              : (t.has('Logout') ? t('Logout') : 'Logout')}
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
