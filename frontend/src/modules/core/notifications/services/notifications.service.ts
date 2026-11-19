import { api } from "@/lib/api/api";
import { Router } from "@/lib/api/router";
import type { GenericBaseResponse } from "@/shared/types/api.types";
import type {
  NotificationFilterParams,
  NotificationItem,
  NotificationPageResponse,
  RecentNotificationsResponse,
} from "../types";

export const notificationsService = {
  async getNotifications(
    params: NotificationFilterParams = {}
  ): Promise<NotificationPageResponse> {
    const queryParams: Record<string, any> = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;
    if (params.unread !== undefined) queryParams.unread = params.unread;
    if (params.category) queryParams.category = params.category;
    if (params.search && params.search.trim()) queryParams.search = params.search.trim();

    const response = await api.get<GenericBaseResponse<NotificationPageResponse>>(
      Router.Notifications.Prefix,
      { params: queryParams }
    );

    if (!response.data.data) {
      return {
        items: [],
        totalCount: 0,
        unreadCount: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        unreadOnly: Boolean(params.unread),
      };
    }

    return response.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<GenericBaseResponse<number>>(
      Router.Notifications.UnreadCount
    );
    return response.data.data ?? 0;
  },

  async getRecentNotifications(take: number = 5): Promise<RecentNotificationsResponse> {
    const response = await api.get<GenericBaseResponse<RecentNotificationsResponse>>(
      Router.Notifications.Recent,
      { params: { take } }
    );
    return response.data.data ?? { items: [], unreadCount: 0 };
  },

  async getNotificationById(id: string): Promise<NotificationItem> {
    const response = await api.get<GenericBaseResponse<NotificationItem>>(
      Router.Notifications.GetById(id)
    );
    if (!response.data.data) {
      throw new Error("Notification not found.");
    }
    return response.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.post<GenericBaseResponse<object | null>>(
      Router.Notifications.MarkRead(id)
    );
  },

  async markAllAsRead(): Promise<void> {
    await api.post<GenericBaseResponse<object | null>>(
      Router.Notifications.ReadAll
    );
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete<GenericBaseResponse<object | null>>(
      Router.Notifications.GetById(id)
    );
  },
};
