import {
  NotificationItem,
  NotificationListener,
  NotificationType,
  NotifyOptions,
} from '../types/notification.types';

const DEFAULT_DURATIONS: Record<NotificationType, number> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 6000,
};

const MAX_VISIBLE_NOTIFICATIONS = 4;
const DEDUPLICATION_WINDOW_MS = 2000;

class NotificationService {
  private items: NotificationItem[] = [];
  private listeners: Set<NotificationListener> = new Set();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private recentMessages: Map<string, { id: string; timestamp: number }> = new Map();
  private suppressionFilter?: (type: NotificationType, message: string, options?: NotifyOptions) => boolean;

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private notifyListeners(): void {
    const snapshot = [...this.items];
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('Error notifying notification listener:', err);
      }
    });
  }

  private isDuplicate(type: NotificationType, message: string): string | null {
    const key = `${type}:${message.trim()}`;
    const now = Date.now();
    const existing = this.recentMessages.get(key);

    if (existing && now - existing.timestamp < DEDUPLICATION_WINDOW_MS) {
      return existing.id;
    }

    return null;
  }

  private recordRecent(type: NotificationType, message: string, id: string): void {
    const key = `${type}:${message.trim()}`;
    this.recentMessages.set(key, { id, timestamp: Date.now() });

    // Clean up older records periodically
    if (this.recentMessages.size > 50) {
      const now = Date.now();
      this.recentMessages.forEach((v, k) => {
        if (now - v.timestamp > DEDUPLICATION_WINDOW_MS * 2) {
          this.recentMessages.delete(k);
        }
      });
    }
  }

  private scheduleDismissal(id: string, duration: number): void {
    if (typeof window === 'undefined' || duration <= 0) return;

    // Clear existing timer if any
    const existingTimer = this.timers.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.timers.delete(id);
    }

    const timer = setTimeout(() => {
      this.dismiss(id);
    }, duration);

    this.timers.set(id, timer);
  }

  public setSuppressionFilter(
    filter: ((type: NotificationType, message: string, options?: NotifyOptions) => boolean) | undefined
  ): void {
    this.suppressionFilter = filter;
  }

  public add(type: NotificationType, message: string, options?: NotifyOptions): string {
    const cleanMessage = (message || '').trim();
    if (!cleanMessage) return '';

    // Check suppression filter (e.g. blocking session termination active)
    if (this.suppressionFilter && this.suppressionFilter(type, cleanMessage, options)) {
      return '';
    }

    // Check duplicate suppression
    const duplicateId = this.isDuplicate(type, cleanMessage);
    if (duplicateId) {
      return duplicateId;
    }

    const id = options?.id || this.generateId();
    const persistent = Boolean(options?.persistent);
    const duration = persistent ? 0 : options?.duration ?? DEFAULT_DURATIONS[type];

    const item: NotificationItem = {
      id,
      type,
      message: cleanMessage,
      title: options?.title,
      duration,
      persistent,
      createdAt: Date.now(),
      action: options?.action,
    };

    this.recordRecent(type, cleanMessage, id);

    // Enforce bounded queue
    if (this.items.length >= MAX_VISIBLE_NOTIFICATIONS) {
      // Find oldest non-persistent item to evict first
      const oldestIndex = this.items.findIndex((n) => !n.persistent);
      if (oldestIndex !== -1) {
        const evicted = this.items[oldestIndex];
        this.dismiss(evicted.id);
      } else {
        // If all are persistent, evict the very oldest
        const evicted = this.items[0];
        this.dismiss(evicted.id);
      }
    }

    this.items = [...this.items, item];
    this.scheduleDismissal(id, duration);
    this.notifyListeners();

    return id;
  }

  public success(message: string, options?: NotifyOptions): string {
    return this.add('success', message, options);
  }

  public error(message: string, options?: NotifyOptions): string {
    return this.add('error', message, options);
  }

  public warning(message: string, options?: NotifyOptions): string {
    return this.add('warning', message, options);
  }

  public info(message: string, options?: NotifyOptions): string {
    return this.add('info', message, options);
  }

  public dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    const nextItems = this.items.filter((item) => item.id !== id);
    if (nextItems.length !== this.items.length) {
      this.items = nextItems;
      this.notifyListeners();
    }
  }

  public dismissMatching(predicate: (item: NotificationItem) => boolean): void {
    const matching = this.items.filter(predicate);
    if (matching.length > 0) {
      matching.forEach((item) => {
        const timer = this.timers.get(item.id);
        if (timer) {
          clearTimeout(timer);
          this.timers.delete(item.id);
        }
      });
      this.items = this.items.filter((item) => !predicate(item));
      this.notifyListeners();
    }
  }

  public clear(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.items = [];
    this.notifyListeners();
  }

  public getItems(): NotificationItem[] {
    return [...this.items];
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    // Initial emit
    listener([...this.items]);

    return () => {
      this.listeners.delete(listener);
    };
  }
}

// Global singleton instance
export const notify = new NotificationService();
export default notify;
