namespace Domain.Entities;

public class EmployeeScheduleAssignment : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid EmployeeId { get; set; }
    public virtual Employee? Employee { get; set; }

    public Guid WorkScheduleId { get; set; }
    public virtual WorkSchedule? Schedule { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public bool IsActive { get; set; } = true;

    public string? Notes { get; set; }

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }
}
