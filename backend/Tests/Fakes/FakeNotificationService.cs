using Application.Abstractions;
using Application.Common;
using Domain.Common;
using Domain.Enums;

namespace Tests.Fakes;

public class FakeNotificationService : INotificationService
{
    public List<(string UserId, string Title, string Message, NotificationCategory Category)> Notifications { get; } = new();

    public Task CreateAsync(string userId, string title, string message, NotificationCategory category = NotificationCategory.Info, string? actionUrl = null, CancellationToken cancellationToken = default)
    {
        Notifications.Add((userId, title, message, category));
        return Task.CompletedTask;
    }

    public Task<int> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default) => Task.FromResult(0);

    public Task<IReadOnlyList<NotificationItem>> GetRecentAsync(string userId, int take, CancellationToken cancellationToken = default) =>
        Task.FromResult<IReadOnlyList<NotificationItem>>(Array.Empty<NotificationItem>());

    public Task<NotificationItem?> GetSingleAsync(string userId, Guid notificationId, CancellationToken cancellationToken = default) =>
        Task.FromResult<NotificationItem?>(null);

    public Task<(IReadOnlyList<NotificationItem> Items, int TotalCount, int UnreadCount)> GetPageAsync(string userId, int page, int pageSize, bool unreadOnly, NotificationCategory? category = null, string? search = null, CancellationToken cancellationToken = default) =>
        Task.FromResult<(IReadOnlyList<NotificationItem> Items, int TotalCount, int UnreadCount)>((Array.Empty<NotificationItem>(), 0, 0));

    public Task MarkReadAsync(string userId, Guid notificationId, CancellationToken cancellationToken = default) => Task.CompletedTask;

    public Task MarkAllReadAsync(string userId, CancellationToken cancellationToken = default) => Task.CompletedTask;

    public Task<bool> DeleteAsync(string userId, Guid notificationId, CancellationToken cancellationToken = default) => Task.FromResult(true);

    public Task<GenericBaseResponse<object>> GetPageResponseAsync(string? userId, int page, int pageSize, bool unread, NotificationCategory? category = null, string? search = null, CancellationToken cancellationToken = default) =>
        Task.FromResult(GenericBaseResponse<object>.Success(new { }, "OK"));

    public Task<GenericBaseResponse<object>> GetSingleResponseAsync(string? userId, Guid id, CancellationToken cancellationToken = default) =>
        Task.FromResult(GenericBaseResponse<object>.Success(new { }, "OK"));

    public Task<GenericBaseResponse<int>> GetUnreadCountResponseAsync(string? userId, CancellationToken cancellationToken = default) =>
        Task.FromResult(GenericBaseResponse<int>.Success(0, "OK"));

    public Task<GenericBaseResponse<object>> GetRecentResponseAsync(string? userId, int take, CancellationToken cancellationToken = default) =>
        Task.FromResult(GenericBaseResponse<object>.Success(new { }, "OK"));

    public Task<GenericBaseResponse<object?>> MarkReadResponseAsync(string? userId, Guid id, CancellationToken cancellationToken = default) =>
        Task.FromResult(GenericBaseResponse<object?>.Success(null, "OK"));

    public Task<GenericBaseResponse<object?>> MarkAllReadResponseAsync(string? userId, CancellationToken cancellationToken = default) =>
        Task.FromResult(GenericBaseResponse<object?>.Success(null, "OK"));

    public Task<GenericBaseResponse<object?>> DeleteResponseAsync(string? userId, Guid id, CancellationToken cancellationToken = default) =>
        Task.FromResult(GenericBaseResponse<object?>.Success(null, "OK"));
}
