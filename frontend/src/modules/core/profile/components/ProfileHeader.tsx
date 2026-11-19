'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import {
  IconMail,
  IconShield,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconPhone,
  IconLogout,
  IconRefresh,
  IconUserEdit,
  IconBuilding,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { useAppDispatch } from '@/store/hooks';
import { updateUserProfile } from '@/modules/auth/slices/auth.slice';
import { uploadMyAvatar, removeMyAvatar } from '@/modules/auth/services/auth.service';
import { ImageUploader } from '@/shared/components/upload/ImageUploader';
import { notify } from '@/shared/services/notification.service';
import { RoleNames } from '@/shared/constants/roles';
import type { CurrentUserResponse, AuthUserResponse } from '@/modules/auth/types';

interface ProfileHeaderProps {
  user: (CurrentUserResponse | AuthUserResponse) | null;
  roles: string[];
  accessToken: string | null;
  selectedCompanyName?: string | null;
  selectedBranchName?: string | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  isPreviewActive: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  onNavigateToTab: (tabIndex: number) => void;
}

export function ProfileHeader({
  user,
  roles,
  accessToken,
  selectedCompanyName,
  selectedBranchName,
  isLoading,
  isLoggingOut,
  isPreviewActive,
  onRefresh,
  onLogout,
  onNavigateToTab,
}: ProfileHeaderProps) {
  const t = useTranslations();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const displayName = user?.fullName || user?.email?.split('@')[0] || t('User');
  const displayEmail = user?.email || '—';
  const displayPhone = user?.phoneNumber || null;
  const initial = displayName.charAt(0).toUpperCase();

  const isPlatformSuperAdmin = roles.includes(RoleNames.SuperAdmin);
  const isPlatformStaff = roles.includes(RoleNames.Admin);
  const isPlatformUser = isPlatformSuperAdmin || isPlatformStaff;

  const rawRole = roles.length > 0 ? roles[0] : 'User';
  const roleLabel =
    rawRole === 'SuperAdmin'
      ? (t.has('SuperAdmin') ? t('SuperAdmin') : 'Super Admin')
      : rawRole === 'Admin'
      ? (t.has('Admin') ? t('Admin') : 'Admin')
      : (t.has(rawRole) ? t(rawRole) : rawRole);

  const orgName = isPlatformUser
    ? t('Platform Account Scope')
    : selectedCompanyName || t('Tenant Account Scope');

  const handleAvatarUpload = async (file: File) => {
    if (isPreviewActive) {
      notify.warning(t.has('ActionDisabledInPreview') ? t('ActionDisabledInPreview') : 'Action disabled in preview mode');
      return;
    }
    try {
      const url = await uploadMyAvatar(file, accessToken);
      if (user) {
        dispatch(updateUserProfile({ ...user, profileImagePath: url, avatarUrl: url }));
        notify.success(t('ProfileUpdatedSuccess'));
      }
    } catch (err: any) {
      notify.error(err.message || t('Error'));
    }
  };

  const handleAvatarRemove = async () => {
    if (isPreviewActive) {
      notify.warning(t.has('ActionDisabledInPreview') ? t('ActionDisabledInPreview') : 'Action disabled in preview mode');
      return;
    }
    try {
      await removeMyAvatar(accessToken);
      if (user) {
        dispatch(updateUserProfile({ ...user, profileImagePath: null, avatarUrl: null }));
        notify.success(t('ProfileUpdatedSuccess'));
      }
    } catch (err: any) {
      notify.error(err.message || t('Error'));
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '12px',
        p: { xs: 2.5, sm: 3 },
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2.5, md: 3 }}
        alignItems={{ xs: 'center', md: 'flex-start' }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <ImageUploader
            currentImageUrl={user?.avatarUrl || user?.profileImagePath}
            shape="circular"
            size={92}
            fallbackInitial={initial}
            onUpload={handleAvatarUpload}
            onRemove={handleAvatarRemove}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, textAlign: { xs: 'center', md: 'start' } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'center', sm: 'center' }}
            justifyContent={{ xs: 'center', md: 'flex-start' }}
            flexWrap="wrap"
          >
            <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {displayName}
            </Typography>

            <Chip
              icon={<IconShield size={14} />}
              label={roleLabel}
              size="small"
              color={isPlatformUser ? 'secondary' : 'primary'}
              sx={{ fontWeight: 600, fontSize: '0.8rem', height: 26 }}
            />

            <Chip
              label={isPlatformUser ? t('PlatformRootAuthority') : t('TenantUserScope')}
              size="small"
              variant="outlined"
              color={isPlatformUser ? 'secondary' : 'default'}
              sx={{ fontWeight: 600, fontSize: '0.75rem', height: 26 }}
            />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 2.5 }}
            mt={1.5}
            alignItems={{ xs: 'center', md: 'flex-start' }}
            justifyContent={{ xs: 'center', md: 'flex-start' }}
            color="text.secondary"
            flexWrap="wrap"
            useFlexGap
          >
            <Typography
              variant="body2"
              display="flex"
              alignItems="center"
              gap={0.75}
            >
              <IconMail size={16} />
              <bdi dir="ltr">{displayEmail}</bdi>
            </Typography>

            {displayPhone && (
              <Typography
                variant="body2"
                display="flex"
                alignItems="center"
                gap={0.75}
              >
                <IconPhone size={16} />
                <bdi dir="ltr">{displayPhone}</bdi>
              </Typography>
            )}

            <Typography variant="body2" display="flex" alignItems="center" gap={0.75}>
              <IconBuilding size={16} />
              {orgName}
              {selectedBranchName && ` (${selectedBranchName})`}
            </Typography>

            {user?.jobTitle && (
              <Typography variant="body2" display="flex" alignItems="center" gap={0.75}>
                <IconBriefcase size={16} />
                {user.jobTitle}
              </Typography>
            )}

            {user?.department && (
              <Typography variant="body2" display="flex" alignItems="center" gap={0.75}>
                <IconBuildingSkyscraper size={16} />
                {user.department}
              </Typography>
            )}
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={1.25}
          flexWrap="wrap"
          justifyContent={{ xs: 'center', md: 'flex-end' }}
          sx={{ width: { xs: '100%', md: 'auto' }, pt: { xs: 1, md: 0 } }}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<IconUserEdit size={16} />}
            onClick={() => onNavigateToTab(1)}
            disabled={isPreviewActive}
            sx={{ borderRadius: '7px', textTransform: 'none', fontWeight: 600 }}
          >
            {t('Edit Profile')}
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={onRefresh}
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <IconRefresh size={16} />
              )
            }
            sx={{ borderRadius: '7px', textTransform: 'none', fontWeight: 600 }}
          >
            {t('Refresh')}
          </Button>

          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={onLogout}
            disabled={isLoggingOut}
            startIcon={
              isLoggingOut ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <IconLogout size={16} />
              )
            }
            sx={{ borderRadius: '7px', textTransform: 'none', fontWeight: 600 }}
          >
            {t('Logout')}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
