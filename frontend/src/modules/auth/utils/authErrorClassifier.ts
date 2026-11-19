import { isAxiosError } from 'axios';
import { isRequestCanceled } from '@/lib/api/errors';
import { isString } from '@/utils/isString';

export type AuthErrorCategory =
  | 'invalid_credentials'
  | 'account_deactivated'
  | 'account_locked'
  | 'temporary_password_expired'
  | 'network_error'
  | 'timeout'
  | 'rate_limited'
  | 'forbidden'
  | 'server_error'
  | 'generic';

export interface ClassifiedAuthError {
  category: AuthErrorCategory;
  status: number;
  code?: string;
  serverMessage?: string;
}

export function isAuthErrorPayload(obj: unknown): obj is ClassifiedAuthError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'category' in obj &&
    'status' in obj
  );
}

export function classifyAuthError(error: unknown): ClassifiedAuthError {
  if (isAuthErrorPayload(error)) {
    return error;
  }

  if (isRequestCanceled(error)) {
    return { category: 'generic', status: 0, code: 'REQUEST_CANCELED' };
  }

  if (isAxiosError(error) || (error && typeof error === 'object' && ('isAxiosError' in error || 'response' in error))) {
    const axiosErr = error as any;

    // Timeout
    if (
      axiosErr.code === 'ECONNABORTED' ||
      axiosErr.code === 'ETIMEDOUT' ||
      axiosErr.message?.toLowerCase().includes('timeout')
    ) {
      return { category: 'timeout', status: 408, code: 'TIMEOUT' };
    }

    // Network / Server Unreachable (no HTTP response received)
    if (axiosErr.code === 'ERR_NETWORK' || (!axiosErr.response && Boolean(axiosErr.request))) {
      return { category: 'network_error', status: 0, code: 'ERR_NETWORK' };
    }

    const status = axiosErr.response?.status;
    const responseData = axiosErr.response?.data;
    const rawMsg =
      responseData?.message ||
      (Array.isArray(responseData?.errors) ? responseData.errors[0] : null) ||
      '';
    const messageLower = typeof rawMsg === 'string' ? rawMsg.toLowerCase() : '';

    if (status === 401) {
      if (messageLower.includes('deactivat')) {
        return { category: 'account_deactivated', status: 401, serverMessage: rawMsg };
      }
      if (messageLower.includes('lock')) {
        return { category: 'account_locked', status: 401, serverMessage: rawMsg };
      }
      if (messageLower.includes('expired') || messageLower.includes('temporary password')) {
        return { category: 'temporary_password_expired', status: 401, serverMessage: rawMsg };
      }
      return { category: 'invalid_credentials', status: 401, serverMessage: rawMsg };
    }

    if (status === 403) {
      return { category: 'forbidden', status: 403 };
    }

    if (status === 429) {
      return { category: 'rate_limited', status: 429 };
    }

    if (status && status >= 500) {
      return { category: 'server_error', status };
    }

    if (status === 400) {
      return { category: 'invalid_credentials', status: 400 };
    }
  }

  // String error
  if (isString(error)) {
    const lower = error.toLowerCase();
    if (lower.includes('network') || lower.includes('connection') || lower.includes('offline')) {
      return { category: 'network_error', status: 0 };
    }
    if (lower.includes('timeout')) {
      return { category: 'timeout', status: 408 };
    }
    if (lower.includes('credential') || lower.includes('password') || lower.includes('email') || lower.includes('unauthorized')) {
      return { category: 'invalid_credentials', status: 401 };
    }
    if (lower.includes('server') || lower.includes('500')) {
      return { category: 'server_error', status: 500 };
    }
  }

  return { category: 'generic', status: 500 };
}

export function getLocalizedAuthError(
  classified: ClassifiedAuthError,
  t: (key: string) => string
): { title: string; description: string } {
  switch (classified.category) {
    case 'invalid_credentials':
      return {
        title: t('AuthFailedTitle') || 'Authentication Failed',
        description: t('AuthInvalidCredentialsDesc') || 'Incorrect email or password.',
      };
    case 'account_deactivated':
      return {
        title: t('AccountDeactivatedTitle') || 'Account Deactivated',
        description:
          t('AccountDeactivatedDesc') ||
          'This account has been deactivated. Please contact your platform administrator.',
      };
    case 'account_locked':
      return {
        title: t('AccountLockedTitle') || 'Account Temporarily Locked',
        description:
          t('AccountLockedDesc') ||
          'This account is temporarily locked due to multiple failed login attempts.',
      };
    case 'temporary_password_expired':
      return {
        title: t('TemporaryPasswordExpiredTitle') || 'Temporary Password Expired',
        description:
          t('TemporaryPasswordExpiredDesc') ||
          'The temporary password has expired. Please contact your platform administrator.',
      };
    case 'network_error':
      return {
        title: t('ConnectionErrorTitle') || 'Connection Error',
        description:
          t('ConnectionErrorDesc') ||
          'Could not reach the server. Check your connection and try again.',
      };
    case 'timeout':
      return {
        title: t('ConnectionTimeoutTitle') || 'Connection Timeout',
        description: t('ConnectionTimeoutDesc') || 'The request timed out. Please try again.',
      };
    case 'rate_limited':
      return {
        title: t('RateLimitedTitle') || 'Too Many Attempts',
        description: t('RateLimitedDesc') || 'Too many attempts. Please try again later.',
      };
    case 'forbidden':
      return {
        title: t('AccessRestrictedTitle') || 'Access Restricted',
        description: t('AccessRestrictedDesc') || 'Your account is not authorized to sign in.',
      };
    case 'server_error':
      return {
        title: t('ServerErrorTitle') || 'Server Error',
        description:
          t('ServerErrorDesc') || 'A server error occurred. Please try again later.',
      };
    case 'generic':
    default:
      return {
        title: t('SignInFailedTitle') || 'Sign-In Failed',
        description:
          t('SignInFailedDesc') || 'Sign-in could not be completed. Please try again.',
      };
  }
}
