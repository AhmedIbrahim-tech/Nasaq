'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useTheme, alpha } from '@mui/material/styles';
import { Controller } from 'react-hook-form';
import { useTranslations } from 'next-intl';

// Outlined MUI Icons as strictly requested
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';

import CustomCheckbox from '@/shared/components/forms/theme-elements/CustomCheckbox';
import CustomTextField from '@/shared/components/forms/theme-elements/CustomTextField';
import Logo from '@/shared/layouts/dashboard/shared/logo/Logo';
import { useAppSelector } from '@/store/hooks';
import { FirstLoginChangePasswordDialog } from './FirstLoginChangePasswordDialog';
import { LoginFormProps } from '../types';
import { useLogin } from '../hooks/useLogin';

export default function LoginForm({ title, subtitle, subtext }: LoginFormProps) {
  const theme = useTheme();
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  const { register, control, errors, errorMessage, isLoading, handleSubmit } = useLogin();
  const { requiresPasswordChange, setupToken } = useAppSelector((state) => state.auth);

  const isDark = theme.palette.mode === 'dark';
  const inputBg = isDark ? '#0f172a' : '#f8fafc';
  const inputHoverBg = isDark ? '#1e293b' : '#f1f5f9';
  const inputFocusBg = isDark ? '#1e293b' : '#ffffff';

  const getInputSx = (isPassword = false) => ({
    minHeight: 54,
    borderRadius: '14px',
    fontSize: '0.95rem',
    bgcolor: inputBg,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      transition: 'border-color 0.2s ease',
    },
    '&:hover': {
      bgcolor: inputHoverBg,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.16)',
      },
      '& input:-webkit-autofill, & input:autofill': {
        WebkitBoxShadow: `0 0 0 1000px ${inputHoverBg} inset !important`,
        boxShadow: `0 0 0 1000px ${inputHoverBg} inset !important`,
      },
    },
    '&.Mui-focused': {
      bgcolor: inputFocusBg,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'primary.main',
      },
      '& input:-webkit-autofill, & input:autofill': {
        WebkitBoxShadow: `0 0 0 1000px ${inputFocusBg} inset !important`,
        boxShadow: `0 0 0 1000px ${inputFocusBg} inset !important`,
      },
    },
    '& .MuiOutlinedInput-input': {
      py: 1.6,
      fontSize: '0.95rem',
      backgroundColor: 'transparent !important',
      background: 'transparent !important',
      border: 'none !important',
      outline: 'none !important',
      boxShadow: 'none !important',
      WebkitBoxShadow: 'none !important',
      ...(isPassword && {
        letterSpacing: showPassword ? 'normal' : '0.12em',
      }),
    },
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active, & input:autofill, & input:autofill:hover, & input:autofill:focus': {
      WebkitBoxShadow: `0 0 0 1000px ${inputBg} inset !important`,
      boxShadow: `0 0 0 1000px ${inputBg} inset !important`,
      WebkitTextFillColor: `${theme.palette.text.primary} !important`,
      caretColor: theme.palette.text.primary,
      transition: 'background-color 5000000s ease-in-out 0s',
      borderRadius: '0 !important',
      ...(isPassword && {
        letterSpacing: showPassword ? 'normal' : '0.12em',
      }),
    },
  });

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: 460 },
        mx: 'auto',
        p: { xs: 3, sm: 4.5, md: 5 },
        borderRadius: { xs: 3, sm: 4 },
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
        border: '1px solid',
        borderColor:
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.06)',
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 24px 48px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.03)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Mobile Branding (Visible only on xs, sm, and md screens where Left Panel is hidden) */}
      <Box
        sx={{
          display: { xs: 'flex', lg: 'none' },
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <Logo />
      </Box>

      {/* Brand Badge */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ mb: 2, justifyContent: { xs: 'center', lg: 'flex-start' } }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.25,
            py: 0.4,
            borderRadius: '20px',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ letterSpacing: 0.5, fontSize: '0.72rem' }}
          >
            {t.has('CoreStarterBadge')
              ? t('CoreStarterBadge')
              : 'CORESTARTER ENTERPRISE'}
          </Typography>
        </Box>
      </Stack>

      {/* Form Header */}
      <Box sx={{ mb: 3.5, textAlign: { xs: 'center', lg: 'start' } }}>
        <Typography
          variant="h3"
          component="h2"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.75rem', sm: '2rem' },
            letterSpacing: '-0.025em',
            color: 'text.primary',
            lineHeight: 1.2,
            mb: 0.75,
          }}
        >
          {title || (t.has('WelcomeBack') ? t('WelcomeBack') : 'Welcome back')}
        </Typography>

        {subtext || (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.925rem',
              lineHeight: 1.5,
            }}
          >
            {t.has('SignInSubtitle')
              ? t('SignInSubtitle')
              : 'Sign in to your CoreStarter workspace to continue.'}
          </Typography>
        )}
      </Box>

      {/* Error Feedback Message (if present) */}
      {errorMessage && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
            borderRadius: 2.5,
            fontSize: '0.85rem',
            alignItems: 'center',
          }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Form Submission */}
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.75}>
          {/* Email Address Field */}
          <Box>
            <Typography
              component="label"
              htmlFor="email"
              sx={{
                display: 'block',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'text.primary',
                mb: 1,
              }}
            >
              {t.has('EmailAddress') ? t('EmailAddress') : 'Email Address'}
            </Typography>
            <CustomTextField
              id="email"
              type="email"
              variant="outlined"
              fullWidth
              autoComplete="email"
              placeholder="name@company.com"
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 1.5, ml: 0.25 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                      }}
                    >
                      <EmailOutlined sx={{ fontSize: 20 }} />
                    </Box>
                  </InputAdornment>
                ),
                sx: getInputSx(false),
              }}
              {...register('email')}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
          </Box>

          {/* Password Field */}
          <Box>
            <Typography
              component="label"
              htmlFor="password"
              sx={{
                display: 'block',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'text.primary',
                mb: 1,
              }}
            >
              {t.has('Password') ? t('Password') : 'Password'}
            </Typography>
            <CustomTextField
              id="password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 1.5, ml: 0.25 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                      }}
                    >
                      <LockOutlined sx={{ fontSize: 20 }} />
                    </Box>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: 0.5 }}>
                    <IconButton
                      aria-label={
                        t.has('TogglePasswordVisibility')
                          ? t('TogglePasswordVisibility')
                          : 'toggle password visibility'
                      }
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="medium"
                      tabIndex={-1}
                      sx={{
                        color: 'text.secondary',
                        p: 0.85,
                        borderRadius: '10px',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: 'primary.main',
                        },
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOffOutlined sx={{ fontSize: 20 }} />
                      ) : (
                        <VisibilityOutlined sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: getInputSx(true),
              }}
              {...register('password')}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />
          </Box>

          {/* Remember this device & Forgot Password / Need Help */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ pt: 0.5, pb: 0.25 }}
          >
            <FormGroup>
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <CustomCheckbox
                        id="rememberMe"
                        disabled={isLoading}
                        checked={Boolean(field.value)}
                        onChange={(e: any) => field.onChange(e.target.checked)}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.825rem',
                          color: 'text.secondary',
                          userSelect: 'none',
                        }}
                      >
                        {t.has('RememberThisDevice') ? t('RememberThisDevice') : 'Remember this device'}
                      </Typography>
                    }
                  />
                )}
              />
            </FormGroup>

            <Typography
              component="button"
              type="button"
              onClick={() => setHelpDialogOpen(true)}
              sx={{
                background: 'none',
                border: 'none',
                p: 0,
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'primary.main',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'opacity 0.2s',
                '&:hover': {
                  opacity: 0.85,
                  textDecoration: 'underline',
                },
              }}
            >
              {t.has('NeedHelpSigningIn')
                ? t('NeedHelpSigningIn')
                : t.has('ForgotPassword')
                ? t('ForgotPassword')
                : 'Need help signing in?'}
            </Typography>
          </Stack>

          {/* Submit Action Button */}
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={isLoading}
            sx={{
              height: 52,
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              textTransform: 'none',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark || '#1e40af'} 100%)`,
              boxShadow: `0 10px 24px -4px ${alpha(theme.palette.primary.main, 0.45)}, 0 4px 10px -2px ${alpha(theme.palette.primary.main, 0.2)}`,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark || '#1e40af'} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: `0 14px 28px -4px ${alpha(theme.palette.primary.main, 0.55)}, 0 6px 12px -2px ${alpha(theme.palette.primary.main, 0.3)}`,
                transform: 'translateY(-2px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
            startIcon={
              isLoading ? <CircularProgress size={20} color="inherit" thickness={4} /> : null
            }
          >
            {isLoading
              ? t.has('SigningIn')
                ? t('SigningIn')
                : 'Signing In...'
              : t.has('SignIn')
              ? t('SignIn')
              : 'Sign In'}
          </Button>
        </Stack>
      </form>

      {/* Security & Workspace Footnote */}
      <Box
        sx={{
          mt: 3.5,
          pt: 2.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            px: 1.5,
            py: 0.65,
            borderRadius: '20px',
            bgcolor:
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <VerifiedUserOutlined sx={{ fontSize: 16, color: 'success.main' }} />
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            {t.has('ProtectedLoginFooter')
              ? t('ProtectedLoginFooter')
              : 'Secure workspace sign-in'}
          </Typography>
        </Stack>
      </Box>

      {subtitle}

      {/* Password Reset & Account Assistance Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <VerifiedUserOutlined sx={{ fontSize: 22, color: 'primary.main' }} />
          {t.has('PasswordHelpTitle') ? t('PasswordHelpTitle') : 'Password Reset & Account Assistance'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            {t.has('PasswordHelpBody')
              ? t('PasswordHelpBody')
              : 'For security and system integrity, user passwords in CoreStarter are managed administratively. If you have forgotten your password or your temporary credentials have expired, please contact your system administrator to request a secure temporary password.'}
          </Typography>

          <Box
            sx={{
              p: 1.75,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            <Stack spacing={1}>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, display: 'block' }}>
                {t.has('PasswordHelpStep1')
                  ? t('PasswordHelpStep1')
                  : '1. Request a temporary reset key from your platform or organization administrator.'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, display: 'block' }}>
                {t.has('PasswordHelpStep2')
                  ? t('PasswordHelpStep2')
                  : '2. Sign in with the temporary credentials before the 24-hour expiration window.'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, display: 'block' }}>
                {t.has('PasswordHelpStep3')
                  ? t('PasswordHelpStep3')
                  : '3. You will be prompted immediately to establish your permanent strong password.'}
              </Typography>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setHelpDialogOpen(false)}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            {t.has('GotIt') ? t('GotIt') : 'Understood'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preserved First-Login Password Change Modal */}
      <FirstLoginChangePasswordDialog
        open={Boolean(requiresPasswordChange && setupToken)}
        setupToken={setupToken}
      />
    </Box>
  );
}
