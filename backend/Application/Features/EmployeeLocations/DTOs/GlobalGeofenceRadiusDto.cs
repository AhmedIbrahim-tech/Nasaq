namespace Application.Features.EmployeeLocations.DTOs;

public class GlobalGeofenceRadiusDto
{
    public double RadiusMeters { get; set; } = 50.0;
    public DateTime? LastUpdatedUtc { get; set; }
    public string? UpdatedBy { get; set; }
}
