'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import {
  NotificationContextType,
  NotificationItem,
  NotificationType,
  NotifyOptions,
} from '../types/notification.types';
import { notify } from '../services/notification.service';
import { NotificationToast } from '../components/notifications/NotificationToast';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Subscribe to singleton notification events
    const unsubscribe = notify.subscribe((items) => {
      setNotifications(items);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const success = useCallback(
    (message: string, options?: NotifyOptions) => notify.success(message, options),
    []
  );

  const error = useCallback(
    (message: string, options?: NotifyOptions) => notify.error(message, options),
    []
  );

  const warning = useCallback(
    (message: string, options?: NotifyOptions) => notify.warning(message, options),
    []
  );

  const info = useCallback(
    (message: string, options?: NotifyOptions) => notify.info(message, options),
    []
  );

  const dismiss = useCallback((id: string) => notify.dismiss(id), []);
  const clear = useCallback(() => notify.clear(), []);

  // Backwards-compatible legacy helpers
  const showSuccess = useCallback((msg: string) => notify.success(msg), []);
  const showError = useCallback((msg: string) => notify.error(msg), []);
  const showWarning = useCallback((msg: string) => notify.warning(msg), []);
  const showInfo = useCallback((msg: string) => notify.info(msg), []);
  const notifySuccess = useCallback((msg: string) => notify.success(msg), []);
  const notifyError = useCallback((msg: string) => notify.error(msg), []);

  const notifyHelper = useCallback(
    (msg: string, severity?: NotificationType) => {
      if (severity === 'success') notify.success(msg);
      else if (severity === 'error') notify.error(msg);
      else if (severity === 'warning') notify.warning(msg);
      else notify.info(msg);
    },
    []
  );

  const contextValue: NotificationContextType = {
    success,
    error,
    warning,
    info,
    dismiss,
    clear,
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifySuccess,
    notifyError,
    notify: notifyHelper,
    closeNotification: clear,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Floating Global Toasts Overlay */}
      {notifications.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: { xs: 16, sm: 24 },
            [isRtl ? 'left' : 'right']: { xs: 16, sm: 24 },
            zIndex: (theme) => Math.max(theme.zIndex.snackbar + 100, 2100),
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            pointerEvents: 'none',
            maxWidth: '100vw',
          }}
        >
          {notifications.map((item) => (
            <NotificationToast
              key={item.id}
              notification={item}
              onDismiss={(id) => notify.dismiss(id)}
              direction={theme.direction}
            />
          ))}
        </Box>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export const useNotify = useNotification;
export const useToast = useNotification;

// Re-export singleton for easy direct import
export { notify } from '../services/notification.service';
export type {
  NotificationItem,
  NotificationType,
  NotifyOptions,
  NotificationContextType,
} from '../types/notification.types';
