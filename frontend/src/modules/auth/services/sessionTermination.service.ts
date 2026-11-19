import { store, purgeSensitiveAppState } from "@/store";
import { clearAuth } from "../slices/auth.slice";
import { coordinateLocalInvalidation } from "./sessionCoordinator";
import { notify } from "@/shared/services/notification.service";
import { savePostLoginRedirect } from "@/shared/utils/safeNavigation";
import { sessionEventBus } from "./sessionEvents";

export type TerminationReason =
  | "session_expired"
  | "session_revoked"
  | "account_deactivated"
  | "default";

export interface TerminationTriggerOptions {
  reason?: TerminationReason;
  title?: string;
  message?: string;
  fromBroadcast?: boolean;
}

export interface SessionTerminationState {
  isOpen: boolean;
  reason: TerminationReason;
  title?: string;
  message?: string;
}

export type TerminationListener = (state: SessionTerminationState) => void;

/**
 * Centralized singleton controller managing mandatory global session termination across CoreStarter.
 * - Concurrency-safe: Deduplicates simultaneous 401s into a single termination sequence.
 * - Immediate Invalidation: Local session is wiped immediately under lock, blocking protected content.
 * - Sensitive State Purge: Redux sensitive business data (tenants, clients, suppliers, users, roles) wiped.
 * - Cross-Tab Synchronization: Propagates termination events to all other open tabs via sessionEventBus.
 * - Safe Return Navigation: Preserves the intended route so users can return after re-authentication.
 * - Suppresses redundant auth toasts while blocking modal is active.
 * - Guards special flows (first-login password setup) and prevents redirect loops on /login.
 */
export class SessionTerminationService {
  private state: SessionTerminationState = {
    isOpen: false,
    reason: "default",
  };
  private isTerminatingInProgress = false;
  private listeners: Set<TerminationListener> = new Set();
  private isBusSubscribed = false;

  constructor() {
    this.initCrossTabListener();
  }

  private initCrossTabListener(): void {
    if (this.isBusSubscribed || typeof window === "undefined") {
      return;
    }
    this.isBusSubscribed = true;

    sessionEventBus.subscribe((event) => {
      if (event.type === "SESSION_TERMINATED") {
        // Tab received termination notification from another tab
        this.triggerTermination({
          reason: event.reason,
          fromBroadcast: true,
        });
      }
    });
  }

  public isTerminating(): boolean {
    return this.isTerminatingInProgress || this.state.isOpen;
  }

  public getState(): SessionTerminationState {
    return { ...this.state };
  }

  public subscribe(listener: TerminationListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snapshot = { ...this.state };
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error("Error in SessionTermination listener:", err);
      }
    });
  }

  /**
   * Central trigger for mandatory session termination across CoreStarter.
   */
  public async triggerTermination(options?: TerminationTriggerOptions): Promise<void> {
    // 1. Guard against redirect loops if user is already on /login
    if (typeof window !== "undefined" && window.location.pathname.includes("/login")) {
      return;
    }

    // 2. Guard special flows: First-login mandatory password change
    try {
      const authState = store.getState()?.auth;
      if (authState?.requiresPasswordChange && authState?.setupToken) {
        return;
      }
    } catch {
      // Ignore store read errors during early initialization
    }

    // 3. Concurrency guard: Only ONE modal, ONE countdown, ONE cleanup sequence
    if (this.isTerminatingInProgress || this.state.isOpen) {
      return;
    }

    this.isTerminatingInProgress = true;

    // 4. Preserve intended internal return URL before credentials are wiped
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      const targetPath = window.location.pathname + window.location.search;
      savePostLoginRedirect(targetPath);
    }

    // 5. Suppress redundant authentication toasts while the blocking modal is active
    notify.setSuppressionFilter((_type, message, opts) => {
      if (!this.isTerminating()) return false;
      const text = `${opts?.title || ""} ${message}`.toLowerCase();
      return (
        text.includes("session") ||
        text.includes("expired") ||
        text.includes("unauthorized") ||
        text.includes("401") ||
        text.includes("sign in") ||
        text.includes("log in") ||
        text.includes("deactivat") ||
        text.includes("revok") ||
        text.includes("الجلسة") ||
        text.includes("تسجيل الدخول") ||
        text.includes("غير مصرح") ||
        text.includes("تعطيل")
      );
    });

    // Dismiss any existing auth error toasts
    notify.dismissMatching((item) => {
      const text = `${item.title || ""} ${item.message}`.toLowerCase();
      return (
        text.includes("session") ||
        text.includes("expired") ||
        text.includes("unauthorized") ||
        text.includes("401") ||
        text.includes("sign in") ||
        text.includes("log in") ||
        text.includes("deactivat") ||
        text.includes("revok") ||
        text.includes("الجلسة") ||
        text.includes("تسجيل الدخول") ||
        text.includes("غير مصرح") ||
        text.includes("تعطيل")
      );
    });

    const activeSessionId = store.getState()?.auth?.sessionId ?? null;
    const reason: TerminationReason = options?.reason || "session_expired";

    // 6. Broadcast termination event to other open tabs if initiated in this tab
    if (!options?.fromBroadcast) {
      sessionEventBus.broadcast({
        type: "SESSION_TERMINATED",
        sessionId: activeSessionId,
        reason,
      });
    }

    // 7. CRITICAL SECURITY REQUIREMENT:
    // Invalidate local authenticated state and block protected content IMMEDIATELY.
    // The 4-second delay is ONLY for displaying notification and progress animation.
    // It must NEVER extend user access to protected data or APIs.
    try {
      // Purge all sensitive cached business data (tenants, clients, suppliers, users, roles)
      store.dispatch(purgeSensitiveAppState());
      // Synchronously clear Redux memory auth state immediately
      store.dispatch(clearAuth());
      // Durably coordinate cross-tab clearance under Web Lock
      const finalRevision = await coordinateLocalInvalidation();
      store.dispatch(clearAuth({ sessionRevision: finalRevision }));
    } catch (err) {
      console.error("Failed to cleanly coordinate local invalidation:", err);
      store.dispatch(clearAuth());
    }

    // 8. Notify modal to display
    this.state = {
      isOpen: true,
      reason,
      title: options?.title,
      message: options?.message,
    };
    this.notify();
  }

  /**
   * Resets termination state after navigation to /login completes.
   */
  public reset(): void {
    this.isTerminatingInProgress = false;
    this.state = {
      isOpen: false,
      reason: "default",
    };
    notify.setSuppressionFilter(undefined);
    this.notify();
  }
}

export const sessionTerminationService = new SessionTerminationService();
export default sessionTerminationService;
