using Domain.Common;
using Domain.Enums;
using Domain.Identity;

namespace Domain.Entities;

public class ForgotPasswordRequest : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string UserId { get; set; } = string.Empty;
    public virtual ApplicationUser? User { get; set; }

    public Guid? EmployeeId { get; set; }
    public virtual Employee? Employee { get; set; }

    public string Email { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }

    public PasswordRecoveryStatus Status { get; set; } = PasswordRecoveryStatus.Pending;

    public DateTime RequestedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAtUtc { get; set; }
    public string? ReviewedBy { get; set; }
    public string? RejectionReason { get; set; }

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }
}
