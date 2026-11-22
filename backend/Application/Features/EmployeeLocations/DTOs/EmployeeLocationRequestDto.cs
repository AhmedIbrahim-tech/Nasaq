using Domain.Enums;

namespace Application.Features.EmployeeLocations.DTOs;

public class EmployeeLocationRequestDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public string? EmployeeNameAr { get; set; }
    public string? EmployeeCode { get; set; }
    public LocationRequestType RequestType { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double? AccuracyMeters { get; set; }
    public string? AddressDescription { get; set; }
    public LocationRequestStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? ReviewedAtUtc { get; set; }
    public string? ReviewedBy { get; set; }
    public string? AdminNotes { get; set; }
    public DateTime Created_Utc { get; set; }
}
