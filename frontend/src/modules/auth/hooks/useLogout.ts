'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { logoutThunk } from '../slices/thunks/logout.thunk';

import { store, purgeSensitiveAppState } from '@/store';
import { clearPostLoginRedirect } from '@/shared/utils/safeNavigation';
import { sessionEventBus } from '../services/sessionEvents';

/**
 * Custom hook to handle user logout:
 * - Dispatches logoutThunk to revoke token on backend and clear local Redux state.
 * - Broadcasts SESSION_LOGOUT to all other open tabs to synchronize logout.
 * - Purges sensitive ERP business data from Redux state.
 * - Clears pending return destinations.
 * - Prevents duplicate concurrent logout requests.
 * - Unconditionally navigates to /login after completion.
 */
export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const activeSessionId = store.getState()?.auth?.sessionId ?? null;
      // Broadcast intentional logout event across all open tabs
      sessionEventBus.broadcast({
        type: 'SESSION_LOGOUT',
        sessionId: activeSessionId,
      });

      // Clear any pending return-to-page destinations
      clearPostLoginRedirect();

      // Purge sensitive business data from Redux
      dispatch(purgeSensitiveAppState());

      await dispatch(logoutThunk());
    } finally {
      setIsLoggingOut(false);
      router.replace('/login');
    }
  }, [dispatch, isLoggingOut, router]);

  return {
    logout: handleLogout,
    isLoggingOut,
  };
}

export default useLogout;
