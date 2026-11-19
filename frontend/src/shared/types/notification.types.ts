export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotifyAction {
  label: string;
  onClick: () => void;
}

export interface NotifyOptions {
  id?: string;
  title?: string;
  duration?: number;
  persistent?: boolean;
  action?: NotifyAction;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration: number;
  persistent?: boolean;
  createdAt: number;
  action?: NotifyAction;
}

export type NotificationListener = (items: NotificationItem[]) => void;

export interface NotificationContextType {
  success: (message: string, options?: NotifyOptions) => string;
  error: (message: string, options?: NotifyOptions) => string;
  warning: (message: string, options?: NotifyOptions) => string;
  info: (message: string, options?: NotifyOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
  notifications: NotificationItem[];
  // Backwards-compatible legacy helpers
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
  notify: (message: string, severity?: NotificationType) => void;
  closeNotification: () => void;
}
