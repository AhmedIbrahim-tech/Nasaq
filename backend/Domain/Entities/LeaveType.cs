using Domain.Common;

namespace Domain.Entities;

public class LeaveType : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get => Name; set => Name = value; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DescriptionAr { get; set; }

    public bool IsPaid { get; set; } = true;
    public bool RequiresAttachment { get; set; } = false;
    public int? DefaultDaysPerYear { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }

    public string GetName(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(NameAr)
            ? NameAr
            : Name;

    public string? GetDescription(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(DescriptionAr)
            ? DescriptionAr
            : Description;
}
