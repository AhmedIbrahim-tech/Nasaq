'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconArrowLeft,
  IconArrowRight,
  IconLayoutDashboard,
  IconHelp,
} from '@tabler/icons-react';
import Logo from '@/shared/layouts/dashboard/shared/logo/Logo';

export interface FullScreenErrorLayoutProps {
  statusCode?: string | number;
  title: string;
  subtitle: string;
  illustrationSrc?: string;
  illustrationAlt?: string;
  primaryActionLabel: string;
  primaryActionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  needHelpLabel?: string;
  helpActionLabel?: string;
  helpActionHref?: string;
  showHelpLink?: boolean;
}

export default function FullScreenErrorLayout({
  title,
  subtitle,
  illustrationSrc = '/images/backgrounds/errorimg.svg',
  illustrationAlt = 'Error Illustration',
  primaryActionLabel,
  primaryActionHref = '/',
  secondaryActionLabel,
  onSecondaryAction,
  needHelpLabel,
  helpActionLabel,
  helpActionHref = '/',
  showHelpLink = false,
}: FullScreenErrorLayoutProps) {
  const theme = useTheme();
  const router = useRouter();

  const isRtl = theme.direction === 'rtl';
  const ArrowBackIcon = isRtl ? IconArrowRight : IconArrowLeft;

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      router.back();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Brand Header */}
      <Box
        component="header"
        sx={{
          width: '100%',
          py: { xs: 2.5, sm: 3 },
          px: { xs: 3, sm: 4, md: 6 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', sm: 'flex-start' },
        }}
      >
        <Logo />
      </Box>

      {/* Main Centered Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, sm: 6 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          {/* Illustration */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: { xs: 3, sm: 4 },
            }}
          >
            <Image
              src={illustrationSrc}
              alt={illustrationAlt}
              width={420}
              height={300}
              priority
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                maxHeight: '300px',
                objectFit: 'contain',
              }}
            />
          </Box>

          {/* Heading */}
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              lineHeight: 1.25,
              mb: 1.5,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 580,
              mx: 'auto',
              mb: 4,
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              lineHeight: 1.65,
            }}
          >
            {subtitle}
          </Typography>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: showHelpLink ? 4 : 0 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              href={primaryActionHref}
              startIcon={<IconLayoutDashboard size={20} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                px: 3.5,
                py: 1.2,
                borderRadius: '8px',
                width: { xs: '100%', sm: 'auto' },
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}40`,
                },
              }}
            >
              {primaryActionLabel}
            </Button>

            {secondaryActionLabel && (
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={handleSecondaryAction}
                startIcon={<ArrowBackIcon size={20} />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  px: 3,
                  py: 1.2,
                  borderRadius: '8px',
                  borderColor: 'divider',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderColor: 'text.secondary',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                {secondaryActionLabel}
              </Button>
            )}
          </Stack>

          {/* Subtle Help Center Link */}
          {showHelpLink && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                flexWrap: 'wrap',
              }}
            >
              {needHelpLabel && (
                <Typography variant="body2" color="text.secondary">
                  {needHelpLabel}
                </Typography>
              )}
              {helpActionLabel && (
                <Button
                  variant="text"
                  color="primary"
                  component={Link}
                  href={helpActionHref}
                  startIcon={<IconHelp size={16} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    p: 0.5,
                    minWidth: 'auto',
                  }}
                >
                  {helpActionLabel}
                </Button>
              )}
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
