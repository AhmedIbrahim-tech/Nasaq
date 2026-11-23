'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { meThunk } from '@/modules/auth/slices/thunks/me.thunk';
import { setError } from '@/modules/auth/slices/auth.slice';
import { useLogout } from '@/modules/auth/hooks/useLogout';

export function useProfile() {
  const dispatch = useAppDispatch();
  const { logout, isLoggingOut } = useLogout();

  const user = useAppSelector((state) => state.auth.user);
  const roles = useAppSelector((state) => state.auth.roles) || [];
  const loading = useAppSelector((state) => state.auth.loading);
  const authError = useAppSelector((state) => state.auth.error);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const accessTokenExpiresAtUtc = useAppSelector((state) => state.auth.accessTokenExpiresAtUtc);

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!user) {
      dispatch(meThunk());
    }
  }, [dispatch, user]);

  const handleRefresh = useCallback(async () => {
    try {
      await dispatch(meThunk()).unwrap();
    } catch {
      // Handled via authError Alert
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  return {
    user,
    roles,
    loading,
    authError,
    accessToken,
    accessTokenExpiresAtUtc,
    activeTab,
    setActiveTab,
    handleRefresh,
    clearError,
    logout,
    isLoggingOut,
  };
}
