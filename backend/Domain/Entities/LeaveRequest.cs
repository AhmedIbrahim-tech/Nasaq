using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class LeaveRequest : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid EmployeeId { get; set; }
    public virtual Employee? Employee { get; set; }

    public Guid LeaveTypeId { get; set; }
    public virtual LeaveType? LeaveType { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int DaysCount { get; set; }

    public string? Reason { get; set; }
    public Guid? AttachmentFileId { get; set; }

    public LeaveRequestStatus Status { get; set; } = LeaveRequestStatus.Pending;

    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAtUtc { get; set; }
    public string? ReviewedBy { get; set; }
    public string? ReviewNotes { get; set; }

    public virtual ICollection<LeaveApprovalHistory> ApprovalHistory { get; set; } = new List<LeaveApprovalHistory>();

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }
}
