using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions;
using Application.Common;
using Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public sealed class NotificationRealtimePublisher : INotificationRealtimePublisher
{
    private readonly IHubContext<NotificationsHub> _hubContext;
    private readonly ILogger<NotificationRealtimePublisher> _logger;

    public NotificationRealtimePublisher(
        IHubContext<NotificationsHub> hubContext,
        ILogger<NotificationRealtimePublisher> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task PublishCreatedAsync(string userId, NotificationItem notification, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return;

        try
        {
            await _hubContext.Clients.User(userId).SendAsync("NotificationCreated", notification, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to publish real-time notification created event for user {UserId}", userId);
        }
    }

    public async Task PublishReadStateChangedAsync(string userId, Guid notificationId, bool isRead, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return;

        try
        {
            await _hubContext.Clients.User(userId).SendAsync("NotificationReadStateChanged", new { id = notificationId, isRead }, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to publish real-time read state change for user {UserId}, notification {NotificationId}", userId, notificationId);
        }
    }

    public async Task PublishMarkedAllReadAsync(string userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return;

        try
        {
            await _hubContext.Clients.User(userId).SendAsync("NotificationsMarkedAllRead", new { userId }, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to publish real-time marked all read event for user {UserId}", userId);
        }
    }

    public async Task PublishDeletedAsync(string userId, Guid notificationId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return;

        try
        {
            await _hubContext.Clients.User(userId).SendAsync("NotificationDeleted", new { id = notificationId }, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to publish real-time notification deleted event for user {UserId}, notification {NotificationId}", userId, notificationId);
        }
    }
}
