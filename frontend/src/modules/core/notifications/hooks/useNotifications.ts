'use client';

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotificationsThunk,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
  deleteNotificationThunk,
  setPage,
  setPageSize,
  setUnreadOnly,
  setSelectedCategory,
  setSearchQuery,
  setSelectedNotification,
  resetFilters,
} from "../slices/notifications.slice";
import type { NotificationItem } from "../types";

export function useNotifications(autoFetch: boolean = true) {
  const dispatch = useAppDispatch();
  const {
    items,
    totalCount,
    unreadCount,
    page,
    pageSize,
    unreadOnly,
    selectedCategory,
    searchQuery,
    loading,
    error,
    selectedNotification,
  } = useAppSelector((state) => state.notifications);

  const fetchNotifications = useCallback(() => {
    dispatch(
      fetchNotificationsThunk({
        page,
        pageSize,
        unread: unreadOnly ? true : undefined,
        category: selectedCategory,
        search: searchQuery,
      })
    );
  }, [dispatch, page, pageSize, unreadOnly, selectedCategory, searchQuery]);

  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [autoFetch, fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      await dispatch(markNotificationReadThunk(id));
    },
    [dispatch]
  );

  const markAllAsRead = useCallback(async () => {
    await dispatch(markAllNotificationsReadThunk());
  }, [dispatch]);

  const deleteNotification = useCallback(
    async (id: string) => {
      await dispatch(deleteNotificationThunk(id));
    },
    [dispatch]
  );

  const handleSetPage = useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  const handleSetPageSize = useCallback(
    (newPageSize: number) => {
      dispatch(setPageSize(newPageSize));
    },
    [dispatch]
  );

  const handleSetUnreadOnly = useCallback(
    (newUnreadOnly: boolean) => {
      dispatch(setUnreadOnly(newUnreadOnly));
    },
    [dispatch]
  );

  const handleSetSelectedCategory = useCallback(
    (category: string | null) => {
      dispatch(setSelectedCategory(category));
    },
    [dispatch]
  );

  const handleSetSearchQuery = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  const handleSetSelectedNotification = useCallback(
    (item: NotificationItem | null) => {
      dispatch(setSelectedNotification(item));
    },
    [dispatch]
  );

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  return {
    items,
    totalCount,
    unreadCount,
    page,
    pageSize,
    unreadOnly,
    selectedCategory,
    searchQuery,
    loading,
    error,
    selectedNotification,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    setUnreadOnly: handleSetUnreadOnly,
    setSelectedCategory: handleSetSelectedCategory,
    setSearchQuery: handleSetSearchQuery,
    setSelectedNotification: handleSetSelectedNotification,
    resetFilters: handleResetFilters,
  };
}
