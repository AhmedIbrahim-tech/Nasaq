import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  HttpTransportType,
} from "@microsoft/signalr";
import { Router } from "@/lib/api/router";
import type { AppDispatch } from "@/store";
import type { NotificationItem } from "../types";
import {
  notificationReceived,
  notificationReadUpdated,
  notificationsAllReadUpdated,
  notificationDeletedLocally,
  fetchUnreadCountThunk,
  fetchRecentNotificationsThunk,
} from "../slices/notifications.slice";

class NotificationsRealtimeService {
  private connection: HubConnection | null = null;
  private currentToken: string | null = null;
  private dispatch: AppDispatch | null = null;
  private isStarting = false;

  private getHubUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7155";
    return `${baseUrl.replace(/\/+$/, "")}${Router.Hubs.Notifications}`;
  }

  public async start(accessToken: string, dispatch: AppDispatch): Promise<void> {
    this.dispatch = dispatch;

    if (!accessToken) {
      await this.stop();
      return;
    }

    if (
      this.connection &&
      this.currentToken === accessToken &&
      (this.connection.state === HubConnectionState.Connected ||
        this.connection.state === HubConnectionState.Connecting ||
        this.connection.state === HubConnectionState.Reconnecting ||
        this.isStarting)
    ) {
      return;
    }

    if (this.connection) {
      await this.stop();
    }

    this.currentToken = accessToken;
    this.isStarting = true;

    try {
      const hubUrl = this.getHubUrl();
      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => this.currentToken || "",
          transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(process.env.NODE_ENV === "development" ? LogLevel.Information : LogLevel.Warning)
        .build();

      connection.on("NotificationCreated", (item: NotificationItem) => {
        if (this.dispatch && item) {
          this.dispatch(notificationReceived(item));
        }
      });

      connection.on("NotificationReadStateChanged", (payload: { id: string; isRead: boolean }) => {
        if (this.dispatch && payload?.id) {
          this.dispatch(notificationReadUpdated(payload));
        }
      });

      connection.on("NotificationsMarkedAllRead", () => {
        if (this.dispatch) {
          this.dispatch(notificationsAllReadUpdated());
        }
      });

      connection.on("NotificationDeleted", (payload: { id: string }) => {
        if (this.dispatch && payload?.id) {
          this.dispatch(notificationDeletedLocally(payload.id));
        }
      });

      connection.onreconnected(() => {
        if (this.dispatch) {
          this.dispatch(fetchUnreadCountThunk());
          this.dispatch(fetchRecentNotificationsThunk());
        }
      });

      connection.onclose(() => {
        this.isStarting = false;
      });

      await connection.start();
      this.connection = connection;
    } catch {
      // Gracefully catch initial connection error - automatic retry or re-authentication will resume
    } finally {
      this.isStarting = false;
    }
  }

  public async stop(): Promise<void> {
    this.isStarting = false;
    this.currentToken = null;
    if (this.connection) {
      try {
        if (this.connection.state !== HubConnectionState.Disconnected) {
          await this.connection.stop();
        }
      } catch {
        // Suppress disconnection errors during teardown
      } finally {
        this.connection = null;
      }
    }
  }

  public getConnectionState(): HubConnectionState {
    return this.connection ? this.connection.state : HubConnectionState.Disconnected;
  }
}

export const notificationsRealtimeService = new NotificationsRealtimeService();
