'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Slide from '@mui/material/Slide';
import { useTheme } from '@mui/material/styles';
import {
  IconCircleCheck,
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import { NotificationItem, NotificationType } from '../../types/notification.types';

interface NotificationToastProps {
  notification: NotificationItem;
  onDismiss: (id: string) => void;
  direction?: 'ltr' | 'rtl';
}

const getNotificationConfig = (type: NotificationType, theme: any) => {
  switch (type) {
    case 'success':
      return {
        icon: <IconCircleCheck size={22} color={theme.palette.success.main} stroke={2} />,
        borderColor: theme.palette.success.main,
        bgColor: theme.palette.mode === 'dark' ? 'rgba(19, 222, 185, 0.12)' : theme.palette.success.light,
        titleColor: theme.palette.success.dark || theme.palette.success.main,
        iconBg: theme.palette.mode === 'dark' ? 'rgba(19, 222, 185, 0.2)' : '#ffffff',
      };
    case 'error':
      return {
        icon: <IconAlertCircle size={22} color={theme.palette.error.main} stroke={2} />,
        borderColor: theme.palette.error.main,
        bgColor: theme.palette.mode === 'dark' ? 'rgba(250, 137, 107, 0.12)' : theme.palette.error.light,
        titleColor: theme.palette.error.dark || theme.palette.error.main,
        iconBg: theme.palette.mode === 'dark' ? 'rgba(250, 137, 107, 0.2)' : '#ffffff',
      };
    case 'warning':
      return {
        icon: <IconAlertTriangle size={22} color={theme.palette.warning.main} stroke={2} />,
        borderColor: theme.palette.warning.main,
        bgColor: theme.palette.mode === 'dark' ? 'rgba(255, 174, 31, 0.12)' : theme.palette.warning.light,
        titleColor: theme.palette.warning.dark || theme.palette.warning.main,
        iconBg: theme.palette.mode === 'dark' ? 'rgba(255, 174, 31, 0.2)' : '#ffffff',
      };
    case 'info':
    default:
      return {
        icon: <IconInfoCircle size={22} color={theme.palette.info.main} stroke={2} />,
        borderColor: theme.palette.info.main,
        bgColor: theme.palette.mode === 'dark' ? 'rgba(83, 155, 255, 0.12)' : theme.palette.info.light,
        titleColor: theme.palette.info.dark || theme.palette.info.main,
        iconBg: theme.palette.mode === 'dark' ? 'rgba(83, 155, 255, 0.2)' : '#ffffff',
      };
  }
};

export function NotificationToast({
  notification,
  onDismiss,
  direction = 'ltr',
}: NotificationToastProps) {
  const theme = useTheme();
  const config = getNotificationConfig(notification.type, theme);

  const isRtl = direction === 'rtl';

  return (
    <Slide in direction={isRtl ? 'right' : 'left'} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        dir={isRtl ? 'rtl' : 'ltr'}
        role={notification.type === 'error' ? 'alert' : 'status'}
        aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
        sx={{
          width: { xs: 'calc(100vw - 32px)', sm: 380 },
          maxWidth: 420,
          p: 2,
          borderRadius: 2.5,
          backgroundColor: config.bgColor,
          border: `1px solid ${config.borderColor}40`,
          borderLeft: isRtl ? undefined : `4px solid ${config.borderColor}`,
          borderRight: isRtl ? `4px solid ${config.borderColor}` : undefined,
          backdropFilter: 'blur(8px)',
          boxShadow: theme.shadows[8],
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          pointerEvents: 'auto',
          '&:hover': {
            boxShadow: theme.shadows[12],
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          {/* Leading Icon Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              minWidth: 36,
              borderRadius: '50%',
              bgcolor: config.iconBg,
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            {config.icon}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
            {notification.title && (
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{
                  color: config.titleColor,
                  lineHeight: 1.3,
                  mb: 0.5,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                {notification.title}
              </Typography>
            )}

            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 500,
                lineHeight: 1.45,
                wordBreak: 'break-word',
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              {notification.message}
            </Typography>

            {notification.action && (
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={notification.action.onClick}
                  sx={{
                    fontSize: '0.75rem',
                    py: 0.2,
                    px: 1.2,
                    borderColor: config.borderColor,
                    color: config.titleColor,
                    '&:hover': {
                      borderColor: config.borderColor,
                      backgroundColor: `${config.borderColor}15`,
                    },
                  }}
                >
                  {notification.action.label}
                </Button>
              </Box>
            )}
          </Box>

          {/* Close Action */}
          <IconButton
            size="small"
            aria-label={isRtl ? 'إغلاق الإشعار' : 'Close notification'}
            onClick={() => onDismiss(notification.id)}
            sx={{
              p: 0.5,
              mt: -0.5,
              mr: isRtl ? undefined : -0.5,
              ml: isRtl ? -0.5 : undefined,
              color: theme.palette.text.secondary,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <IconX size={16} />
          </IconButton>
        </Stack>
      </Paper>
    </Slide>
  );
}

export default NotificationToast;
