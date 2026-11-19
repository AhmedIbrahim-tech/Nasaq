using Domain.Enums;

namespace Application.Common;

public sealed record NotificationItem(
    Guid Id,
    string Title,
    string Message,
    NotificationCategory Category,
    string? ActionUrl,
    bool IsRead,
    DateTime CreatedUtc);
