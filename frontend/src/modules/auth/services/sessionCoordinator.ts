import { AuthResponse, AuthUserResponse, CurrentUserResponse } from "../types";
import { NormalizedApiError } from "@/lib/api/errors";

export interface PersistedAuthData {
  user: AuthUserResponse | CurrentUserResponse | null;
  roles: string[];
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAtUtc: string | null;
  refreshTokenExpiresAtUtc: string | null;
  sessionId: string | null;
  sessionRevision: number;
}

export interface AuthenticatedPayload extends AuthResponse {
  sessionId: string;
  sessionRevision: number;
}

const AUTH_TRANSITION_LOCK_NAME = "corestarter_auth_transition_lock";

/**
 * Generates a standard UUID v4 for unique session identification.
 */
export function generateUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Executes a session transition under an exclusive cross-tab Web Lock.
 */
export async function executeWithAuthTransitionLock<T>(
  fn: () => Promise<T>
): Promise<T> {
  if (
    typeof navigator !== "undefined" &&
    navigator.locks &&
    typeof navigator.locks.request === "function"
  ) {
    return navigator.locks.request(AUTH_TRANSITION_LOCK_NAME, fn);
  }

  // If Web Locks API is unsupported, avoid uncoordinated concurrent mutations
  const error: NormalizedApiError = {
    status: 0,
    code: "LOCKS_UNSUPPORTED",
    message: "Web Locks API is not supported in this browser environment.",
  };
  throw error;
}

/**
 * Safely reads the authoritative persisted auth state from localStorage.
 */
export function getAuthoritativePersistedAuth(): PersistedAuthData | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  try {
    const raw = localStorage.getItem("persist:auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      user: parsed.user ? JSON.parse(parsed.user) : null,
      roles: parsed.roles ? JSON.parse(parsed.roles) : [],
      accessToken: parsed.accessToken ? JSON.parse(parsed.accessToken) : null,
      refreshToken: parsed.refreshToken ? JSON.parse(parsed.refreshToken) : null,
      accessTokenExpiresAtUtc: parsed.accessTokenExpiresAtUtc
        ? JSON.parse(parsed.accessTokenExpiresAtUtc)
        : null,
      refreshTokenExpiresAtUtc: parsed.refreshTokenExpiresAtUtc
        ? JSON.parse(parsed.refreshTokenExpiresAtUtc)
        : null,
      sessionId: parsed.sessionId ? JSON.parse(parsed.sessionId) : null,
      sessionRevision: parsed.sessionRevision
        ? Number(JSON.parse(parsed.sessionRevision)) || 0
        : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Synchronously writes the authoritative persisted auth state to localStorage
 * before releasing the transition lock.
 */
export function writeAuthoritativePersistedAuth(data: PersistedAuthData): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const existingRaw = localStorage.getItem("persist:auth");
    let version = 1;
    let rehydrated = true;
    if (existingRaw) {
      try {
        const parsed = JSON.parse(existingRaw);
        if (parsed._persist) {
          const persistObj = JSON.parse(parsed._persist);
          version = persistObj.version ?? 1;
          rehydrated = persistObj.rehydrated ?? true;
        }
      } catch {}
    }
    const serialized = {
      user: JSON.stringify(data.user),
      roles: JSON.stringify(data.roles),
      accessToken: JSON.stringify(data.accessToken),
      refreshToken: JSON.stringify(data.refreshToken),
      accessTokenExpiresAtUtc: JSON.stringify(data.accessTokenExpiresAtUtc),
      refreshTokenExpiresAtUtc: JSON.stringify(data.refreshTokenExpiresAtUtc),
      sessionId: JSON.stringify(data.sessionId),
      sessionRevision: JSON.stringify(data.sessionRevision),
      _persist: JSON.stringify({ version, rehydrated }),
    };
    localStorage.setItem("persist:auth", JSON.stringify(serialized));
  } catch {}
}

/**
 * Coordinates establishing a brand new authenticated session across tabs.
 */
export async function coordinateLogin(
  auth: AuthResponse
): Promise<AuthenticatedPayload> {
  return executeWithAuthTransitionLock(async () => {
    const existing = getAuthoritativePersistedAuth();
    const currentRevision = existing?.sessionRevision ?? 0;
    const nextRevision = currentRevision + 1;
    const newSessionId = generateUUID();

    const authData: PersistedAuthData = {
      user: auth.user,
      roles: auth.roles,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      accessTokenExpiresAtUtc: auth.accessTokenExpiresAtUtc,
      refreshTokenExpiresAtUtc: auth.refreshTokenExpiresAtUtc,
      sessionId: newSessionId,
      sessionRevision: nextRevision,
    };

    writeAuthoritativePersistedAuth(authData);

    return {
      ...auth,
      sessionId: newSessionId,
      sessionRevision: nextRevision,
    };
  });
}

export interface CoordinateRefreshParams {
  initialRefreshToken: string;
  initialSessionId: string | null;
  onExecuteRefresh: (refreshToken: string) => Promise<AuthResponse>;
}

/**
 * Coordinates rotating a session's refresh token across tabs.
 * - If another tab already rotated the token, reuses that rotated token without duplicate backend calls.
 * - Durably commits the rotated token to storage before releasing the lock.
 */
export async function coordinateRefresh({
  initialRefreshToken,
  initialSessionId,
  onExecuteRefresh,
}: CoordinateRefreshParams): Promise<AuthenticatedPayload> {
  return executeWithAuthTransitionLock(async () => {
    const existing = getAuthoritativePersistedAuth();

    if (!existing || !existing.refreshToken || !existing.sessionId) {
      const error: NormalizedApiError = {
        status: 401,
        code: "UNAUTHORIZED",
        message: "Session was terminated during refresh.",
      };
      throw error;
    }

    // 1. If another tab already rotated the token for this session, reuse it
    if (
      existing.sessionId === initialSessionId &&
      existing.refreshToken !== initialRefreshToken &&
      existing.user
    ) {
      return {
        accessToken: existing.accessToken || "",
        refreshToken: existing.refreshToken,
        accessTokenExpiresAtUtc: existing.accessTokenExpiresAtUtc || "",
        refreshTokenExpiresAtUtc: existing.refreshTokenExpiresAtUtc || "",
        user: existing.user as AuthUserResponse,
        roles: existing.roles,
        sessionId: existing.sessionId,
        sessionRevision: existing.sessionRevision,
      };
    }

    // 2. If session identity changed (e.g. user logged in as another account in another tab)
    if (existing.sessionId !== initialSessionId) {
      const error: NormalizedApiError = {
        status: 401,
        code: "UNAUTHORIZED",
        message: "Session was replaced in another tab.",
      };
      throw error;
    }

    // 3. Perform backend refresh call
    const response = await onExecuteRefresh(initialRefreshToken);

    const nextRevision = existing.sessionRevision + 1;
    const updatedData: PersistedAuthData = {
      user: response.user,
      roles: response.roles,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      accessTokenExpiresAtUtc: response.accessTokenExpiresAtUtc,
      refreshTokenExpiresAtUtc: response.refreshTokenExpiresAtUtc,
      sessionId: existing.sessionId,
      sessionRevision: nextRevision,
    };

    writeAuthoritativePersistedAuth(updatedData);

    return {
      ...response,
      sessionId: existing.sessionId,
      sessionRevision: nextRevision,
    };
  });
}

export interface CoordinateLogoutParams {
  refreshToken: string | null;
  onExecuteLogout: (refreshToken: string) => Promise<void>;
}

/**
 * Coordinates logging out of the active session across tabs.
 * Increments revision under lock so stale tabs cannot restore the old session.
 */
export async function coordinateLogout({
  refreshToken,
  onExecuteLogout,
}: CoordinateLogoutParams): Promise<number> {
  let nextRevision = 1;

  try {
    await executeWithAuthTransitionLock(async () => {
      const existing = getAuthoritativePersistedAuth();
      nextRevision = (existing?.sessionRevision ?? 0) + 1;

      const clearedData: PersistedAuthData = {
        user: null,
        roles: [],
        accessToken: null,
        refreshToken: null,
        accessTokenExpiresAtUtc: null,
        refreshTokenExpiresAtUtc: null,
        sessionId: null,
        sessionRevision: nextRevision,
      };

      writeAuthoritativePersistedAuth(clearedData);
    });
  } catch {
    // If Web Locks is unsupported or fails, still clear local storage directly
    const existing = getAuthoritativePersistedAuth();
    nextRevision = (existing?.sessionRevision ?? 0) + 1;
    writeAuthoritativePersistedAuth({
      user: null,
      roles: [],
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAtUtc: null,
      refreshTokenExpiresAtUtc: null,
      sessionId: null,
      sessionRevision: nextRevision,
    });
  }

  // Send backend revocation request
  if (refreshToken) {
    try {
      await onExecuteLogout(refreshToken);
    } catch {
      // Backend logout failures are safely non-blocking for local logout
    }
  }

  return nextRevision;
}

/**
 * Safely invalidates a local session across tabs under Web Lock without calling Backend Logout.
 * Used when a token has locally expired or was definitively rejected by the server.
 */
export async function coordinateLocalInvalidation(): Promise<number> {
  return coordinateLogout({
    refreshToken: null,
    onExecuteLogout: async () => {},
  });
}

