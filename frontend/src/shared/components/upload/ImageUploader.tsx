'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import {
  IconCamera,
  IconUpload,
  IconTrash,
  IconCheck,
  IconX,
  IconUser,
  IconBuildingSkyscraper,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { getImageUrl } from '@/shared/utils/image.utils';
import { notify } from '@/shared/services/notification.service';

export interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<string | void>;
  onRemove?: () => Promise<void>;
  shape?: 'circular' | 'rounded';
  size?: number;
  title?: string;
  helperText?: string;
  fallbackInitial?: string;
  fallbackIcon?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  maxSizeBytes?: number;
  allowedExtensions?: string[];
}

export function ImageUploader({
  currentImageUrl,
  onUpload,
  onRemove,
  shape = 'circular',
  size = 96,
  title,
  helperText,
  fallbackInitial,
  fallbackIcon,
  disabled = false,
  readOnly = false,
  maxSizeBytes = 2 * 1024 * 1024, // 2 MB
  allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'],
}: ImageUploaderProps) {
  const t = useTranslations();
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isInteractive = !readOnly && !disabled;

  const handleOpenFileDialog = () => {
    if (!isInteractive || isUploading || isRemoving) return;
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);

    // 1. Check file size
    if (file.size > maxSizeBytes) {
      const errorMsg = t.has('ImageSizeExceeded')
        ? t('ImageSizeExceeded')
        : 'File size exceeds the 2 MB limit.';
      setValidationError(errorMsg);
      notify.error(errorMsg);
      return;
    }

    // 2. Check extension
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      const errorMsg = t.has('ImageInvalidFormat')
        ? t('ImageInvalidFormat')
        : 'Only JPG, PNG, and WebP images are allowed.';
      setValidationError(errorMsg);
      notify.error(errorMsg);
      return;
    }

    // 3. Set preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
    setValidationError(null);
  };

  const handleConfirmUpload = async () => {
    if (!previewFile) return;

    setIsUploading(true);
    setValidationError(null);
    try {
      await onUpload(previewFile);
      notify.success(
        t.has('ImageUploadedSuccess')
          ? t('ImageUploadedSuccess')
          : 'Image uploaded successfully.'
      );
      handleCancelPreview();
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        (t.has('ImageUploadFailed') ? t('ImageUploadFailed') : 'Failed to upload image.');
      setValidationError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!onRemove) return;

    setIsRemoving(true);
    setValidationError(null);
    try {
      await onRemove();
      setConfirmRemoveOpen(false);
      handleCancelPreview();
      notify.success(
        t.has('ImageRemovedSuccess')
          ? t('ImageRemovedSuccess')
          : 'Image removed successfully.'
      );
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        (t.has('ImageRemoveFailed') ? t('ImageRemoveFailed') : 'Failed to remove image.');
      setValidationError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setIsRemoving(false);
    }
  };

  // Determine active display source
  const activeImageSrc = previewUrl || (currentImageUrl ? getImageUrl(currentImageUrl) : undefined);
  const hasExistingImage = Boolean(currentImageUrl);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={!isInteractive || isUploading || isRemoving}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2.5}
        alignItems={{ xs: 'center', sm: 'center' }}
      >
        {/* Avatar / Image Preview Container */}
        <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <Avatar
            src={activeImageSrc}
            variant={shape === 'rounded' ? 'rounded' : 'circular'}
            sx={{
              width: size,
              height: size,
              bgcolor: 'primary.light',
              color: 'primary.main',
              fontSize: size * 0.35,
              fontWeight: 700,
              borderRadius: shape === 'rounded' ? 3 : '50%',
              border: (th) => `2px solid ${th.palette.divider}`,
              boxShadow: (th) => (previewUrl ? `0 0 0 3px ${th.palette.primary.main}40` : 'none'),
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {fallbackInitial ? (
              fallbackInitial.toUpperCase()
            ) : fallbackIcon ? (
              fallbackIcon
            ) : shape === 'rounded' ? (
              <IconBuildingSkyscraper size={size * 0.45} />
            ) : (
              <IconUser size={size * 0.45} />
            )}
          </Avatar>

          {/* Loading Overlay */}
          {(isUploading || isRemoving) && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.45)',
                borderRadius: shape === 'rounded' ? 3 : '50%',
                zIndex: 2,
              }}
            >
              <CircularProgress size={size * 0.35} sx={{ color: '#fff' }} />
            </Box>
          )}

          {/* Quick Camera Badge Button (When not previewing and not read-only) */}
          {isInteractive && !previewUrl && (
            <Tooltip
              title={
                hasExistingImage
                  ? t.has('Change Image')
                    ? t('Change Image')
                    : 'Change Image'
                  : t.has('Upload Image')
                  ? t('Upload Image')
                  : 'Upload Image'
              }
            >
              <IconButton
                size="small"
                onClick={handleOpenFileDialog}
                disabled={isUploading || isRemoving}
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  insetInlineEnd: -4,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  boxShadow: (th) => th.shadows[3],
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <IconCamera size={16} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Action Controls & Description */}
        <Box sx={{ flex: 1, minWidth: 0, textAlign: { xs: 'center', sm: 'start' } }}>
          {title && (
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {title}
            </Typography>
          )}

          {previewUrl ? (
            /* Confirm or Cancel Upload Controls */
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
              justifyContent={{ xs: 'center', sm: 'flex-start' }}
              sx={{ mt: 0.5 }}
            >
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<IconCheck size={16} />}
                onClick={handleConfirmUpload}
                disabled={isUploading}
              >
                {t.has('Save') ? t('Save') : 'Save'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<IconX size={16} />}
                onClick={handleCancelPreview}
                disabled={isUploading}
              >
                {t.has('Cancel') ? t('Cancel') : 'Cancel'}
              </Button>
            </Stack>
          ) : (
            /* Normal Action Buttons */
            isInteractive && (
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                alignItems="center"
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
                sx={{ mt: 0.5 }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconUpload size={16} />}
                  onClick={handleOpenFileDialog}
                  disabled={isUploading || isRemoving}
                >
                  {hasExistingImage
                    ? t.has('Replace')
                      ? t('Replace')
                      : 'Replace'
                    : t.has('Upload')
                    ? t('Upload')
                    : 'Upload'}
                </Button>

                {hasExistingImage && onRemove && (
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    startIcon={<IconTrash size={16} />}
                    onClick={() => setConfirmRemoveOpen(true)}
                    disabled={isUploading || isRemoving}
                  >
                    {t.has('Remove') ? t('Remove') : 'Remove'}
                  </Button>
                )}
              </Stack>
            )
          )}

          {/* Helper Text */}
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            {helperText ||
              (t.has('ImageUploadHint')
                ? t('ImageUploadHint')
                : 'JPG, PNG, or WebP. Max 2 MB.')}
          </Typography>

          {/* Validation Feedback Alert */}
          {validationError && (
            <Alert
              severity="error"
              icon={<IconAlertCircle size={16} />}
              onClose={() => setValidationError(null)}
              sx={{ mt: 1, py: 0.5, px: 1.5, fontSize: '0.8rem' }}
            >
              {validationError}
            </Alert>
          )}
        </Box>
      </Stack>

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={confirmRemoveOpen}
        onClose={() => !isRemoving && setConfirmRemoveOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {t.has('Confirm Image Removal')
            ? t('Confirm Image Removal')
            : 'Remove Image'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t.has('ConfirmImageRemovalMessage')
              ? t('ConfirmImageRemovalMessage')
              : 'Are you sure you want to remove this image? This action cannot be undone.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setConfirmRemoveOpen(false)}
            disabled={isRemoving}
          >
            {t.has('Cancel') ? t('Cancel') : 'Cancel'}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmRemove}
            disabled={isRemoving}
            startIcon={isRemoving ? <CircularProgress size={16} color="inherit" /> : <IconTrash size={16} />}
          >
            {t.has('Remove') ? t('Remove') : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
