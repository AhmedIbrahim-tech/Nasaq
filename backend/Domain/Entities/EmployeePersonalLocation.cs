using Domain.Common;

namespace Domain.Entities;

public class EmployeePersonalLocation : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid EmployeeId { get; set; }
    public virtual Employee? Employee { get; set; }

    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? AccuracyMeters { get; set; }
    public string? AddressDescription { get; set; }

    public bool IsApproved { get; set; }
    public DateTime? ApprovedAtUtc { get; set; }
    public string? ApprovedBy { get; set; }

    public bool IsActive { get; set; } = true;
    public string? Source { get; set; }

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }
}
