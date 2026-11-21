namespace Domain.Entities;

public class WorkSchedule : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string? NameAr { get; set; }

    public string NameEn { get => Name; set => Name = value; }

    public string? Description { get; set; }

    public string? DescriptionAr { get; set; }

    public bool IsActive { get; set; } = true;

    public bool IsDefault { get; set; } = false;

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }

    public virtual ICollection<WorkScheduleDay> Days { get; set; } = new List<WorkScheduleDay>();

    public virtual ICollection<EmployeeScheduleAssignment> EmployeeAssignments { get; set; } = new List<EmployeeScheduleAssignment>();

    public string GetName(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(NameAr)
            ? NameAr
            : Name;

    public string? GetDescription(string? language = null) =>
        language?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(DescriptionAr)
            ? DescriptionAr
            : Description;
}
