using Application.Common;

namespace Infrastructure.Services;

public sealed class NotificationService(
    IUnitOfWork unitOfWork,
    INotificationRealtimePublisher publisher,
    ILogger<NotificationService> logger)
    : ResponseHandler, INotificationService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INotificationRealtimePublisher _publisher = publisher;
    private readonly ILogger<NotificationService> _logger = logger;

    public async Task CreateAsync(string userId, string title, string message, NotificationCategory category = NotificationCategory.Info, string? actionUrl = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return;

        var entity = new AppNotification
        {
            User_ID = userId,
            Title = title.Trim(),
            Message = message.Trim(),
            Category = category,
            Action_Url = string.IsNullOrWhiteSpace(actionUrl) ? null : actionUrl.Trim(),
            Is_Read = false,
            Created_Utc = DateTime.UtcNow
        };

        await _unitOfWork.AppNotifications.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var item = new NotificationItem(
            entity.Notification_ID,
            entity.Title,
            entity.Message,
            entity.Category,
            entity.Action_Url,
            entity.Is_Read,
            entity.Created_Utc);

        if (_unitOfWork.HasActiveTransaction)
        {
            _unitOfWork.RegisterPostCommitAction(async () =>
            {
                await _publisher.PublishCreatedAsync(userId, item);
            });
        }
        else
        {
            try
            {
                await _publisher.PublishCreatedAsync(userId, item, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to publish created notification realtime event for user {UserId}", userId);
            }
        }
    }

    public Task<int> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default) =>
        _unitOfWork.AppNotifications.Query()
            .AsNoTracking()
            .CountAsync(n => n.User_ID == userId && !n.Is_Read, cancellationToken);

    public async Task<IReadOnlyList<NotificationItem>> GetRecentAsync(string userId, int take, CancellationToken cancellationToken = default)
    {
        take = Math.Clamp(take, 1, 50);
        return await _unitOfWork.AppNotifications.Query()
            .AsNoTracking()
            .Where(n => n.User_ID == userId)
            .OrderByDescending(n => n.Created_Utc)
            .Take(take)
            .Select(n => new NotificationItem(
                n.Notification_ID,
                n.Title,
                n.Message,
                n.Category,
                n.Action_Url,
                n.Is_Read,
                n.Created_Utc))
            .ToListAsync(cancellationToken);
    }

    public Task<NotificationItem?> GetSingleAsync(string userId, Guid notificationId, CancellationToken cancellationToken = default) =>
        _unitOfWork.AppNotifications.Query()
            .AsNoTracking()
            .Where(n => n.Notification_ID == notificationId && n.User_ID == userId)
            .Select(n => new NotificationItem(
                n.Notification_ID,
                n.Title,
                n.Message,
                n.Category,
                n.Action_Url,
                n.Is_Read,
                n.Created_Utc))
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<(IReadOnlyList<NotificationItem> Items, int TotalCount, int UnreadCount)> GetPageAsync(
        string userId,
        int page,
        int pageSize,
        bool unreadOnly,
        NotificationCategory? category = null,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var baseQuery = _unitOfWork.AppNotifications.Query().AsNoTracking().Where(n => n.User_ID == userId);
        if (unreadOnly)
            baseQuery = baseQuery.Where(n => !n.Is_Read);

        if (category.HasValue)
            baseQuery = baseQuery.Where(n => n.Category == category.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var trimmed = search.Trim();
            baseQuery = baseQuery.Where(n => n.Title.Contains(trimmed) || n.Message.Contains(trimmed));
        }

        var total = await baseQuery.CountAsync(cancellationToken);
        var unreadCount = await _unitOfWork.AppNotifications.Query()
            .AsNoTracking()
            .CountAsync(n => n.User_ID == userId && !n.Is_Read, cancellationToken);

        var items = await baseQuery
            .OrderByDescending(n => n.Created_Utc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationItem(
                n.Notification_ID,
                n.Title,
                n.Message,
                n.Category,
                n.Action_Url,
                n.Is_Read,
                n.Created_Utc))
            .ToListAsync(cancellationToken);

        return (items, total, unreadCount);
    }

    public async Task MarkReadAsync(string userId, Guid notificationId, CancellationToken cancellationToken = default)
    {
        var entity = await _unitOfWork.AppNotifications.Query()
            .FirstOrDefaultAsync(n => n.Notification_ID == notificationId && n.User_ID == userId, cancellationToken);
        if (entity is null || entity.Is_Read)
            return;

        entity.Is_Read = true;
        _unitOfWork.AppNotifications.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (_unitOfWork.HasActiveTransaction)
        {
            _unitOfWork.RegisterPostCommitAction(async () =>
            {
                await _publisher.PublishReadStateChangedAsync(userId, notificationId, true);
            });
        }
        else
        {
            try
            {
                await _publisher.PublishReadStateChangedAsync(userId, notificationId, true, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to publish read state change realtime event for user {UserId}, notification {NotificationId}", userId, notificationId);
            }
        }
    }

    public async Task MarkAllReadAsync(string userId, CancellationToken cancellationToken = default)
    {
        await _unitOfWork.AppNotifications.Query()
            .Where(n => n.User_ID == userId && !n.Is_Read)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.Is_Read, true), cancellationToken);

        if (_unitOfWork.HasActiveTransaction)
        {
            _unitOfWork.RegisterPostCommitAction(async () =>
            {
                await _publisher.PublishMarkedAllReadAsync(userId);
            });
        }
        else
        {
            try
            {
                await _publisher.PublishMarkedAllReadAsync(userId, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to publish marked all read realtime event for user {UserId}", userId);
            }
        }
    }

    public async Task<bool> DeleteAsync(string userId, Guid notificationId, CancellationToken cancellationToken = default)
    {
        var entity = await _unitOfWork.AppNotifications.Query()
            .FirstOrDefaultAsync(n => n.Notification_ID == notificationId && n.User_ID == userId, cancellationToken);
        if (entity is null)
            return false;

        _unitOfWork.AppNotifications.Remove(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (_unitOfWork.HasActiveTransaction)
        {
            _unitOfWork.RegisterPostCommitAction(async () =>
            {
                await _publisher.PublishDeletedAsync(userId, notificationId);
            });
        }
        else
        {
            try
            {
                await _publisher.PublishDeletedAsync(userId, notificationId, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to publish deleted notification realtime event for user {UserId}, notification {NotificationId}", userId, notificationId);
            }
        }
        return true;
    }

    public async Task<GenericBaseResponse<object>> GetPageResponseAsync(
        string? userId,
        int page,
        int pageSize,
        bool unread,
        NotificationCategory? category = null,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(userId))
            return Unauthorized<object>();
        var (items, total, unreadCount) = await GetPageAsync(userId, page, pageSize, unread, category, search, cancellationToken);
        return Success<object>(new { items, totalCount = total, unreadCount, page, pageSize, unreadOnly = unread });
    }

    public async Task<GenericBaseResponse<object>> GetSingleResponseAsync(string? userId, Guid id, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(userId))
            return Unauthorized<object>();
        var item = await GetSingleAsync(userId, id, cancellationToken);
        if (item is null)
            return NotFound<object>("Notification not found.");
        return Success<object>(item);
    }

    public async Task<GenericBaseResponse<int>> GetUnreadCountResponseAsync(string? userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(userId))
            return Unauthorized<int>();
        var count = await GetUnreadCountAsync(userId, cancellationToken);
        return Success(count);
    }

    public async Task<GenericBaseResponse<object>> GetRecentResponseAsync(string? userId, int take, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(userId))
            return Unauthorized<object>();
        var items = await GetRecentAsync(userId, take, cancellationToken);
        var unreadCount = await GetUnreadCountAsync(userId, cancellationToken);
        return Success<object>(new { items, unreadCount });
    }

    public async Task<GenericBaseResponse<object?>> MarkReadResponseAsync(string? userId, Guid id, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(userId))
            return Unauthorized<object?>();
        var item = await GetSingleAsync(userId, id, cancellationToken);
        if (item is null)
            return NotFound<object?>("Notification not found.");
        await MarkReadAsync(userId, id, cancellationToken);
        return Success<object?>(null, "Success");
    }

    public async Task<GenericBaseResponse<object?>> MarkAllReadResponseAsync(string? userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(userId))
            return Unauthorized<object?>();
        await MarkAllReadAsync(userId, cancellationToken);
        return Success<object?>(null, "Success");
    }

    public async Task<GenericBaseResponse<object?>> DeleteResponseAsync(string? userId, Guid id, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(userId))
            return Unauthorized<object?>();
        var deleted = await DeleteAsync(userId, id, cancellationToken);
        if (!deleted)
            return NotFound<object?>("Notification not found.");
        return Success<object?>(null, "Notification deleted successfully.");
    }
}
