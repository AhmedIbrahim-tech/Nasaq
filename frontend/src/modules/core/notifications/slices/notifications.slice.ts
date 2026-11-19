import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { notificationsService } from "../services/notifications.service";
import type {
  NotificationFilterParams,
  NotificationItem,
  NotificationPageResponse,
  NotificationsState,
  RecentNotificationsResponse,
} from "../types";

export const fetchNotificationsThunk = createAsyncThunk<
  NotificationPageResponse,
  NotificationFilterParams | undefined
>("notifications/fetchNotifications", async (params, { rejectWithValue }) => {
  try {
    return await notificationsService.getNotifications(params);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to load notifications.");
  }
});

export const fetchUnreadCountThunk = createAsyncThunk<number>(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationsService.getUnreadCount();
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load unread count.");
    }
  }
);

export const fetchRecentNotificationsThunk = createAsyncThunk<
  RecentNotificationsResponse,
  number | undefined
>("notifications/fetchRecentNotifications", async (take = 5, { rejectWithValue }) => {
  try {
    return await notificationsService.getRecentNotifications(take);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to load recent notifications.");
  }
});

export const markNotificationReadThunk = createAsyncThunk<string, string>(
  "notifications/markNotificationRead",
  async (id, { rejectWithValue }) => {
    try {
      await notificationsService.markAsRead(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark notification as read.");
    }
  }
);

export const markAllNotificationsReadThunk = createAsyncThunk<void>(
  "notifications/markAllNotificationsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationsService.markAllAsRead();
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark all notifications as read.");
    }
  }
);

export const deleteNotificationThunk = createAsyncThunk<string, string>(
  "notifications/deleteNotification",
  async (id, { rejectWithValue }) => {
    try {
      await notificationsService.deleteNotification(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete notification.");
    }
  }
);

const initialState: NotificationsState = {
  items: [],
  totalCount: 0,
  unreadCount: 0,
  page: 1,
  pageSize: 10,
  unreadOnly: false,
  selectedCategory: null,
  searchQuery: "",
  loading: "idle",
  error: null,
  recentItems: [],
  recentLoading: false,
  selectedNotification: null,
};

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    setUnreadOnly: (state, action: PayloadAction<boolean>) => {
      state.unreadOnly = action.payload;
      state.page = 1;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      state.page = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setSelectedNotification: (state, action: PayloadAction<NotificationItem | null>) => {
      state.selectedNotification = action.payload;
    },
    resetFilters: (state) => {
      state.page = 1;
      state.unreadOnly = false;
      state.selectedCategory = null;
      state.searchQuery = "";
    },
    notificationReceived: (state, action: PayloadAction<NotificationItem>) => {
      const incoming = action.payload;
      const existsInItems = state.items.some((n) => n.id === incoming.id);
      if (!existsInItems) {
        const matchesCategory = !state.selectedCategory || incoming.category === state.selectedCategory;
        const matchesSearch =
          !state.searchQuery ||
          incoming.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          incoming.message.toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesUnread = !state.unreadOnly || !incoming.isRead;

        if (state.page === 1 && matchesCategory && matchesSearch && matchesUnread) {
          state.items.unshift(incoming);
          if (state.items.length > state.pageSize) {
            state.items.pop();
          }
        }
        state.totalCount += 1;
        if (!incoming.isRead) {
          state.unreadCount += 1;
        }
      }

      const existsInRecent = state.recentItems.some((n) => n.id === incoming.id);
      if (!existsInRecent) {
        state.recentItems.unshift(incoming);
        if (state.recentItems.length > 5) {
          state.recentItems.pop();
        }
      }
    },
    notificationReadUpdated: (state, action: PayloadAction<{ id: string; isRead: boolean }>) => {
      const { id, isRead } = action.payload;
      const item = state.items.find((n) => n.id === id);
      if (item && item.isRead !== isRead) {
        item.isRead = isRead;
        if (isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else {
          state.unreadCount += 1;
        }
      }
      const recent = state.recentItems.find((n) => n.id === id);
      if (recent) {
        recent.isRead = isRead;
      }
      if (state.selectedNotification?.id === id) {
        state.selectedNotification.isRead = isRead;
      }
    },
    notificationsAllReadUpdated: (state) => {
      state.items.forEach((item) => {
        item.isRead = true;
      });
      state.recentItems.forEach((item) => {
        item.isRead = true;
      });
      state.unreadCount = 0;
      if (state.selectedNotification) {
        state.selectedNotification.isRead = true;
      }
    },
    notificationDeletedLocally: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.items.findIndex((n) => n.id === id);
      if (index !== -1) {
        const item = state.items[index];
        if (!item.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items.splice(index, 1);
        state.totalCount = Math.max(0, state.totalCount - 1);
      }
      state.recentItems = state.recentItems.filter((n) => n.id !== id);
      if (state.selectedNotification?.id === id) {
        state.selectedNotification = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.items = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.unreadCount = action.payload.unreadCount;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.loading = "failed";
        state.error = (action.payload as string) || "Failed to fetch notifications.";
      });

    // Fetch unread count
    builder.addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    // Fetch recent notifications
    builder
      .addCase(fetchRecentNotificationsThunk.pending, (state) => {
        state.recentLoading = true;
      })
      .addCase(fetchRecentNotificationsThunk.fulfilled, (state, action) => {
        state.recentLoading = false;
        state.recentItems = action.payload.items;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchRecentNotificationsThunk.rejected, (state) => {
        state.recentLoading = false;
      });

    // Mark single as read
    builder.addCase(markNotificationReadThunk.fulfilled, (state, action) => {
      const id = action.payload;
      const item = state.items.find((n) => n.id === id);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      const recent = state.recentItems.find((n) => n.id === id);
      if (recent && !recent.isRead) {
        recent.isRead = true;
      }
      if (state.selectedNotification?.id === id) {
        state.selectedNotification.isRead = true;
      }
    });

    // Mark all as read
    builder.addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
      state.items.forEach((item) => {
        item.isRead = true;
      });
      state.recentItems.forEach((item) => {
        item.isRead = true;
      });
      state.unreadCount = 0;
      if (state.selectedNotification) {
        state.selectedNotification.isRead = true;
      }
    });

    // Delete single notification
    builder.addCase(deleteNotificationThunk.fulfilled, (state, action) => {
      const id = action.payload;
      const index = state.items.findIndex((n) => n.id === id);
      if (index !== -1) {
        const item = state.items[index];
        if (!item.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items.splice(index, 1);
        state.totalCount = Math.max(0, state.totalCount - 1);
      }
      state.recentItems = state.recentItems.filter((n) => n.id !== id);
      if (state.selectedNotification?.id === id) {
        state.selectedNotification = null;
      }
    });
  },
});

export const {
  setPage,
  setPageSize,
  setUnreadOnly,
  setSelectedCategory,
  setSearchQuery,
  setSelectedNotification,
  resetFilters,
  notificationReceived,
  notificationReadUpdated,
  notificationsAllReadUpdated,
  notificationDeletedLocally,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
