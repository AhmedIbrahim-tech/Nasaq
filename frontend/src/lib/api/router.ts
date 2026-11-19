const ROOT = "/api";
const VERSION = "v1";
const PREFIX = `${ROOT}/${VERSION}`;

export const Router = {
  Auth: {
    Prefix: `${PREFIX}/auth`,
    Login: `${PREFIX}/auth/login`,
    Refresh: `${PREFIX}/auth/refresh`,
    Logout: `${PREFIX}/auth/logout`,
    Me: `${PREFIX}/auth/me`,
    Profile: `${PREFIX}/auth/me/profile`,
    Avatar: `${PREFIX}/auth/me/avatar`,
    ChangePassword: `${PREFIX}/auth/me/change-password`,
    FirstLoginChangePassword: `${PREFIX}/auth/first-login-change-password`,
  },

  Notifications: {
    Prefix: `${PREFIX}/notifications`,
    GetById: (id: string | number) => `${PREFIX}/notifications/${encodeURIComponent(id)}`,
    MarkRead: (id: string | number) => `${PREFIX}/notifications/${encodeURIComponent(id)}/read`,
    ReadAll: `${PREFIX}/notifications/read-all`,
    UnreadCount: `${PREFIX}/notifications/unread-count`,
    Recent: `${PREFIX}/notifications/recent`,
  },

  Hubs: {
    Notifications: `${PREFIX}/hubs/notifications`,
  },
} as const;
