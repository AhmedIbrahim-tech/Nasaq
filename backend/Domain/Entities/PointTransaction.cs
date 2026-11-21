using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class PointTransaction : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid EmployeeId { get; set; }
    public virtual Employee? Employee { get; set; }

    public Guid? RuleId { get; set; }
    public virtual PointRule? Rule { get; set; }

    public PointCategory Category { get; set; }
    public PointEventType EventType { get; set; }

    /// <summary>
    /// Signed points: positive for Green, negative for Red/Black.
    /// </summary>
    public int Points { get; set; }

    public PointTransactionStatus Status { get; set; } = PointTransactionStatus.Finalized;

    public string? SourceEventType { get; set; }
    public Guid? SourceEventId { get; set; }

    public DateOnly Date { get; set; }
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;

    public string Reason { get; set; } = string.Empty;

    // For auditable reversals
    public Guid? RelatedTransactionId { get; set; }
    public virtual PointTransaction? RelatedTransaction { get; set; }

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }
}
