using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Common;
using Domain.Common;
using Domain.Enums;

namespace Application.Abstractions;

public interface INotificationService
{
    Task CreateAsync(string userId, string title, string message, NotificationCategory category = NotificationCategory.Info, string? actionUrl = null, CancellationToken cancellationToken = default);

    Task<int> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<NotificationItem>> GetRecentAsync(string userId, int take, CancellationToken cancellationToken = default);

    Task<NotificationItem?> GetSingleAsync(string userId, Guid notificationId, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<NotificationItem> Items, int TotalCount, int UnreadCount)> GetPageAsync(
        string userId,
        int page,
        int pageSize,
        bool unreadOnly,
        NotificationCategory? category = null,
        string? search = null,
        CancellationToken cancellationToken = default);

    Task MarkReadAsync(string userId, Guid notificationId, CancellationToken cancellationToken = default);

    Task MarkAllReadAsync(string userId, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(string userId, Guid notificationId, CancellationToken cancellationToken = default);

    Task<GenericBaseResponse<object>> GetPageResponseAsync(
        string? userId,
        int page,
        int pageSize,
        bool unread,
        NotificationCategory? category = null,
        string? search = null,
        CancellationToken cancellationToken = default);

    Task<GenericBaseResponse<object>> GetSingleResponseAsync(string? userId, Guid id, CancellationToken cancellationToken = default);
    Task<GenericBaseResponse<int>> GetUnreadCountResponseAsync(string? userId, CancellationToken cancellationToken = default);
    Task<GenericBaseResponse<object>> GetRecentResponseAsync(string? userId, int take, CancellationToken cancellationToken = default);
    Task<GenericBaseResponse<object?>> MarkReadResponseAsync(string? userId, Guid id, CancellationToken cancellationToken = default);
    Task<GenericBaseResponse<object?>> MarkAllReadResponseAsync(string? userId, CancellationToken cancellationToken = default);
    Task<GenericBaseResponse<object?>> DeleteResponseAsync(string? userId, Guid id, CancellationToken cancellationToken = default);
}
