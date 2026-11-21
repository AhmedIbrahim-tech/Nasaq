'use client';

import React from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { useTheme, alpha } from '@mui/material/styles';
import { IconX } from '@tabler/icons-react';

export interface DialogCloseButtonProps extends Omit<IconButtonProps, 'onClick'> {
  onClose: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: 'small' | 'medium';
}

/**
 * Shared danger-styled Close Button for Dialogs, Drawers, Modals, and Popovers.
 * Follows the approved NASAQ semantic convention:
 * - Danger color (theme.palette.error.main)
 * - Subtle alpha background with error border
 * - Accessible hover and focus states
 * - Standardized hit-area dimensions
 */
export const DialogCloseButton: React.FC<DialogCloseButtonProps> = ({
  onClose,
  disabled,
  size = 'small',
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isSmall = size === 'small';

  return (
    <IconButton
      aria-label="close"
      onClick={onClose}
      disabled={disabled}
      size={size}
      sx={{
        color: theme.palette.error.main,
        width: isSmall ? 32 : 36,
        height: isSmall ? 32 : 36,
        borderRadius: '8px',
        bgcolor: alpha(theme.palette.error.main, 0.08),
        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
        transition: 'all 0.15s ease-in-out',
        '&:hover': {
          bgcolor: alpha(theme.palette.error.main, 0.16),
          borderColor: theme.palette.error.main,
          color: theme.palette.error.dark || theme.palette.error.main,
        },
        '&.Mui-disabled': {
          opacity: 0.5,
        },
        ...sx,
      }}
      {...props}
    >
      <IconX size={isSmall ? 18 : 20} stroke={2} />
    </IconButton>
  );
};

export default DialogCloseButton;
