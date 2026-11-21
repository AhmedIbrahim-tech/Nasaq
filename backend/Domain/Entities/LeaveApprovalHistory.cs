using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class LeaveApprovalHistory : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid LeaveRequestId { get; set; }
    public virtual LeaveRequest? LeaveRequest { get; set; }

    public string ActorId { get; set; } = string.Empty;
    public string ActorName { get; set; } = string.Empty;

    public LeaveApprovalAction Action { get; set; }
    public string? Comments { get; set; }
    public DateTime ActionDateUtc { get; set; } = DateTime.UtcNow;

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }
}
