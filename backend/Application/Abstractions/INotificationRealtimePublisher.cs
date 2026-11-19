using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Common;

namespace Application.Abstractions;

public interface INotificationRealtimePublisher
{
    Task PublishCreatedAsync(string userId, NotificationItem notification, CancellationToken cancellationToken = default);
    Task PublishReadStateChangedAsync(string userId, Guid notificationId, bool isRead, CancellationToken cancellationToken = default);
    Task PublishMarkedAllReadAsync(string userId, CancellationToken cancellationToken = default);
    Task PublishDeletedAsync(string userId, Guid notificationId, CancellationToken cancellationToken = default);
}
