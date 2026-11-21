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
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme, alpha } from '@mui/material/styles';
import {
  IconMail,
  IconLogout,
  IconUser,
} from '@tabler/icons-react';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { useAppSelector } from '@/store/hooks';
import { useTranslations } from 'next-intl';
import { formatUserRole } from '@/shared/utils/format.utils';
import { ProfilePhotoAvatar } from '@/shared/components/avatar';

const Profile = () => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const { logout, isLoggingOut } = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const user = useAppSelector((state) => state.auth.user);
  const roles = useAppSelector((state) => state.auth.roles) || [];

  const displayName = user?.fullName || user?.email?.split('@')[0] || t('User');
  const displayEmail = user?.email || '—';
  const rawRole = roles.length > 0 ? roles[0] : 'User';
  const displayRole = formatUserRole(rawRole, t);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Tooltip title={displayName} arrow enterDelay={400}>
        <IconButton
          id="header-user-profile-button"
          size="medium"
          aria-label={t.has('User Profile') ? t('User Profile') : 'User Profile'}
          color="inherit"
          aria-controls="profile-menu"
          aria-haspopup="true"
          sx={{
            p: 0.5,
            border: '1px solid',
            borderColor: Boolean(anchorEl) ? 'primary.main' : 'divider',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
          }}
          onClick={handleOpen}
        >
          <ProfilePhotoAvatar
            photoId={user?.profilePhoto}
            name={displayName}
            size={34}
          />
        </IconButton>
      </Tooltip>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isRtl ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: isRtl ? 'left' : 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 'calc(100vw - 32px)', sm: '360px' },
              maxWidth: '380px',
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 12px 36px rgba(0,0,0,0.6)'
                  : '0 12px 36px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          {isRtl ? 'ملف المستخدم' : 'User Profile'}
        </Typography>

        <Stack direction="row" py={2.5} spacing={2} alignItems="center">
          <ProfilePhotoAvatar
            photoId={user?.profilePhoto}
            name={displayName}
            size={76}
            sx={{
              border: `2px solid ${theme.palette.divider}`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          />

          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <Tooltip title={displayName} placement="top" arrow enterDelay={300}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                noWrap
                sx={{ cursor: 'default', color: 'text.primary', lineHeight: 1.25 }}
              >
                {displayName}
              </Typography>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.35 }}>
              {user?.jobTitle || displayRole}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="flex"
              alignItems="center"
              gap={0.5}
              sx={{ mt: 0.5, minWidth: 0 }}
              noWrap
            >
              <IconMail size={14} style={{ flexShrink: 0 }} />
              <Box
                component="span"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr' }}
              >
                {displayEmail}
              </Box>
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 1 }} />

        {/* Real Functional Actions */}
        <Box sx={{ my: 1 }}>
          {/* Action 1: My Profile */}
          <Box
            component={Link}
            href="/profile"
            onClick={handleClose}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 1.25,
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'background-color 0.15s ease',
              '&:hover': {
                bgcolor: 'action.hover',
                '& .action-title': { color: 'primary.main' },
              },
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                bgcolor: 'primary.light',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconUser size={22} stroke={1.75} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                className="action-title"
                variant="subtitle2"
                fontWeight={600}
                noWrap
                sx={{ transition: 'color 0.15s ease' }}
              >
                {isRtl ? 'ملفي الشخصي' : 'My Profile'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {isRtl ? 'إعدادات الحساب والبيانات الشخصية' : 'Account settings & personal info'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Action 3: Logout Button */}
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
              borderRadius: '8px',
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {isLoggingOut
              ? (isRtl ? 'جارٍ تسجيل الخروج...' : 'Logging out...')
              : (isRtl ? 'تسجيل الخروج' : 'Logout')}
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
