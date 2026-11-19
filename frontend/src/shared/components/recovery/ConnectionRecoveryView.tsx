'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import {
  IconWifiOff,
  IconServerOff,
  IconClockHour4,
  IconAlertTriangle,
  IconShieldLock,
  IconRefresh,
  IconLogin,
  IconBuildingSkyscraper,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export type ConnectionErrorReason =
  | 'offline'
  | 'unreachable'
  | 'timeout'
  | 'server_error'
  | 'forbidden'
  | null;

interface ConnectionRecoveryViewProps {
  errorReason: ConnectionErrorReason;
  isVerifying: boolean;
  retryCount: number;
  maxRetries: number;
  nextRetryIn: number | null;
  onRetry: () => void;
  onResetAndLogin?: () => void;
}

export function ConnectionRecoveryView({
  errorReason,
  isVerifying,
  retryCount,
  maxRetries,
  nextRetryIn,
  onRetry,
  onResetAndLogin,
}: ConnectionRecoveryViewProps) {
  const theme = useTheme();
  const t = useTranslations();

  // Determine error presentation properties
  const getErrorContent = () => {
    switch (errorReason) {
      case 'offline':
        return {
          icon: <IconWifiOff size={44} stroke={1.8} />,
          badgeColor: theme.palette.warning.main,
          badgeBg: theme.palette.mode === 'dark' ? 'rgba(255, 174, 31, 0.15)' : theme.palette.warning.light,
          title: t.has('YouAreOffline') ? t('YouAreOffline') : "You're offline",
          description: t.has('YouAreOfflineDesc')
            ? t('YouAreOfflineDesc')
            : 'Your internet connection appears unavailable. Please check your network connection and reconnect.',
        };
      case 'timeout':
        return {
          icon: <IconClockHour4 size={44} stroke={1.8} />,
          badgeColor: theme.palette.warning.dark || theme.palette.warning.main,
          badgeBg: theme.palette.mode === 'dark' ? 'rgba(255, 174, 31, 0.15)' : theme.palette.warning.light,
          title: t.has('ConnectionTimeout') ? t('ConnectionTimeout') : 'The connection is taking longer than expected',
          description: t.has('ConnectionTimeoutDesc')
            ? t('ConnectionTimeoutDesc')
            : 'The server took too long to respond. Please verify your connection and try again.',
        };
      case 'server_error':
        return {
          icon: <IconAlertTriangle size={44} stroke={1.8} />,
          badgeColor: theme.palette.error.main,
          badgeBg: theme.palette.mode === 'dark' ? 'rgba(250, 137, 107, 0.15)' : theme.palette.error.light,
          title: t.has('ServerTemporarilyUnavailable')
            ? t('ServerTemporarilyUnavailable')
            : 'Server Temporarily Unavailable',
          description: t.has('ServerTemporarilyUnavailableDesc')
            ? t('ServerTemporarilyUnavailableDesc')
            : 'The CoreStarter server encountered a temporary error. Please try again in a few moments.',
        };
      case 'forbidden':
        return {
          icon: <IconShieldLock size={44} stroke={1.8} />,
          badgeColor: theme.palette.error.main,
          badgeBg: theme.palette.mode === 'dark' ? 'rgba(250, 137, 107, 0.15)' : theme.palette.error.light,
          title: t.has('AccessDeniedTitle') ? t('AccessDeniedTitle') : 'Access Denied',
          description: t.has('AccessDeniedDesc')
            ? t('AccessDeniedDesc')
            : 'You do not have permission to access this section of CoreStarter.',
        };
      case 'unreachable':
      default:
        return {
          icon: <IconServerOff size={44} stroke={1.8} />,
          badgeColor: theme.palette.error.main,
          badgeBg: theme.palette.mode === 'dark' ? 'rgba(250, 137, 107, 0.15)' : theme.palette.error.light,
          title: t.has('UnableToConnect') ? t('UnableToConnect') : 'Unable to connect to CoreStarter',
          description: t.has('UnableToConnectDesc')
            ? t('UnableToConnectDesc')
            : 'The application could not reach the CoreStarter server. The service might be temporarily unavailable or restarting.',
        };
    }
  };

  const content = getErrorContent();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        p: { xs: 2, sm: 3 },
        position: 'relative',
        background: theme.palette.mode === 'dark'
          ? 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 1) 100%)'
          : 'radial-gradient(ellipse at center, rgba(238, 242, 255, 0.8) 0%, rgba(248, 250, 252, 1) 100%)',
      }}
    >
      <Card
        elevation={8}
        sx={{
          maxWidth: 520,
          width: '100%',
          p: { xs: 3, sm: 4.5 },
          borderRadius: 3.5,
          textAlign: 'center',
          boxShadow: theme.shadows[8],
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* CoreStarter Brand Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 3.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || theme.palette.primary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: `0 4px 12px ${theme.palette.primary.main}35`,
            }}
          >
            <IconBuildingSkyscraper size={22} stroke={2} />
          </Box>
          <Typography
            variant="h5"
            component="span"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: 'text.primary',
              lineHeight: 1,
            }}
          >
            CoreStarter
          </Typography>
          <Box
            component="span"
            sx={{
              px: 0.85,
              py: 0.3,
              borderRadius: '6px',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              lineHeight: 1.1,
              textTransform: 'uppercase',
            }}
          >
            ERP
          </Box>
        </Box>

        {/* Central Illustration Badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 88,
            height: 88,
            borderRadius: '50%',
            bgcolor: content.badgeBg,
            color: content.badgeColor,
            mb: 3,
            boxShadow: `0 8px 24px ${content.badgeColor}25`,
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          {content.icon}
        </Box>

        {/* Localized Heading */}
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'text.primary', mb: 1.5 }}>
          {content.title}
        </Typography>

        {/* Accurate, Friendly Explanation */}
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            mb: 3,
            lineHeight: 1.6,
            maxWidth: 420,
            mx: 'auto',
          }}
        >
          {content.description}
        </Typography>

        {/* Auto-Retry Status or Countdown */}
        {nextRetryIn !== null && nextRetryIn > 0 ? (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.75,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(93, 135, 255, 0.12)' : 'primary.light',
              color: 'primary.main',
              mb: 3,
            }}
          >
            <CircularProgress size={14} color="primary" />
            <Typography variant="caption" fontWeight={600}>
              {t.has('AutoRetryingIn') ? t('AutoRetryingIn') : 'Auto-retrying in'}{' '}
              {nextRetryIn} {t.has('Seconds') ? t('Seconds') : 'seconds'}... ({retryCount}/{maxRetries})
            </Typography>
          </Box>
        ) : retryCount >= maxRetries ? (
          <Box sx={{ mb: 3 }}>
            <Chip
              label={
                t.has('AutoRetryStopped')
                  ? t('AutoRetryStopped')
                  : 'Automatic reconnection paused. Please retry manually.'
              }
              size="small"
              variant="outlined"
              color="warning"
              sx={{ fontWeight: 500 }}
            />
          </Box>
        ) : null}

        {/* Actions Stack */}
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          {/* Primary Action: Try Again */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={onRetry}
            disabled={isVerifying}
            startIcon={
              isVerifying ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <IconRefresh size={18} />
              )
            }
            sx={{
              py: 1.3,
              fontWeight: 600,
              fontSize: '0.95rem',
              boxShadow: theme.shadows[4],
            }}
          >
            {isVerifying
              ? t.has('TryingToReconnect')
                ? t('TryingToReconnect')
                : 'Verifying connection...'
              : t.has('TryAgain')
              ? t('TryAgain')
              : 'Try Again'}
          </Button>

          {/* Secondary Action: Sign in with different account */}
          {onResetAndLogin && (
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              fullWidth
              onClick={onResetAndLogin}
              disabled={isVerifying}
              startIcon={<IconLogin size={18} />}
              sx={{
                py: 1.1,
                fontWeight: 500,
                color: 'text.secondary',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.secondary,
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {t.has('SignInDifferentAccount')
                ? t('SignInDifferentAccount')
                : 'Sign In with Different Account'}
            </Button>
          )}
        </Stack>
      </Card>
    </Box>
  );
}

export default ConnectionRecoveryView;
