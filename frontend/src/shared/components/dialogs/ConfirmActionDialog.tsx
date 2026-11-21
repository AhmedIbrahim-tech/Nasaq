'use client';

import React, { ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme, alpha } from '@mui/material/styles';
import {
  IconAlertTriangle,
  IconTrash,
  IconCheck,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export type ConfirmDialogVariant = 'error' | 'warning' | 'info' | 'success' | 'primary';

export interface ConfirmActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: ReactNode;
  subtitle?: ReactNode;
  message: ReactNode;
  variant?: ConfirmDialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'error' | 'warning' | 'info' | 'success' | 'primary' | 'inherit';
  icon?: ReactNode;
  isLoading?: boolean;
  warningNotice?: ReactNode;
  errorNotice?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md';
}

export function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  title,
  subtitle,
  message,
  variant = 'error',
  confirmLabel,
  cancelLabel,
  confirmColor,
  icon,
  isLoading = false,
  warningNotice,
  errorNotice,
  maxWidth = 'sm',
}: ConfirmActionDialogProps) {
  const t = useTranslations();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const variantConfig = {
    error: {
      color: 'error.main',
      rawColor: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.12),
      defaultIcon: <IconTrash size={26} stroke={1.8} />,
      defaultConfirmColor: 'error' as const,
      shadow: `0 4px 14px 0 ${alpha(theme.palette.error.main, 0.35)}`,
    },
    warning: {
      color: 'warning.main',
      rawColor: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.12),
      defaultIcon: <IconAlertTriangle size={26} stroke={1.8} />,
      defaultConfirmColor: 'warning' as const,
      shadow: `0 4px 14px 0 ${alpha(theme.palette.warning.main, 0.35)}`,
    },
    success: {
      color: 'success.main',
      rawColor: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.12),
      defaultIcon: <IconCheck size={26} stroke={2.2} />,
      defaultConfirmColor: 'success' as const,
      shadow: `0 4px 14px 0 ${alpha(theme.palette.success.main, 0.35)}`,
    },
    info: {
      color: 'info.main',
      rawColor: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.12),
      defaultIcon: <IconInfoCircle size={26} stroke={1.8} />,
      defaultConfirmColor: 'info' as const,
      shadow: `0 4px 14px 0 ${alpha(theme.palette.info.main, 0.35)}`,
    },
    primary: {
      color: 'primary.main',
      rawColor: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.12),
      defaultIcon: <IconCheck size={26} stroke={2.2} />,
      defaultConfirmColor: 'primary' as const,
      shadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.35)}`,
    },
  }[variant];

  const resolvedConfirmColor = confirmColor || variantConfig.defaultConfirmColor;
  const resolvedIcon = icon || variantConfig.defaultIcon;

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            position: 'relative',
            border: `1px solid ${theme.palette.divider}`,
            maxWidth: {
              xs: 'calc(100% - 32px)',
              sm: maxWidth === 'md' ? 660 : maxWidth === 'sm' ? 620 : 540,
            },
            width: '100%',
            m: { xs: 2, sm: 3 },
            boxShadow: isDark
              ? '0 16px 48px rgba(0, 0, 0, 0.7)'
              : '0 16px 48px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Direction-aware Subtle Danger Close (X) button */}
      <IconButton
        aria-label={t.has('Close') ? t('Close') : 'Close'}
        onClick={onClose}
        disabled={isLoading}
        size="small"
        sx={{
          position: 'absolute',
          top: 16,
          insetInlineEnd: 16,
          width: 36,
          height: 36,
          color: theme.palette.error.main,
          borderRadius: '8px',
          bgcolor: alpha(theme.palette.error.main, 0.08),
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          transition: 'all 0.2s ease-in-out',
          zIndex: 2,
          '&:hover': {
            bgcolor: alpha(theme.palette.error.main, 0.16),
            borderColor: theme.palette.error.main,
            color: theme.palette.error.dark || theme.palette.error.main,
          },
          '&.Mui-disabled': {
            opacity: 0.5,
          },
        }}
      >
        <IconX size={18} />
      </IconButton>

      {/* Header Banner — Full-width with dedicated background, spacing, and zero icon overlap */}
      <DialogTitle
        component="div"
        sx={{
          p: 3,
          pb: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark
            ? 'background.paper'
            : alpha(variantConfig.rawColor, 0.03),
          display: 'flex',
          alignItems: 'center',
          gap: 2.25,
          paddingInlineEnd: '64px',
          paddingInlineStart: '24px',
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '14px',
            bgcolor: variantConfig.bgColor,
            color: variantConfig.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: `1px solid ${alpha(variantConfig.rawColor, 0.25)}`,
            boxShadow: isDark
              ? 'none'
              : `0 4px 12px ${alpha(variantConfig.rawColor, 0.12)}`,
          }}
        >
          {resolvedIcon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontWeight: 800,
              fontSize: '1.25rem',
              lineHeight: 1.35,
              color: 'text.primary',
              display: 'block',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                display: 'block',
                mt: 0.5,
                fontWeight: 600,
                fontSize: '0.875rem',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </DialogTitle>

      {/* Dialog Body Content — Guaranteed top clearance and zero text clipping */}
      <DialogContent
        sx={{
          p: { xs: 3, sm: 3.5 },
          pt: '28px !important',
          '&.MuiDialogContent-root': {
            paddingTop: '28px !important',
          },
          bgcolor: isDark ? 'background.default' : 'background.paper',
        }}
      >
        <Box sx={{ pt: 1, pb: 0.5, overflow: 'visible' }}>
          {errorNotice && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
              {errorNotice}
            </Alert>
          )}

          <Typography
            variant="body1"
            sx={{
              color: 'text.primary',
              fontSize: '1.025rem',
              lineHeight: 1.75,
              fontWeight: 500,
              display: 'block',
              mt: 0.5,
            }}
          >
            {message}
          </Typography>
        </Box>

        {warningNotice && (
          <Box
            sx={{
              p: 2.25,
              borderRadius: '12px',
              bgcolor: isDark
                ? alpha(theme.palette.error.main, 0.08)
                : alpha(theme.palette.error.main, 0.04),
              border: `1px solid ${alpha(theme.palette.error.main, 0.22)}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              mt: 2.5,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: alpha(theme.palette.error.main, 0.12),
                color: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconAlertTriangle size={20} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: 'error.main', mb: 0.5, fontSize: '0.9rem' }}
              >
                {t.has('Warning') ? t('Warning') : 'Warning: This action cannot be undone'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.85rem' }}>
                {warningNotice}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Footer Actions — Standardized Soft Danger Cancel & Primary Action Button */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.25,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? 'background.paper' : alpha(theme.palette.grey[500], 0.02),
          gap: '14px !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          '& > :not(style)': { m: '0 !important' },
        }}
      >
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          color="inherit"
          sx={{
            fontWeight: 600,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '0.9rem',
            px: 2.5,
            py: 1,
            minWidth: 100,
            height: 42,
            borderColor: theme.palette.divider,
            color: 'text.primary',
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'text.secondary',
            },
          }}
        >
          {cancelLabel || (t.has('Cancel') ? t('Cancel') : 'Cancel')}
        </Button>

        <Button
          onClick={onConfirm}
          color={resolvedConfirmColor}
          variant="contained"
          disabled={isLoading}
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
          sx={{
            fontWeight: 700,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '0.9rem',
            px: 3.5,
            py: 1,
            minWidth: 130,
            height: 42,
            boxShadow: variantConfig.shadow,
          }}
        >
          {isLoading
            ? t.has('Processing')
              ? t('Processing')
              : 'Processing...'
            : confirmLabel || (t.has('Confirm') ? t('Confirm') : 'Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmActionDialog;
