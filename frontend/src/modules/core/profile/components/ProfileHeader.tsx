'use client';

import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme, alpha } from '@mui/material/styles';
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
  IconCamera,
  IconTrash,
  IconPhoto,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { useAppDispatch } from '@/store/hooks';
import { updateUserProfile } from '@/modules/auth/slices/auth.slice';
import { notify } from '@/shared/services/notification.service';
import { RoleNames } from '@/shared/constants/roles';
import { employeeService } from '@/modules/employees/services/employee.service';
import { broadcastPhotoInvalidation, setCachedPhotoBlob } from '@/shared/hooks/useAuthenticatedPhotoUrl';
import { ProfilePhotoAvatar } from '@/shared/components/avatar';
import { ConfirmActionDialog } from '@/shared/components/dialogs/ConfirmActionDialog';
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
  const isRtl = theme.direction === 'rtl';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoMenuAnchor, setPhotoMenuAnchor] = useState<null | HTMLElement>(null);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const displayName = user?.fullName || user?.email?.split('@')[0] || t('User');
  const displayEmail = user?.email || '—';
  const displayPhone = user?.phoneNumber || null;

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
    ? (t.has('Platform Account Scope') ? t('Platform Account Scope') : 'Platform Account Scope')
    : selectedCompanyName || (t.has('Tenant Account Scope') ? t('Tenant Account Scope') : 'Tenant Account Scope');

  // Revoke preview object URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handlePhotoActionClick = (e: React.MouseEvent<HTMLElement>) => {
    if (user?.profilePhoto) {
      setPhotoMenuAnchor(e.currentTarget);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleMenuClose = () => {
    setPhotoMenuAnchor(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected if needed
    e.target.value = '';

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify.error(isRtl ? 'حجم الصورة يتجاوز الحد الأقصى (5 ميجابايت)' : 'Profile photo size exceeds the 5 MB limit.');
      return;
    }

    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      notify.error(isRtl ? 'يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)' : 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    // Local instant preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsPhotoProcessing(true);

    try {
      const updatedEmployee = await employeeService.updateMyPhoto({ photo: file });
      if (updatedEmployee.profilePhoto) {
        setCachedPhotoBlob(updatedEmployee.profilePhoto, localUrl);
      }
      broadcastPhotoInvalidation(user?.profilePhoto);
      dispatch(updateUserProfile({ profilePhoto: updatedEmployee.profilePhoto }));
      notify.success(isRtl ? 'تم تحديث الصورة الشخصية بنجاح' : 'Profile photo updated successfully.');
    } catch (err: any) {
      notify.error(err.message || (isRtl ? 'فشل تحديث الصورة الشخصية' : 'Failed to update profile photo.'));
      // Restore previous photo state
      setPreviewUrl(null);
    } finally {
      setIsPhotoProcessing(false);
      setPreviewUrl(null);
    }
  };

  const handleConfirmRemovePhoto = async () => {
    setConfirmDeleteOpen(false);
    setIsPhotoProcessing(true);

    try {
      await employeeService.updateMyPhoto({ removePhoto: true });
      broadcastPhotoInvalidation(user?.profilePhoto);
      dispatch(updateUserProfile({ profilePhoto: null }));
      notify.success(isRtl ? 'تم حذف الصورة الشخصية بنجاح' : 'Profile photo removed successfully.');
    } catch (err: any) {
      notify.error(err.message || (isRtl ? 'فشل حذف الصورة الشخصية' : 'Failed to remove profile photo.'));
    } finally {
      setIsPhotoProcessing(false);
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
        {/* Profile Avatar with Photo Edit Overlay */}
        <Box sx={{ flexShrink: 0, position: 'relative', display: 'inline-block' }}>
          <ProfilePhotoAvatar
            photoId={user?.profilePhoto}
            src={previewUrl}
            name={displayName}
            size={96}
            sx={{
              border: (theme) => `3px solid ${theme.palette.background.paper}`,
              boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          />

          {/* Uploading Spinner Overlay */}
          {isPhotoProcessing && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                bgcolor: 'rgba(0, 0, 0, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              <CircularProgress size={32} sx={{ color: 'white' }} />
            </Box>
          )}

          {/* Photo Action Camera Button */}
          <Tooltip
            title={
              user?.profilePhoto
                ? (isRtl ? 'تغيير أو حذف الصورة' : 'Change or remove photo')
                : (isRtl ? 'إضافة صورة شخصية' : 'Add profile photo')
            }
            arrow
          >
            <IconButton
              onClick={handlePhotoActionClick}
              disabled={isPhotoProcessing}
              sx={{
                position: 'absolute',
                bottom: 2,
                insetInlineEnd: 2,
                bgcolor: 'primary.main',
                color: 'white',
                width: 32,
                height: 32,
                border: (theme) => `2px solid ${theme.palette.background.paper}`,
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.08)',
                },
              }}
              size="small"
            >
              <IconCamera size={16} stroke={2} />
            </IconButton>
          </Tooltip>

          {/* Hidden File Picker Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
          />

          {/* Photo Options Menu (Change / Remove) */}
          <Menu
            anchorEl={photoMenuAnchor}
            open={Boolean(photoMenuAnchor)}
            onClose={handleMenuClose}
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
                  borderRadius: '10px',
                  minWidth: 160,
                  p: 0.5,
                  boxShadow: (theme) => theme.shadows[4],
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                fileInputRef.current?.click();
              }}
              sx={{ borderRadius: '6px', py: 1 }}
            >
              <ListItemIcon>
                <IconPhoto size={18} />
              </ListItemIcon>
              <ListItemText primary={isRtl ? 'تغيير الصورة' : 'Change Photo'} />
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                setConfirmDeleteOpen(true);
              }}
              sx={{ borderRadius: '6px', py: 1, color: 'error.main' }}
            >
              <ListItemIcon sx={{ color: 'error.main' }}>
                <IconTrash size={18} />
              </ListItemIcon>
              <ListItemText primary={isRtl ? 'حذف الصورة' : 'Remove Photo'} />
            </MenuItem>
          </Menu>
        </Box>

        {/* User Identity Details */}
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

        {/* Action Buttons */}
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

      {/* Confirmation Dialog for Photo Removal */}
      <ConfirmActionDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmRemovePhoto}
        title={isRtl ? 'حذف الصورة الشخصية؟' : 'Remove Profile Photo?'}
        message={isRtl ? 'هل أنت متأكد من رغبتك في حذف صورتك الشخصية؟ ستتم استعادة الرمز الافتراضي.' : 'Are you sure you want to remove your profile photo? Your default initials avatar will be restored.'}
        variant="error"
        confirmLabel={isRtl ? 'حذف الصورة' : 'Remove Photo'}
        cancelLabel={isRtl ? 'إلغاء' : 'Cancel'}
        isLoading={isPhotoProcessing}
      />
    </Card>
  );
}
