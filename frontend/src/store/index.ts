import { combineReducers, configureStore, createAction, UnknownAction } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import authReducer from "@/modules/auth/slices/auth.slice";
import notificationsReducer from "@/modules/core/notifications/slices/notifications.slice";
import employeesReducer from "@/modules/employees/slices/employee.slice";
import locationsReducer from "@/modules/locations/slices/locations.slice";
import leavesReducer from "@/modules/leaves/slices/leaves.slice";

// SSR-safe storage with cross-tab overwrite protection for Next.js
const createSafeStorage = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return {
      getItem: () => Promise.resolve(null),
      setItem: (_: string, val: unknown) => Promise.resolve(val),
      removeItem: () => Promise.resolve(),
    };
  }

  return {
    getItem: (key: string) => {
      try {
        return Promise.resolve(localStorage.getItem(key));
      } catch {
        return Promise.resolve(null);
      }
    },
    setItem: (key: string, value: string) => {
      try {
        if (key === "persist:auth") {
          const existingRaw = localStorage.getItem("persist:auth");
          if (existingRaw) {
            try {
              const incoming = JSON.parse(value);
              const existing = JSON.parse(existingRaw);

              const incomingRevision = incoming.sessionRevision
                ? Number(JSON.parse(incoming.sessionRevision)) || 0
                : 0;
              const existingRevision = existing.sessionRevision
                ? Number(JSON.parse(existing.sessionRevision)) || 0
                : 0;

              // If existing persisted storage has a strictly newer revision, reject stale write
              if (existingRevision > incomingRevision) {
                return Promise.resolve(value);
              }
            } catch {
              // If parse fails, proceed with standard write
            }
          }
        }

        localStorage.setItem(key, value);
        return Promise.resolve(value);
      } catch {
        return Promise.resolve(value);
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
  };
};

const storage = createSafeStorage();

const authPersistConfig = {
  key: "auth",
  version: 1,
  storage,
  whitelist: [
    "user",
    "roles",
    "accessToken",
    "refreshToken",
    "accessTokenExpiresAtUtc",
    "refreshTokenExpiresAtUtc",
    "sessionId",
    "sessionRevision",
  ],
};

export const purgeSensitiveAppState = createAction("app/purgeSensitiveState");

const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  notifications: notificationsReducer,
  employees: employeesReducer,
  locations: locationsReducer,
  leaves: leavesReducer,
});

/**
 * Root reducer with sensitive state purge.
 * Completely resets in-memory notifications when a session is terminated or an explicit logout occurs,
 * preventing data leakage across sessions. Preserves independent UI preferences.
 */
const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: UnknownAction
) => {
  if (
    action.type === purgeSensitiveAppState.type ||
    action.type === "auth/clearAuth" ||
    action.type === "auth/logout/fulfilled"
  ) {
    const authState = state?.auth;
    state = {
      auth: authState as any,
      notifications: undefined as any,
      employees: undefined as any,
      locations: undefined as any,
      leaves: undefined as any,
    };
  }
  return appReducer(state, action);
};



export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools:
    process.env.NODE_ENV !== "production"
      ? {
          actionSanitizer: (action: any) =>
            action.type?.startsWith("auth/login") && action.meta?.arg?.password
              ? {
                  ...action,
                  meta: {
                    ...action.meta,
                    arg: { ...action.meta.arg, password: "[REDACTED]" },
                  },
                }
              : action,
        }
      : false,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


