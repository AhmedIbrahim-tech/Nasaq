'use client';

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUnreadCountThunk,
  fetchRecentNotificationsThunk,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
} from "../slices/notifications.slice";

export function useHeaderNotifications() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const { unreadCount, recentItems, recentLoading } = useAppSelector(
    (state) => state.notifications
  );

  const fetchUnreadCount = useCallback(() => {
    if (accessToken) {
      dispatch(fetchUnreadCountThunk());
    }
  }, [dispatch, accessToken]);

  const fetchRecent = useCallback(
    (take: number = 5) => {
      if (accessToken) {
        dispatch(fetchRecentNotificationsThunk(take));
      }
    },
    [dispatch, accessToken]
  );

  useEffect(() => {
    if (accessToken) {
      fetchUnreadCount();
    }
  }, [accessToken, fetchUnreadCount]);

  const markAsRead = useCallback(
    async (id: string) => {
      await dispatch(markNotificationReadThunk(id));
    },
    [dispatch]
  );

  const markAllAsRead = useCallback(async () => {
    await dispatch(markAllNotificationsReadThunk());
  }, [dispatch]);

  return {
    unreadCount,
    recentItems,
    recentLoading,
    fetchUnreadCount,
    fetchRecent,
    markAsRead,
    markAllAsRead,
  };
}
