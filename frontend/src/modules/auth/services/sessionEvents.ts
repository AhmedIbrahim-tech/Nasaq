/**
 * Cross-Tab Session Event Synchronization for CoreStarter
 * Synchronizes session termination, explicit logout, and token rotation across open browser tabs.
 *
 * Security & Architecture Guarantees:
 * - Uses BroadcastChannel API with fallback to localStorage storage events.
 * - Broadcasts strictly minimal, opaque metadata (Type, SessionId, Timestamp, Reason).
 * - NEVER serializes or broadcasts JWTs, refresh tokens, passwords, or PII.
 * - Concurrency & Loop Protection: Event deduplication and echo suppression prevent recursive loops.
 */

import type { TerminationReason } from "./sessionTermination.service";

export type SessionEventType =
  | "SESSION_TERMINATED"
  | "SESSION_LOGOUT"
  | "SESSION_REFRESHED";

export interface SessionBroadcastMessage {
  type: SessionEventType;
  sessionId: string | null;
  reason?: TerminationReason;
  revision?: number;
  timestamp: number;
}

const BROADCAST_CHANNEL_NAME = "corestarter_session_sync";
const STORAGE_FALLBACK_KEY = "corestarter_session_event_sync";
const DEDUPLICATION_WINDOW_MS = 1500;

export class SessionEventBus {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(event: SessionBroadcastMessage) => void> = new Set();
  private lastProcessedKeys: Map<string, number> = new Map();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window === "undefined" || this.isInitialized) {
      return;
    }
    this.isInitialized = true;

    // 1. Primary: BroadcastChannel API
    if (typeof BroadcastChannel !== "undefined") {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<SessionBroadcastMessage>) => {
          if (event.data && typeof event.data === "object") {
            this.handleIncomingEvent(event.data);
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel initialization failed, falling back to storage events:", err);
      }
    }

    // 2. Secondary / Compatibility Fallback: window storage event
    window.addEventListener("storage", (event: StorageEvent) => {
      if (event.key === STORAGE_FALLBACK_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as SessionBroadcastMessage;
          if (parsed && typeof parsed === "object") {
            this.handleIncomingEvent(parsed);
          }
        } catch {
          // Ignore malformed storage payload
        }
      }
    });
  }

  private handleIncomingEvent(event: SessionBroadcastMessage): void {
    const now = Date.now();
    // Deduplicate identical events received within the deduplication window
    const eventKey = `${event.type}:${event.sessionId ?? ""}:${event.reason ?? ""}`;
    const lastTimestamp = this.lastProcessedKeys.get(eventKey);

    if (lastTimestamp && now - lastTimestamp < DEDUPLICATION_WINDOW_MS) {
      return;
    }

    this.lastProcessedKeys.set(eventKey, now);

    // Clean up older keys
    if (this.lastProcessedKeys.size > 50) {
      this.lastProcessedKeys.forEach((ts, k) => {
        if (now - ts > DEDUPLICATION_WINDOW_MS * 2) {
          this.lastProcessedKeys.delete(k);
        }
      });
    }

    // Notify registered listeners
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in session event listener:", err);
      }
    });
  }

  /**
   * Broadcasts a minimal session event to all other open tabs in the browser.
   */
  public broadcast(event: Omit<SessionBroadcastMessage, "timestamp">): void {
    if (typeof window === "undefined") {
      return;
    }

    const payload: SessionBroadcastMessage = {
      ...event,
      timestamp: Date.now(),
    };

    // Mark locally so this tab does not redundantly process its own outbound event
    const eventKey = `${payload.type}:${payload.sessionId ?? ""}:${payload.reason ?? ""}`;
    this.lastProcessedKeys.set(eventKey, payload.timestamp);

    // 1. BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (err) {
        console.warn("Failed to post message to BroadcastChannel:", err);
      }
    }

    // 2. Storage event fallback
    try {
      localStorage.setItem(STORAGE_FALLBACK_KEY, JSON.stringify(payload));
      // Remove shortly after to allow re-triggering with new timestamps
      setTimeout(() => {
        try {
          localStorage.removeItem(STORAGE_FALLBACK_KEY);
        } catch {}
      }, 500);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }

  /**
   * Subscribes to cross-tab session events.
   */
  public subscribe(listener: (event: SessionBroadcastMessage) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const sessionEventBus = new SessionEventBus();
export default sessionEventBus;
