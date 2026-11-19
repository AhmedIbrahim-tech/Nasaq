using Domain.Enums;
using Domain.Identity;

namespace Domain.Entities;

public class AppNotification
{
    public Guid Notification_ID { get; set; } = Guid.NewGuid();

    public string User_ID { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public NotificationCategory Category { get; set; } = NotificationCategory.Info;

    public string? Action_Url { get; set; }

    public bool Is_Read { get; set; }

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;

    public virtual ApplicationUser? User { get; set; }
}
