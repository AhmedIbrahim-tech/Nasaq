export type NotificationCategory =
  | 'Info'
  | 'Success'
  | 'Warning'
  | 'Error'
  | 'Sale'
  | 'Purchase'
  | 'Expense'
  | 'BankOperation'
  | 'TreasuryOperation'
  | (string & {});

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  actionUrl: string | null;
  isRead: boolean;
  createdUtc: string;
}

export interface NotificationPageResponse {
  items: NotificationItem[];
  totalCount: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  unreadOnly: boolean;
}

export interface RecentNotificationsResponse {
  items: NotificationItem[];
  unreadCount: number;
}

export interface NotificationFilterParams {
  page?: number;
  pageSize?: number;
  unread?: boolean;
  category?: string | null;
  search?: string;
}

export interface NotificationsState {
  items: NotificationItem[];
  totalCount: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  unreadOnly: boolean;
  selectedCategory: string | null;
  searchQuery: string;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  recentItems: NotificationItem[];
  recentLoading: boolean;
  selectedNotification: NotificationItem | null;
}
