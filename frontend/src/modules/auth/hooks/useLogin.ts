'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useAppDispatch } from '@/store/hooks';
import { notify } from '@/shared/services/notification.service';
import { loginSchema, getLoginSchema } from '../validation/login.schema';
import { loginThunk } from '../slices/thunks/login.thunk';
import { classifyAuthError, getLocalizedAuthError } from '../utils/authErrorClassifier';
import {
  getPostLoginRedirect,
  clearPostLoginRedirect,
  isValidReturnUrl,
} from '@/shared/utils/safeNavigation';

type LoginInput = z.input<typeof loginSchema>;
type LoginOutput = z.output<typeof loginSchema>;

/**
 * Custom hook for encapsulating Login form state, validation, Redux dispatch, and redirection.
 */
export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const schema = useMemo(() => getLoginSchema((k) => (t.has(k) ? t(k) : '')), [t]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginInput, any, LoginOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginOutput) => {
    if (isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await dispatch(loginThunk(data)).unwrap();
      if (res.requiresPasswordChange) {
        return;
      }
      notify.success(
        t.has('SignInSuccessDesc') ? t('SignInSuccessDesc') : 'Signed in successfully.',
        { title: t.has('SignInSuccessTitle') ? t('SignInSuccessTitle') : 'Welcome' }
      );

      // Safe return to intended page if valid, otherwise fallback to dashboard
      const targetUrl = getPostLoginRedirect();
      clearPostLoginRedirect();

      if (targetUrl && isValidReturnUrl(targetUrl)) {
        router.push(targetUrl);
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const classified = classifyAuthError(err);
      const { title, description } = getLocalizedAuthError(classified, (key) =>
        t.has(key) ? t(key) : ''
      );
      notify.error(description, { title });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    control,
    errors,
    errorMessage,
    isLoading,
    handleSubmit: handleSubmit(onSubmit),
  };
}

export default useLogin;
