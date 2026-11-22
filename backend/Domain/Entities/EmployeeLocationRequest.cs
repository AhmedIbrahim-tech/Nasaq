using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class EmployeeLocationRequest : IAuditableEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid EmployeeId { get; set; }
    public virtual Employee? Employee { get; set; }

    public LocationRequestType RequestType { get; set; } = LocationRequestType.InitialRegistration;

    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? AccuracyMeters { get; set; }
    public string? AddressDescription { get; set; }

    public LocationRequestStatus Status { get; set; } = LocationRequestStatus.Pending;
    public string? RejectionReason { get; set; }

    public DateTime? ReviewedAtUtc { get; set; }
    public string? ReviewedBy { get; set; }
    public string? AdminNotes { get; set; }

    public DateTime Created_Utc { get; set; } = DateTime.UtcNow;
    public string? Created_By { get; set; }
    public DateTime? Updated_Utc { get; set; }
    public string? Updated_By { get; set; }
}
