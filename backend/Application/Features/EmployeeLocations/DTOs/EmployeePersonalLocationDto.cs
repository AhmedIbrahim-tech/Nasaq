namespace Application.Features.EmployeeLocations.DTOs;

public class EmployeePersonalLocationDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? AccuracyMeters { get; set; }
    public string? AddressDescription { get; set; }
    public bool IsApproved { get; set; }
    public DateTime? ApprovedAtUtc { get; set; }
    public string? ApprovedBy { get; set; }
    public bool IsActive { get; set; }
    public string? Source { get; set; }
    public DateTime Created_Utc { get; set; }
}
